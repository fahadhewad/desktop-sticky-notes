import { useMemo, useState } from 'react'
import { VERBS, type SpanishVerb } from '../../data/verbs'
import { Badge, BackButton, Chip, VerbCard } from './ui'

type Filter = 'all' | 'regular' | 'irregular' | 'learned'

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

interface Props {
  learnedCount: number
  open: SpanishVerb | null
  onOpen: (verb: SpanishVerb | null) => void
}

// All 500 verbs: search by Spanish or English, filter by regular / irregular.
export default function VerbsTab({ learnedCount, open, onOpen }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const list = useMemo(() => {
    const q = fold(query.trim())
    return VERBS.filter((v) => {
      if (filter === 'regular' && !v.regular) return false
      if (filter === 'irregular' && v.regular) return false
      if (filter === 'learned' && v.rank > learnedCount) return false
      return !q || fold(v.infinitive).includes(q) || fold(v.english).includes(q)
    })
  }, [query, filter, learnedCount])

  if (open) {
    return (
      <div>
        <BackButton onClick={() => onOpen(null)}>All verbs</BackButton>
        <VerbCard
          key={open.infinitive}
          verb={open}
          eyebrow={`#${open.rank} most common${open.rank <= learnedCount ? ' · learned' : ''}`}
        />
      </div>
    )
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in Spanish or English…"
        aria-label="Search verbs"
        className="w-full rounded-lg border border-line bg-transparent px-3 py-1.5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
      />
      <div className="mb-2 mt-2 flex items-center gap-1">
        {(['all', 'regular', 'irregular', 'learned'] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </Chip>
        ))}
        <span className="ml-auto text-[11px] text-ink-soft">{list.length} verbs</span>
      </div>
      <div className="space-y-0.5">
        {list.map((v) => (
          <button
            key={v.infinitive}
            onClick={() => onOpen(v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-glass"
          >
            <span className="w-7 shrink-0 text-right text-[10px] text-ink-soft">{v.rank}</span>
            <span className="w-24 shrink-0 truncate text-sm font-medium text-ink">{v.infinitive}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">{v.english}</span>
            {v.rank <= learnedCount && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" aria-label="Learned">
                <path d="M5 12l5 5L20 6" />
              </svg>
            )}
            <Badge regular={v.regular} />
          </button>
        ))}
        {list.length === 0 && <p className="mt-6 text-center text-xs text-ink-soft">No verbs match.</p>}
      </div>
    </div>
  )
}

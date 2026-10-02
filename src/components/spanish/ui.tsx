import { createContext, useContext, useState } from 'react'
import type { Tense } from '../../data/conjugate'
import { IMPERATIVE_LABELS, LATAM_EXAMPLES, PRONOUN_LABELS, WORD_NOTES, type Dialect } from '../../data/dialects'
import { conjugationOf, type SpanishVerb } from '../../data/verbs'
import { tensesFor } from './practice'

// Which Spanish the learner picked; everything below adapts to it.
export const DialectContext = createContext<Dialect>('spain')
export const useDialect = () => useContext(DialectContext)

export const TENSE_LABEL: Record<Tense, string> = {
  present: 'Present',
  progressive: 'Progressive',
  preterite: 'Preterite',
  imperfect: 'Imperfect',
  future: 'Future',
  conditional: 'Conditional',
  perfect: 'Perfect',
  imperative: 'Imperative',
  subjunctive: 'Subjunctive',
  impSubjunctive: 'Imp. subjunctive',
}

// Labels per person; an empty label hides it (no vosotros in Latin America).
export const pronounsFor = (tense: Tense, verb: SpanishVerb | undefined, dialect: Dialect): readonly string[] =>
  verb?.spec.only3
    ? ['', '', 'it', '', '', 'they']
    : tense === 'imperative'
      ? IMPERATIVE_LABELS[dialect]
      : PRONOUN_LABELS[dialect]

export function Badge({ regular }: { regular: boolean }) {
  return (
    <span
      className="shrink-0 rounded-full border px-1.5 py-px text-[10px] font-medium"
      style={{
        borderColor: regular ? 'var(--line)' : 'var(--accent)',
        color: regular ? 'var(--ink-soft)' : 'var(--accent)',
        backgroundColor: regular ? 'transparent' : 'var(--accent-soft)',
      }}
    >
      {regular ? 'Regular' : 'Irregular'}
    </span>
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 mt-4 text-[11px] font-medium uppercase tracking-wider text-ink-soft">{children}</p>
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors"
      style={{
        borderColor: active ? 'var(--accent)' : 'var(--line)',
        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--ink-soft)',
      }}
    >
      {children}
    </button>
  )
}

// One tense of one verb as a pronoun → form grid.
export function ConjugationGrid({ verb, tense }: { verb: SpanishVerb; tense: Tense }) {
  const forms = conjugationOf(verb).forms[tense]
  const pronouns = pronounsFor(tense, verb, useDialect())
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
      {forms.map((form, i) =>
        form && pronouns[i] ? (
          <div key={i} className="flex items-baseline justify-between gap-2 border-b border-line pb-1">
            <span className="text-xs text-ink-soft">{pronouns[i]}</span>
            <span className="text-sm font-medium text-ink">{form}</span>
          </div>
        ) : null,
      )}
    </div>
  )
}

// A verb with its label, example and a tense-by-tense conjugation table.
export function VerbCard({ verb, eyebrow }: { verb: SpanishVerb; eyebrow?: string }) {
  const tenses = tensesFor(verb)
  const [tense, setTense] = useState<Tense>('present')
  const c = conjugationOf(verb)
  const dialect = useDialect()
  const example = (dialect === 'latam' && LATAM_EXAMPLES[verb.infinitive]) || verb.example
  const wordNote = WORD_NOTES[verb.infinitive]?.[dialect]
  return (
    <div>
      {eyebrow && <p className="text-[11px] uppercase tracking-wider text-ink-soft">{eyebrow}</p>}
      <div className="mt-1 flex items-center gap-2">
        <h3 className="text-2xl font-semibold text-ink">{verb.infinitive}</h3>
        <Badge regular={verb.regular} />
      </div>
      <p className="text-sm text-accent">{verb.english}</p>
      {verb.notes.length > 0 && <p className="mt-0.5 text-[11px] text-ink-soft">{verb.notes.join(' · ')}</p>}
      {wordNote && (
        <p className="mt-2 rounded-lg border border-line bg-accent-soft px-2.5 py-1.5 text-[11px] text-ink">{wordNote}</p>
      )}

      <div className="mt-3 rounded-xl border border-line bg-glass p-3">
        <p className="text-sm text-ink">{example.es}</p>
        <p className="mt-0.5 text-xs italic text-ink-soft">{example.en}</p>
      </div>

      <div className="mb-2 mt-4 flex flex-wrap gap-1">
        {tenses.map((t) => (
          <Chip key={t} active={tense === t} onClick={() => setTense(t)}>
            {TENSE_LABEL[t]}
          </Chip>
        ))}
      </div>
      <ConjugationGrid verb={verb} tense={tenses.includes(tense) ? tense : 'present'} />
      <p className="mt-2 text-[11px] text-ink-soft">
        Gerund <span className="text-ink">{c.gerund}</span> · Past participle{' '}
        <span className="text-ink">{c.participle}</span>
      </p>
    </div>
  )
}

export function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mb-2 flex items-center gap-1 text-[11px] font-medium text-ink-soft transition-colors hover:text-accent"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {children}
    </button>
  )
}

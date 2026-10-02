import { useState } from 'react'
import type { Tense } from '../../data/conjugate'
import { TENSES, type TenseLesson } from '../../data/tenses'
import { conjugationOf, VERBS, type SpanishVerb } from '../../data/verbs'
import { LESSON_NOTE } from '../../data/dialects'
import { BackButton, Chip, ConjugationGrid, Label, pronounsFor, useDialect } from './ui'

const byInfinitive = (inf: string) => VERBS.find((v) => v.infinitive === inf)!
const MODELS = ['hablar', 'comer', 'vivir'].map(byInfinitive)

const LEVEL_COLOR: Record<TenseLesson['level'], string> = {
  Beginner: '#9ece6a',
  Intermediate: 'var(--accent)',
  Advanced: '#bb9af7',
}

interface Props {
  openId: Tense | null
  onOpen: (id: Tense | null) => void
  onPractice: (id: Tense) => void
}

// Lessons that teach each tense: when to use it, how it's built, what's
// irregular, with generated tables for model and key irregular verbs.
export default function TensesTab({ openId, onOpen, onPractice }: Props) {
  const lesson = TENSES.find((t) => t.id === openId)
  if (lesson) return <Lesson lesson={lesson} onBack={() => onOpen(null)} onPractice={() => onPractice(lesson.id)} />

  return (
    <div className="space-y-1.5">
      <p className="mb-2 text-xs text-ink-soft">
        Ten tenses, roughly in the order you'd learn them. Open one for a short lesson, then practise it.
      </p>
      {TENSES.map((t, i) => (
        <button
          key={t.id}
          onClick={() => onOpen(t.id)}
          className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2 text-left transition-colors hover:border-accent hover:bg-glass"
        >
          <span className="w-4 shrink-0 text-right text-[11px] text-ink-soft">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-ink">{t.name}</span>
              <span className="truncate pr-1 text-[11px] italic text-ink-soft">{t.spanish}</span>
            </span>
            <span className="block truncate text-[11px] text-ink-soft">{t.summary}</span>
          </span>
          <span className="shrink-0 text-[10px] font-medium" style={{ color: LEVEL_COLOR[t.level] }}>
            {t.level}
          </span>
        </button>
      ))}
    </div>
  )
}

function Lesson({ lesson, onBack, onPractice }: { lesson: TenseLesson; onBack: () => void; onPractice: () => void }) {
  const [keyVerb, setKeyVerb] = useState<SpanishVerb>(() => byInfinitive(lesson.keyVerbs[0]))
  const dialect = useDialect()
  const pronouns = pronounsFor(lesson.id, undefined, dialect)
  const rows = pronouns.map((p, i) => ({ p, i })).filter(({ p }) => p)

  return (
    <div>
      <BackButton onClick={onBack}>All tenses</BackButton>
      <div className="flex items-baseline gap-2">
        <h3 className="text-xl font-semibold text-ink">{lesson.name}</h3>
        <span className="text-sm italic text-ink-soft">{lesson.spanish}</span>
        <span className="ml-auto text-[10px] font-medium" style={{ color: LEVEL_COLOR[lesson.level] }}>
          {lesson.level}
        </span>
      </div>
      <p className="text-sm text-accent">{lesson.summary}</p>

      <Label>When to use it</Label>
      <ul className="space-y-1.5">
        {lesson.uses.map((u) => (
          <li key={u.es} className="text-xs text-ink">
            <span className="text-ink-soft">{u.text}: </span>
            <span className="font-medium">{u.es}</span> <span className="italic text-ink-soft">{u.en}</span>
          </li>
        ))}
      </ul>

      <Label>How to form it</Label>
      <p className="text-xs leading-relaxed text-ink">{lesson.formation}</p>
      {LESSON_NOTE[dialect] && (
        <p className="mt-2 rounded-lg border border-line bg-accent-soft px-2.5 py-1.5 text-[11px] text-ink">
          {LESSON_NOTE[dialect]}
        </p>
      )}
      {lesson.endings && (
        <div className="mt-2 overflow-x-auto rounded-xl border border-line bg-glass p-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-ink-soft">
                <th className="px-2 py-1 text-left font-medium" />
                {lesson.endings.map((e) => (
                  <th key={e.label} className="px-2 py-1 text-left font-medium">
                    {e.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, i }) => (
                <tr key={p} className="border-t border-line">
                  <td className="px-2 py-1 text-ink-soft">{p}</td>
                  {lesson.endings!.map((e) => (
                    <td key={e.label} className="px-2 py-1 font-medium text-accent">
                      {e.forms[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Label>Regular verbs in full</Label>
      <div className="overflow-x-auto rounded-xl border border-line bg-glass p-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-ink-soft">
              <th className="px-2 py-1 text-left font-medium" />
              {MODELS.map((v) => (
                <th key={v.infinitive} className="px-2 py-1 text-left font-medium normal-case">
                  {v.infinitive}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, i }) => (
              <tr key={p} className="border-t border-line">
                <td className="px-2 py-1 text-ink-soft">{p}</td>
                {MODELS.map((v) => (
                  <td key={v.infinitive} className="whitespace-nowrap px-2 py-1 text-ink">
                    {conjugationOf(v).forms[lesson.id][i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Label>Watch out for</Label>
      <p className="text-xs leading-relaxed text-ink">{lesson.irregulars}</p>
      <div className="scroll-area -mx-1 mb-2 mt-2 flex gap-1 overflow-x-auto px-1 pb-1">
        {lesson.keyVerbs.map((inf) => (
          <Chip key={inf} active={keyVerb.infinitive === inf} onClick={() => setKeyVerb(byInfinitive(inf))}>
            {inf}
          </Chip>
        ))}
      </div>
      <ConjugationGrid verb={keyVerb} tense={lesson.id} />

      {lesson.tip && (
        <div className="mt-4 rounded-xl border border-line bg-accent-soft px-3 py-2 text-xs text-ink">
          <span className="font-semibold text-accent">Tip </span>
          {lesson.tip}
        </div>
      )}

      <Label>Examples</Label>
      <div className="space-y-1.5">
        {lesson.examples.map((ex) => (
          <div key={ex.es}>
            <p className="text-sm text-ink">{ex.es}</p>
            <p className="text-xs italic text-ink-soft">{ex.en}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onPractice}
        className="mt-4 w-full rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Practise the {lesson.name.toLowerCase()} →
      </button>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PRONOUNS, VERBS, type SpanishVerb } from '../data/verbs'

interface Props {
  learnedCount: number
  onClose: () => void
}

// Lowercase, trim, strip accents — so answers are forgiving about accent marks.
const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

type Question =
  | { verb: SpanishVerb; kind: 'translate' }
  | { verb: SpanishVerb; kind: 'conjugate'; person: number }

function makeQuestion(learned: SpanishVerb[]): Question {
  const verb = learned[Math.floor(Math.random() * learned.length)]
  if (Math.random() < 0.5) return { verb, kind: 'translate' }
  return { verb, kind: 'conjugate', person: Math.floor(Math.random() * 6) }
}

// Accept any of the listed meanings, with or without a leading "to" and ignoring
// parentheticals like "(facts)".
function checkTranslate(verb: SpanishVerb, answer: string): boolean {
  const a = strip(answer).replace(/^to\s+/, '')
  if (!a) return false
  return verb.english
    .split('/')
    .map((p) => strip(p).replace(/\(.*?\)/g, '').replace(/^to\s+/, '').trim())
    .some((t) => t === a)
}

export default function SpanishPanel({ learnedCount, onClose }: Props) {
  const [tab, setTab] = useState<'today' | 'practice'>('today')
  const learned = VERBS.slice(0, Math.max(0, learnedCount))
  const todayVerb = learned[learned.length - 1]

  const [question, setQuestion] = useState<Question | null>(() =>
    learned.length ? makeQuestion(learned) : null,
  )
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<{ ok: boolean; correct: string } | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const submit = () => {
    if (!question || result) return
    let ok = false
    let correct = ''
    if (question.kind === 'translate') {
      ok = checkTranslate(question.verb, answer)
      correct = question.verb.english
    } else {
      correct = question.verb.present[question.person]
      ok = strip(answer) === strip(correct)
    }
    setResult({ ok, correct })
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))
  }
  const next = () => {
    setAnswer('')
    setResult(null)
    setQuestion(learned.length ? makeQuestion(learned) : null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="no-drag m-3 flex flex-1 flex-col overflow-hidden rounded-xl2 border border-line bg-glass-strong p-4 backdrop-blur-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TabBtn active={tab === 'today'} onClick={() => setTab('today')}>
              Today
            </TabBtn>
            <TabBtn active={tab === 'practice'} onClick={() => setTab('practice')}>
              Practice
            </TabBtn>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft transition-colors hover:text-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
          {tab === 'today' ? (
            todayVerb ? (
              <TodayCard verb={todayVerb} day={learnedCount} />
            ) : (
              <p className="mt-6 text-center text-sm text-ink-soft">
                Your first verb unlocks today — reopen in a moment.
              </p>
            )
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wider text-ink-soft">
                  Practice · {learned.length} learned
                </p>
                <p className="text-xs text-ink-soft">
                  {score.correct}/{score.total}
                </p>
              </div>
              {!question ? (
                <p className="mt-6 text-center text-sm text-ink-soft">
                  Learn your first verb today, then come back to practice.
                </p>
              ) : (
                <div className="rounded-xl border border-line bg-glass p-4">
                  <p className="text-sm text-ink">
                    {question.kind === 'translate' ? (
                      <>
                        What does{' '}
                        <span className="font-semibold text-accent">{question.verb.infinitive}</span> mean?
                      </>
                    ) : (
                      <>
                        Conjugate{' '}
                        <span className="font-semibold text-accent">{question.verb.infinitive}</span> for{' '}
                        <span className="font-semibold text-accent">{PRONOUNS[question.person]}</span>
                      </>
                    )}
                  </p>
                  <input
                    key={`${question.verb.infinitive}-${question.kind}-${result ? 'r' : 'q'}`}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (result ? next() : submit())
                    }}
                    autoFocus
                    disabled={!!result}
                    placeholder={question.kind === 'translate' ? 'English meaning…' : 'Spanish form…'}
                    className="mt-3 w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none disabled:opacity-60"
                  />
                  {result && (
                    <p className="mt-2 text-xs font-medium" style={{ color: result.ok ? 'var(--accent)' : '#f6736b' }}>
                      {result.ok ? '✓ Correct!' : `✗ Answer: ${result.correct}`}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={result ? next : submit}
                      className="rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent transition-transform hover:scale-105 active:scale-95"
                    >
                      {result ? 'Next' : 'Check'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function TabBtn({
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
      className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--ink-soft)',
      }}
    >
      {children}
    </button>
  )
}

function TodayCard({ verb, day }: { verb: SpanishVerb; day: number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-soft">
        Verb {day} of {VERBS.length}
      </p>
      <h3 className="mt-1 text-2xl font-semibold text-ink">{verb.infinitive}</h3>
      <p className="text-sm text-accent">{verb.english}</p>

      <div className="mt-3 rounded-xl border border-line bg-glass p-3">
        <p className="text-sm text-ink">{verb.example.es}</p>
        <p className="mt-0.5 text-xs italic text-ink-soft">{verb.example.en}</p>
      </div>

      <p className="mb-2 mt-4 text-[11px] uppercase tracking-wider text-ink-soft">Present tense</p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {PRONOUNS.map((p, i) => (
          <div key={p} className="flex items-baseline justify-between border-b border-line pb-1">
            <span className="text-xs text-ink-soft">{p}</span>
            <span className="text-sm font-medium text-ink">{verb.present[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

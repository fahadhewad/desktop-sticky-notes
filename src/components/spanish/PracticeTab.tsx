import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { VERBS } from '../../data/verbs'
import type { PracticeMode, PracticePrefs } from '../../types'
import { checkAnswer, QuestionDeck, usableVerbs, type Question, type Result } from './practice'
import { Badge, ConjugationGrid, pronounsFor, TENSE_LABEL } from './ui'
import { TENSES } from '../../data/tenses'

interface Props {
  learnedCount: number
  prefs: PracticePrefs
  onPrefs: (prefs: PracticePrefs) => void
}

const POOLS = [25, 50, 100, 250, 500]

// Buttons shouldn't pull focus away from the answer box.
const keepFocus = (e: React.MouseEvent) => e.preventDefault()

const selectClass =
  'min-w-0 rounded-lg border border-line bg-transparent px-2 py-1 text-[11px] text-ink focus:border-accent focus:outline-none [&_optgroup]:text-black [&_option]:text-black'

export default function PracticeTab({ learnedCount, prefs, onPrefs }: Props) {
  // The verbs to practise, filtered by pool, regular / irregular and mode.
  const verbs = useMemo(() => {
    const pool = VERBS.slice(0, prefs.pool === 'learned' ? learnedCount : prefs.pool)
    const kind = prefs.kind === 'all' ? pool : pool.filter((v) => v.regular === (prefs.kind === 'regular'))
    return usableVerbs(kind, prefs.mode)
  }, [prefs, learnedCount])

  // A fresh deck whenever the settings change.
  const deck = useMemo(() => new QuestionDeck(verbs, prefs.mode), [verbs, prefs.mode])
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuestion(deck.next())
    setAnswer('')
    setResult(null)
  }, [deck])

  // Keep the answer box focused (even after clicking a button), so Enter
  // always means "check" and then "next".
  const refocus = () => requestAnimationFrame(() => inputRef.current?.focus())

  const check = () => {
    refocus()
    if (!question || result || !answer.trim()) return
    const r = checkAnswer(question, answer)
    setResult(r)
    if (!r.ok) deck.missed(question)
    setScore((s) => ({ correct: s.correct + (r.ok ? 1 : 0), total: s.total + 1, streak: r.ok ? s.streak + 1 : 0 }))
  }
  const reveal = () => {
    refocus()
    if (!question || result) return
    const r = checkAnswer(question, '')
    setResult(r)
    deck.missed(question)
    setScore((s) => ({ ...s, total: s.total + 1, streak: 0 }))
  }
  const next = () => {
    setQuestion(deck.next())
    setAnswer('')
    setResult(null)
    refocus()
  }

  const set = (patch: Partial<PracticePrefs>) => onPrefs({ ...prefs, ...patch })

  return (
    <div>
      {/* settings */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <select
          value={prefs.mode}
          onChange={(e) => set({ mode: e.target.value as PracticeMode })}
          className={selectClass}
          aria-label="What to practise"
        >
          <option value="basics">Meanings + present</option>
          <option value="meaning">Meanings only</option>
          <option value="all">All tenses mixed</option>
          <optgroup label="One tense">
            {TENSES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
        </select>
        <select
          value={String(prefs.pool)}
          onChange={(e) => set({ pool: e.target.value === 'learned' ? 'learned' : Number(e.target.value) })}
          className={selectClass}
          aria-label="Which verbs"
        >
          <option value="learned">My verbs ({learnedCount})</option>
          {POOLS.map((n) => (
            <option key={n} value={n}>
              Top {n}
            </option>
          ))}
        </select>
        <select
          value={prefs.kind}
          onChange={(e) => set({ kind: e.target.value as PracticePrefs['kind'] })}
          className={selectClass}
          aria-label="Regular or irregular"
        >
          <option value="all">Regular + irregular</option>
          <option value="regular">Regular only</option>
          <option value="irregular">Irregular only</option>
        </select>
        <span className="ml-auto text-xs text-ink-soft" title="Correct / answered · streak">
          {score.correct}/{score.total}
          {score.streak >= 3 && <span className="text-accent"> · {score.streak} in a row</span>}
        </span>
      </div>

      {!question ? (
        <p className="mt-6 text-center text-sm text-ink-soft">
          {prefs.pool === 'learned' && learnedCount === 0
            ? 'Learn your first verb today, or pick “Top 25” to start practising.'
            : 'No verbs match these settings. Try a bigger pool.'}
        </p>
      ) : (
        <div className="rounded-xl border border-line bg-glass p-4">
          <Prompt q={question} />
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => !result && setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              if (result) next()
              else check()
            }}
            autoFocus
            readOnly={!!result}
            spellCheck={false}
            autoComplete="off"
            placeholder={
              question.kind === 'meaning'
                ? question.dir === 'es-en'
                  ? 'English meaning…'
                  : 'Spanish infinitive…'
                : 'Spanish form…'
            }
            className="mt-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none"
            style={{
              borderColor: result ? (result.ok ? 'var(--accent)' : '#f6736b') : 'var(--line)',
            }}
          />

          {result && <Feedback q={question} r={result} />}

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[10px] text-ink-soft">
              {result ? 'Press Enter for the next one' : 'Press Enter to check'}
              {verbs.length < 4 && ` · only ${verbs.length} verb${verbs.length === 1 ? '' : 's'} in this pool`}
            </span>
            <div className="flex gap-1.5">
              {!result && (
                <button
                  onMouseDown={keepFocus}
                  onClick={reveal}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  Show answer
                </button>
              )}
              <button
                onMouseDown={keepFocus}
                onClick={result ? next : check}
                className="rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent transition-transform hover:scale-105 active:scale-95"
              >
                {result ? 'Next' : 'Check'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Prompt({ q }: { q: Question }) {
  const verb = <span className="font-semibold text-accent">{q.verb.infinitive}</span>
  if (q.kind === 'meaning') {
    return q.dir === 'es-en' ? (
      <p className="text-sm text-ink">What does {verb} mean?</p>
    ) : (
      <p className="text-sm text-ink">
        How do you say <span className="font-semibold text-accent">{q.verb.english}</span> in Spanish?
      </p>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-ink">
          {verb} in the <span className="font-semibold text-ink">{TENSE_LABEL[q.tense].toLowerCase()}</span> for{' '}
          <span className="font-semibold text-accent">{pronounsFor(q.tense, q.verb)[q.person]}</span>
        </p>
        <Badge regular={q.verb.regular} />
      </div>
      <p className="mt-0.5 text-[11px] text-ink-soft">{q.verb.english}</p>
    </div>
  )
}

function Feedback({ q, r }: { q: Question; r: Result }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
      <p className="text-xs font-medium" style={{ color: r.ok ? 'var(--accent)' : '#f6736b' }}>
        {r.ok
          ? r.exact
            ? '✓ Correct!'
            : `✓ Correct · with accents: ${r.expected}`
          : `✗ The answer is ${r.expected}`}
      </p>
      {/* On a miss, show the whole tense so the pattern sticks. */}
      {!r.ok && q.kind === 'conjugate' && (
        <div className="mt-2 rounded-lg border border-line p-2">
          <ConjugationGrid verb={q.verb} tense={q.tense} />
        </div>
      )}
    </motion.div>
  )
}

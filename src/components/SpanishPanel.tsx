import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Tense } from '../data/conjugate'
import { VERBS, type SpanishVerb } from '../data/verbs'
import type { PracticePrefs, SpanishProgress } from '../types'
import PracticeTab from './spanish/PracticeTab'
import TensesTab from './spanish/TensesTab'
import VerbsTab from './spanish/VerbsTab'
import { DialectContext, VerbCard } from './spanish/ui'
import { DIALECT_LABEL, type Dialect } from '../data/dialects'

interface Props {
  spanish: SpanishProgress
  setSpanish: React.Dispatch<React.SetStateAction<SpanishProgress>>
  onClose: () => void
}

type Tab = 'today' | 'tenses' | 'practice' | 'verbs'

export default function SpanishPanel({ spanish, setSpanish, onClose }: Props) {
  const { learnedCount } = spanish
  const [tab, setTab] = useState<Tab>('today')
  const [lesson, setLesson] = useState<Tense | null>(null)
  const [openVerb, setOpenVerb] = useState<SpanishVerb | null>(null)
  const todayVerb = VERBS[Math.min(learnedCount, VERBS.length) - 1]
  const dialect: Dialect = spanish.dialect ?? 'spain'
  const setDialect = (d: Dialect) => setSpanish((s) => ({ ...s, dialect: d }))

  const prefs: PracticePrefs = spanish.practice ?? {
    mode: 'basics',
    pool: learnedCount >= 5 ? 'learned' : 25,
    kind: 'all',
  }
  const setPrefs = (practice: PracticePrefs) => setSpanish((s) => ({ ...s, practice }))

  // Unlock the next verb early (the daily one still arrives tomorrow).
  const learnAnother = () => setSpanish((s) => ({ ...s, learnedCount: Math.min(VERBS.length, s.learnedCount + 1) }))

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
            {(
              [
                ['today', 'Today'],
                ['tenses', 'Tenses'],
                ['practice', 'Practice'],
                ['verbs', 'Verbs'],
              ] as const
            ).map(([id, label]) => (
              <TabBtn key={id} active={tab === id} onClick={() => setTab(id)}>
                {label}
              </TabBtn>
            ))}
          </div>
          <div className="ml-auto mr-3 flex items-center rounded-lg border border-line p-0.5" title="Which Spanish to learn">
            {(['spain', 'latam'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDialect(d)}
                aria-pressed={dialect === d}
                className="rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: dialect === d ? 'var(--accent-soft)' : 'transparent',
                  color: dialect === d ? 'var(--accent)' : 'var(--ink-soft)',
                }}
              >
                {DIALECT_LABEL[d]}
              </button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft transition-colors hover:text-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <DialectContext.Provider value={dialect}>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
            {tab === 'today' &&
              (todayVerb ? (
                <div>
                  <VerbCard key={todayVerb.infinitive} verb={todayVerb} eyebrow={`Verb ${learnedCount} of ${VERBS.length}`} />
                  {learnedCount < VERBS.length && (
                    <button
                      onClick={learnAnother}
                      className="mt-4 w-full rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      Learn another verb now
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-ink-soft">
                  Your first verb unlocks today. Reopen in a moment.
                </p>
              ))}
            {tab === 'tenses' && (
              <TensesTab
                openId={lesson}
                onOpen={setLesson}
                onPractice={(id) => {
                  setPrefs({ ...prefs, mode: id })
                  setTab('practice')
                }}
              />
            )}
            {tab === 'practice' && <PracticeTab learnedCount={learnedCount} prefs={prefs} onPrefs={setPrefs} />}
            {tab === 'verbs' && <VerbsTab learnedCount={learnedCount} open={openVerb} onOpen={setOpenVerb} />}
          </div>
        </DialectContext.Provider>
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

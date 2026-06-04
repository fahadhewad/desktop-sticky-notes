import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Repeat, ScheduleItem } from '../types'
import { formatTime, relativeDay, REPEAT_LABELS, uid } from '../utils'

interface Props {
  schedule: ScheduleItem[]
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>
  dueIds: Set<string>
  clearDue: (id: string) => void
}

const REPEATS: Repeat[] = ['daily', 'weekdays', 'weekly', 'once']

export default function SchedulePanel({ schedule, setSchedule, dueIds, clearDue }: Props) {
  const [text, setText] = useState('')
  const [time, setTime] = useState('09:00')
  const [repeat, setRepeat] = useState<Repeat>('daily')
  const [adding, setAdding] = useState(false)

  const add = () => {
    const t = text.trim()
    if (!t) return
    setSchedule((prev) =>
      [
        {
          id: uid(),
          text: t,
          time,
          repeat,
          createdAt: Date.now(),
          completionHistory: [],
        },
        ...prev,
      ].sort((a, b) => a.time.localeCompare(b.time)),
    )
    setText('')
    setAdding(false)
  }

  // Logging completion is what feeds future "remind me at my usual time" logic.
  const markDone = (id: string) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, completionHistory: [...s.completionHistory, { completedAt: Date.now() }] }
          : s,
      ),
    )
    clearDue(id)
  }

  const remove = (id: string) => setSchedule((prev) => prev.filter((s) => s.id !== id))

  return (
    <section className="flex min-w-0 flex-1 flex-col p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-ink">Schedule</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="no-drag rounded-lg px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          {adding ? 'Cancel' : '+ New'}
        </button>
      </header>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="no-drag mb-3 overflow-hidden"
          >
            <div className="space-y-2 rounded-xl border border-line bg-glass-strong p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="e.g. Take vitamin pill"
                autoFocus
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-ink focus:outline-none"
                />
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as Repeat)}
                  className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-ink focus:outline-none [&>option]:text-black"
                >
                  {REPEATS.map((r) => (
                    <option key={r} value={r}>
                      {REPEAT_LABELS[r]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={add}
                  className="ml-auto rounded-lg bg-accent-soft px-3 py-1 text-xs font-medium text-accent transition-transform hover:scale-105"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scroll-area -mr-2 flex-1 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {schedule.map((item) => {
            const due = dueIds.has(item.id)
            const lastDone = item.completionHistory.at(-1)?.completedAt
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: due ? [1, 1.015, 1] : 1,
                }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{
                  scale: due ? { repeat: Infinity, duration: 1.8 } : { duration: 0.2 },
                  default: { type: 'spring', stiffness: 420, damping: 32 },
                }}
                className="no-drag group mb-1.5 rounded-xl border px-3 py-2 transition-colors"
                style={{
                  borderColor: due ? 'var(--accent)' : 'var(--line)',
                  backgroundColor: due ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{item.text}</span>
                    <span className="text-[10px] text-ink-soft">
                      {formatTime(item.time)} · {REPEAT_LABELS[item.repeat]}
                      {lastDone ? ` · last done ${relativeDay(lastDone)}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => markDone(item.id)}
                    className="shrink-0 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="shrink-0 text-ink-soft opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {schedule.length === 0 && !adding && (
          <p className="mt-6 text-center text-xs text-ink-soft">
            No reminders yet — add one with “+ New”.
          </p>
        )}
      </div>
    </section>
  )
}

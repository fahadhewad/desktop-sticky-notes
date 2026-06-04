import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../api'
import type { Repeat, ScheduleItem } from '../types'
import {
  formatTime,
  minutesToTimeLabel,
  relativeDay,
  REPEAT_LABELS,
  uid,
  usualCompletionMinutes,
} from '../utils'

interface Props {
  schedule: ScheduleItem[]
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>
  dueIds: Set<string>
  clearDue: (id: string) => void
}

const REPEATS: Repeat[] = ['daily', 'weekdays', 'weekly', 'once']

const byTime = (a: ScheduleItem, b: ScheduleItem) => a.time.localeCompare(b.time)

export default function SchedulePanel({ schedule, setSchedule, dueIds, clearDue }: Props) {
  const [text, setText] = useState('')
  const [time, setTime] = useState('09:00')
  const [repeat, setRepeat] = useState<Repeat>('daily')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editTime, setEditTime] = useState('09:00')
  const [editRepeat, setEditRepeat] = useState<Repeat>('daily')

  const add = () => {
    const t = text.trim()
    if (!t) return
    setSchedule((prev) =>
      [{ id: uid(), text: t, time, repeat, createdAt: Date.now(), completionHistory: [] }, ...prev].sort(
        byTime,
      ),
    )
    setText('')
    setAdding(false)
  }

  // Logging completion is what feeds the "remind me at my usual time" learning.
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

  // Opt a reminder in/out of firing at its learned "usual" time.
  const toggleAdaptive = (id: string) =>
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, adaptive: !s.adaptive } : s)))

  // Re-fire a due reminder after a short delay (handled in the main process).
  const snooze = (id: string, minutes: number) => {
    api.snoozeReminder(id, minutes)
    clearDue(id)
  }

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id)
    setEditText(item.text)
    setEditTime(item.time)
    setEditRepeat(item.repeat)
  }
  const commitEdit = () => {
    if (!editingId) return
    const t = editText.trim()
    setSchedule((prev) =>
      prev
        .map((s) =>
          s.id === editingId ? { ...s, text: t || s.text, time: editTime, repeat: editRepeat } : s,
        )
        .sort(byTime),
    )
    setEditingId(null)
  }
  const cancelEdit = () => setEditingId(null)

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
              <div className="flex flex-wrap items-center gap-2">
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
                  className="ml-auto rounded-lg bg-accent-soft px-3 py-1 text-xs font-medium text-accent transition-transform hover:scale-105 active:scale-95"
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
            const editing = editingId === item.id
            const lastDone = item.completionHistory.at(-1)?.completedAt
            const usual = usualCompletionMinutes(item.completionHistory)
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: due && !editing ? [1, 1.015, 1] : 1,
                }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{
                  scale: due && !editing ? { repeat: Infinity, duration: 1.8 } : { duration: 0.2 },
                  default: { type: 'spring', stiffness: 420, damping: 32 },
                }}
                className="no-drag group mb-1.5 rounded-xl border px-3 py-2 transition-colors"
                style={{
                  borderColor: due && !editing ? 'var(--accent)' : 'var(--line)',
                  backgroundColor: due && !editing ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit()
                        else if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      className="w-full border-b border-accent bg-transparent text-sm text-ink focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                        className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-ink focus:outline-none"
                      />
                      <select
                        value={editRepeat}
                        onChange={(e) => setEditRepeat(e.target.value as Repeat)}
                        className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-ink focus:outline-none [&>option]:text-black"
                      >
                        {REPEATS.map((r) => (
                          <option key={r} value={r}>
                            {REPEAT_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={commitEdit}
                        className="ml-auto rounded-lg bg-accent-soft px-3 py-1 text-xs font-medium text-accent transition-transform hover:scale-105 active:scale-95"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="min-w-0 flex-1 cursor-text"
                      onDoubleClick={() => startEdit(item)}
                      title="Double-click to edit"
                    >
                      <span className="block truncate text-sm text-ink">{item.text}</span>
                      <span className="text-[10px] text-ink-soft">
                        {formatTime(item.time)} · {REPEAT_LABELS[item.repeat]}
                        {usual != null
                          ? ` · ${item.adaptive ? 'adapts to' : 'usually'} ~${minutesToTimeLabel(usual)}`
                          : ''}
                        {lastDone ? ` · last done ${relativeDay(lastDone)}` : ''}
                      </span>
                    </div>
                    {usual != null && (
                      <button
                        onClick={() => toggleAdaptive(item.id)}
                        title={
                          item.adaptive
                            ? `Adapting to your usual time (~${minutesToTimeLabel(usual)})`
                            : 'Adapt to my usual time'
                        }
                        aria-label="Toggle adaptive timing"
                        aria-pressed={item.adaptive ?? false}
                        className="shrink-0 rounded-lg border px-1.5 py-1 transition-colors"
                        style={{
                          borderColor: item.adaptive ? 'var(--accent)' : 'var(--line)',
                          backgroundColor: item.adaptive ? 'var(--accent-soft)' : 'transparent',
                          color: item.adaptive ? 'var(--accent)' : 'var(--ink-soft)',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C12 7 7 12 2 12C7 12 12 17 12 22C12 17 17 12 22 12C17 12 12 7 12 2Z" />
                        </svg>
                      </button>
                    )}
                    {due && (
                      <button
                        onClick={() => snooze(item.id, 10)}
                        title="Snooze 10 minutes"
                        className="shrink-0 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        Snooze
                      </button>
                    )}
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
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {schedule.length === 0 && !adding && (
          <div className="mt-10 flex flex-col items-center gap-2.5 px-4 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-ink-soft opacity-50"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2" />
              <path d="M5 3L2.5 5.5" />
              <path d="M19 3l2.5 2.5" />
            </svg>
            <p className="text-xs text-ink-soft">No reminders yet — add one with “+ New”.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

// "9:00 AM" style label from a "HH:MM" 24h string.
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

// "Added 2h ago" style relative label.
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.round(hr / 24)
  return `${d}d ago`
}

// "today" / "yesterday" / "3 days ago" / "12 Jan" — calendar-day granularity,
// which reads better than "26h ago" for a "last done" label.
export function relativeDay(ts: number): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(ts))) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const REPEAT_LABELS: Record<string, string> = {
  once: 'Once',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
}

// --- smart timing: learn the usual completion time from history ---

// Minutes since midnight for a timestamp.
function minutesOfDay(ts: number): number {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

// A robust "usual" completion time (median minutes-of-day over recent
// completions), or null until there's enough history to be meaningful. The
// median shrugs off the odd late/early completion. Kept in sync with the copy
// in electron/scheduler.js, which fires reminders at this time when adaptive.
export function usualCompletionMinutes(
  history: { completedAt: number }[] | undefined,
  minSamples = 3,
  recent = 20,
): number | null {
  if (!history || history.length < minSamples) return null
  const mins = history
    .slice(-recent)
    .map((h) => minutesOfDay(h.completedAt))
    .sort((a, b) => a - b)
  const mid = Math.floor(mins.length / 2)
  return mins.length % 2 ? mins[mid] : Math.round((mins[mid - 1] + mins[mid]) / 2)
}

// "9:12 AM" from minutes-since-midnight.
export function minutesToTimeLabel(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

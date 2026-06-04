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

export const REPEAT_LABELS: Record<string, string> = {
  once: 'Once',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
}

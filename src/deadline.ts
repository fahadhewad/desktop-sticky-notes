// Forgiving natural-language deadlines for the quick-add box and the to-do
// deadline editor: "tomorrow 5pm", "fri", "in 2 hours", "25 dec", "17:30",
// "next mon 9am", "25/12". Everything runs locally; no libraries.

export type DeadlineParse = { ok: true; due?: number } | { ok: false }

const DEFAULT_HOUR = 9 // a date with no time is due at 9:00 AM

const SKIP_WORDS = new Set(['none', 'no', 'nope', 'skip', 'never', '-', 'n/a'])

const WEEKDAY_RE =
  /\b(?:(next|this) )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues|tue|weds|wed|thurs|thur|thu|fri|sat)\b/
const WEEKDAY_INDEX: Record<string, number> = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 }

const MONTH_NAMES =
  'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec'
const MONTH_INDEX = ['ja', 'fe', 'mar', 'ap', 'may', 'jun', 'jul', 'au', 'se', 'oc', 'no', 'de']
const monthOf = (word: string) => MONTH_INDEX.findIndex((m) => word.startsWith(m))

const DAY_MONTH_RE = new RegExp(
  `\\b(\\d{1,2})(?:st|nd|rd|th)?(?: of)? (${MONTH_NAMES})\\.?(?:,? (\\d{4}))?\\b`,
)
const MONTH_DAY_RE = new RegExp(
  `\\b(${MONTH_NAMES})\\.? (\\d{1,2})(?:st|nd|rd|th)?(?:,? (\\d{4}))?\\b`,
)

const NAMED_TIMES: Record<string, [number, number]> = {
  noon: [12, 0],
  midday: [12, 0],
  midnight: [23, 59],
  morning: [9, 0],
  afternoon: [15, 0],
  evening: [18, 0],
  tonight: [20, 0],
  eod: [17, 0],
  'end of day': [17, 0],
}

const UNIT_MS: Record<string, number> = { m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 }

// Does this locale write dates day-first (25/12) or month-first (12/25)?
const DAY_FIRST = (() => {
  try {
    const parts = new Intl.DateTimeFormat(undefined).formatToParts(new Date(2000, 11, 31))
    return parts.findIndex((p) => p.type === 'day') < parts.findIndex((p) => p.type === 'month')
  } catch {
    return true
  }
})()

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const at = (day: Date, [h, m]: [number, number]) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)

// A real calendar date (rejects 31 Feb etc.), or null.
function makeDate(y: number, m: number, d: number): Date | null {
  const date = new Date(y, m, d)
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? date : null
}

// A day+month with no year means the next time that date comes round.
function upcoming(m: number, d: number, today: Date): Date | null {
  const y = today.getFullYear()
  const date = makeDate(y, m, d)
  if (date && date < today) return makeDate(y + 1, m, d)
  return date ?? makeDate(y + 1, m, d)
}

const fullYear = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y))

export function parseDeadline(input: string, now = new Date()): DeadlineParse {
  let s = input.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!s || SKIP_WORDS.has(s)) return { ok: true }

  // "in 2 hours", "in 30 min", "in a week", "2h", "45m"
  const rel = s.match(
    /^(?:in )?(an?|\d+(?:\.\d+)?) ?(m|mins?|minutes?|h|hrs?|hours?|d|days?|w|wks?|weeks?)$/,
  )
  if (rel) {
    const n = rel[1] === 'a' || rel[1] === 'an' ? 1 : Number(rel[1])
    return { ok: true, due: now.getTime() + Math.round(n * UNIT_MS[rel[2][0]]) }
  }

  // Pull recognised pieces out of the string one by one; whatever is left over
  // at the end must be filler words, or the input isn't understood.
  const take = (re: RegExp) => {
    const m = s.match(re)
    if (m) s = `${s.slice(0, m.index)} ${s.slice(m.index! + m[0].length)}`.replace(/\s+/g, ' ').trim()
    return m
  }

  const today = startOfDay(now)
  let time: [number, number] | null = null
  let day: Date | null = null
  let weekday: { index: number; next: boolean } | null = null

  // --- dates written with digits (before times, so "2026-12-25" isn't read as one) ---
  let m = take(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/)
  if (m) {
    day = makeDate(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    if (!day) return { ok: false }
  }

  // --- times ---
  if ((m = take(/\b(?:at |@ ?)?(\d{1,2})(?:[:.](\d{2}))? ?(am|pm)\b/))) {
    const h = Number(m[1])
    const min = Number(m[2] ?? 0)
    if (h < 1 || h > 12 || min > 59) return { ok: false }
    time = [(h % 12) + (m[3] === 'pm' ? 12 : 0), min]
  } else if ((m = take(/\b(?:at |@ ?)?([01]?\d|2[0-3]):([0-5]\d)\b/))) {
    time = [Number(m[1]), Number(m[2])]
  } else if ((m = take(/\b(?:at|@) ?(\d{1,2})\b/))) {
    // "at 5" — small hours almost always mean the afternoon.
    const h = Number(m[1])
    if (h > 23) return { ok: false }
    time = [h >= 1 && h <= 7 ? h + 12 : h, 0]
  }
  if (!time) {
    for (const [word, hm] of Object.entries(NAMED_TIMES)) {
      if (take(new RegExp(`\\b(?:at |by |this |in the )?${word}\\b`))) {
        time = hm
        if (word === 'tonight' && !day) day = today
        break
      }
    }
  }

  // --- dates ---
  if (!day && (m = take(/\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2}|\d{4}))?\b/))) {
    let [d, mo] = DAY_FIRST ? [Number(m[1]), Number(m[2])] : [Number(m[2]), Number(m[1])]
    if (mo > 12 && d <= 12) [d, mo] = [mo, d]
    day = m[3] ? makeDate(fullYear(m[3]), mo - 1, d) : upcoming(mo - 1, d, today)
    if (!day) return { ok: false }
  }
  if (!day && (m = take(DAY_MONTH_RE))) {
    day = m[3] ? makeDate(Number(m[3]), monthOf(m[2]), Number(m[1])) : upcoming(monthOf(m[2]), Number(m[1]), today)
    if (!day) return { ok: false }
  }
  if (!day && (m = take(MONTH_DAY_RE))) {
    day = m[3] ? makeDate(Number(m[3]), monthOf(m[1]), Number(m[2])) : upcoming(monthOf(m[1]), Number(m[2]), today)
    if (!day) return { ok: false }
  }
  if (!day && take(/\b(?:the )?day after (?:tomorrow|tmrw?|tom)\b/)) day = addDays(today, 2)
  if (!day && take(/\b(?:tomorrow|tomorow|tmrw?|tom)\b/)) day = addDays(today, 1)
  if (!day && take(/\b(?:today|tod)\b/)) day = today
  if (!day && take(/\bnext week\b/)) day = addDays(today, 7)
  if (!day && take(/\bnext month\b/)) {
    const target = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    day = new Date(target.getFullYear(), target.getMonth(), Math.min(today.getDate(), last))
  }
  if (!day && take(/\b(?:this )?weekend\b/)) {
    // Saturday, or today if the weekend has already started.
    day = today.getDay() === 0 ? today : addDays(today, 6 - today.getDay())
  }
  if (!day && (m = take(WEEKDAY_RE))) {
    weekday = { index: WEEKDAY_INDEX[m[2].slice(0, 2)], next: m[1] === 'next' }
  }
  if (!day && !weekday && (m = take(/\b(?:the )?(\d{1,2})(?:st|nd|rd|th)\b/))) {
    // "the 15th" — the next time that day of the month comes round.
    const d = Number(m[1])
    for (let i = 0; i < 12 && !day; i++) {
      const y = today.getFullYear() + Math.floor((today.getMonth() + i) / 12)
      const candidate = makeDate(y, (today.getMonth() + i) % 12, d)
      if (candidate && candidate >= today) day = candidate
    }
    if (!day) return { ok: false }
  }

  // Anything left must be filler ("by", "on", "due", commas…).
  const rest = s.replace(/[,.@]/g, ' ').replace(/\b(at|on|by|due|the|of|before|this|until|til)\b/g, '').trim()
  if (rest) return { ok: false }
  if (!time && !day && !weekday) return { ok: false }

  // --- combine ---
  if (weekday) {
    let candidate = addDays(today, (weekday.index - today.getDay() + 7) % 7)
    if (at(candidate, time ?? [DEFAULT_HOUR, 0]) <= now) candidate = addDays(candidate, 7)
    day = weekday.next ? addDays(candidate, 7) : candidate
  }
  if (!day) {
    // Only a time: today if it's still ahead, otherwise tomorrow.
    const t = at(today, time!)
    return { ok: true, due: (t > now ? t : at(addDays(today, 1), time!)).getTime() }
  }
  if (time) return { ok: true, due: at(day, time).getTime() }

  // Only a date. For today, fall back to later times if 9 AM has already gone.
  for (const hm of [[DEFAULT_HOUR, 0], [17, 0], [23, 59]] as [number, number][]) {
    const t = at(day, hm)
    if (t > now || day.getTime() !== today.getTime()) return { ok: true, due: t.getTime() }
  }
  return { ok: true, due: at(day, [23, 59]).getTime() }
}

// "today 5:00 PM", "tomorrow 9:00 AM", "Fri 5:00 PM", "Sat 25 Oct 9:00 AM",
// "3 Jan 2027 9:00 AM".
export function formatDue(ts: number, now = new Date()): string {
  const due = new Date(ts)
  const time = due.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const days = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000)
  if (days === 0) return `today ${time}`
  if (days === 1) return `tomorrow ${time}`
  if (days === -1) return `yesterday ${time}`
  if (days > 1 && days < 7) return `${due.toLocaleDateString(undefined, { weekday: 'short' })} ${time}`
  const date = due.toLocaleDateString(undefined, {
    weekday: due.getFullYear() === now.getFullYear() ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
    year: due.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
  return `${date} ${time}`
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

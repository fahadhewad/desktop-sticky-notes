// Shared data model. Designed so the timestamp history we collect now can later
// power "smart" reminders (learning when a user usually completes a task).

export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number // epoch ms
  completedAt?: number // epoch ms, set when checked off
  color?: string // optional label colour (hex)
}

export type Repeat = 'once' | 'daily' | 'weekdays' | 'weekly'

export interface CompletionRecord {
  completedAt: number // epoch ms — every time this task was marked done
}

export interface ScheduleItem {
  id: string
  text: string
  time: string // "HH:MM" 24h
  repeat: Repeat
  weekday?: number // 0-6 (Sun-Sat), used when repeat === 'weekly'
  createdAt: number
  // Full history so we can learn the user's real timing.
  completionHistory: CompletionRecord[]
  // When true, the reminder fires at the learned "usual" time (derived from
  // completionHistory) instead of the set time.
  adaptive?: boolean
  // When true, the due notification is silent (no sound).
  silent?: boolean
}

export interface SizeProfile {
  id: string
  name: string
  width: number
  height: number
}

export interface Settings {
  width: number
  height: number
  matchWallpaper: boolean
  accentColor: string // manual accent used when matchWallpaper is off
  sizeProfiles: SizeProfile[]
  opacity?: number // overall widget opacity (0.6–1)
  launchAtStartup?: boolean
  position?: { x: number; y: number }
}

export interface AppState {
  todos: Todo[]
  schedule: ScheduleItem[]
  settings: Settings
}

export interface Theme {
  glass: string
  glassStrong: string
  ink: string
  inkSoft: string
  accent: string
  accentSoft: string
  line: string
}

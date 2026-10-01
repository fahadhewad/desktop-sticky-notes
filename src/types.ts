// Shared data model. Designed so the timestamp history we collect now can later
// power "smart" reminders (learning when a user usually completes a task).

export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number // epoch ms
  completedAt?: number // epoch ms, set when checked off
  color?: string // optional label colour (hex)
  due?: number // optional deadline, epoch ms
}

export interface Board {
  id: string
  name: string
  todos: Todo[]
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

// Where the widget sits on screen: 'free' (drag anywhere) or stuck to one of
// nine spots on the current display, e.g. 'top-right'.
export type Anchor =
  | 'free'
  | `${'top' | 'middle' | 'bottom'}-${'left' | 'center' | 'right'}`

// Global shortcuts as Electron accelerators (e.g. "CommandOrControl+Alt+N").
// An empty string turns that shortcut off.
export interface Shortcuts {
  quickAdd: string // pop up the quick-add box
  toggle: string // show / hide the widget
}

export type ShortcutState = 'ok' | 'failed' | 'off'
export type ShortcutStatus = Partial<Record<keyof Shortcuts, ShortcutState>>

export interface Settings {
  width: number
  height: number
  matchWallpaper: boolean
  accentColor: string // manual accent used when matchWallpaper is off
  sizeProfiles: SizeProfile[]
  opacity?: number // overall widget opacity (0.6–1)
  launchAtStartup?: boolean
  activeBoardId?: string // id of the board shown in the To-do panel
  position?: { x: number; y: number }
  anchor?: Anchor
  shortcuts?: Shortcuts
}

export interface SpanishProgress {
  learnedCount: number // how many verbs have been revealed so far (0..120)
  lastLearnedDate: string // YYYY-MM-DD of the most recent reveal
}

export interface AppState {
  boards?: Board[]
  todos?: Todo[] // legacy (pre-boards); migrated into a default board on load
  schedule: ScheduleItem[]
  settings: Settings
  spanish?: SpanishProgress
}

// What the quick-add box hands to the widget.
export interface QuickTodo {
  text: string
  due?: number
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

import type { AppState, Settings, Theme } from './types'

// The shape the preload script exposes on window.api. Kept in one place so the
// renderer and preload stay in sync.
export interface StickyApi {
  loadState(): Promise<AppState>
  save(key: 'boards' | 'schedule' | 'settings', value: unknown): Promise<void>
  resizeWindow(width: number, height: number): void
  onWindowResized(cb: (size: { width: number; height: number }) => void): () => void
  minimize(): void
  toggleMaximize(): void
  close(): void
  getTheme(): Promise<Theme | null>
  onThemeChanged(cb: (theme: Theme) => void): () => void
  notify(title: string, body: string): void
  snoozeReminder(id: string, minutes: number): void
  onTaskDue(cb: (id: string) => void): () => void
}

declare global {
  interface Window {
    api?: StickyApi
  }
}

const DEFAULT_SETTINGS: Settings = {
  width: 720,
  height: 460,
  matchWallpaper: true,
  accentColor: '#f6b06b',
  opacity: 1,
  launchAtStartup: false,
  sizeProfiles: [
    { id: 'compact', name: 'Compact', width: 560, height: 380 },
    { id: 'standard', name: 'Standard', width: 720, height: 460 },
    { id: 'large', name: 'Large', width: 900, height: 600 },
  ],
}

// Fallback used when the app runs in a plain browser (vite dev, no Electron).
// Persists to localStorage so the UI is still fully usable for design work.
const browserFallback: StickyApi = {
  async loadState() {
    const raw = localStorage.getItem('sticky-state')
    if (raw) return JSON.parse(raw) as AppState
    return { todos: [], schedule: [], settings: DEFAULT_SETTINGS }
  },
  async save(key, value) {
    const raw = localStorage.getItem('sticky-state')
    const state: AppState = raw
      ? JSON.parse(raw)
      : { todos: [], schedule: [], settings: DEFAULT_SETTINGS }
    ;(state as unknown as Record<string, unknown>)[key] = value
    localStorage.setItem('sticky-state', JSON.stringify(state))
  },
  resizeWindow() {},
  onWindowResized() {
    return () => {}
  },
  minimize() {},
  toggleMaximize() {},
  close() {},
  async getTheme() {
    return null
  },
  onThemeChanged() {
    return () => {}
  },
  notify(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  },
  snoozeReminder() {},
  onTaskDue() {
    return () => {}
  },
}

export const api: StickyApi = window.api ?? browserFallback
export const isElectron = Boolean(window.api)
export { DEFAULT_SETTINGS }

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AppState, ScheduleItem, Settings, Todo } from './types'
import { api, DEFAULT_SETTINGS } from './api'
import { applyTheme, themeFromAccent } from './theme'
import TopBar from './components/TopBar'
import TodoPanel from './components/TodoPanel'
import SchedulePanel from './components/SchedulePanel'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [dueIds, setDueIds] = useState<Set<string>>(new Set())

  // ---- initial load ----
  useEffect(() => {
    let cancelled = false
    api.loadState().then((state: AppState) => {
      if (cancelled) return
      setTodos(state.todos ?? [])
      setSchedule(state.schedule ?? [])
      setSettings({ ...DEFAULT_SETTINGS, ...state.settings })
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- persist each slice when it changes (after the first load) ----
  useEffect(() => {
    if (loaded) api.save('todos', todos)
  }, [todos, loaded])
  useEffect(() => {
    if (loaded) api.save('schedule', schedule)
  }, [schedule, loaded])
  useEffect(() => {
    if (loaded) api.save('settings', settings)
  }, [settings, loaded])

  // ---- theming: wallpaper-matched or manual accent ----
  useEffect(() => {
    if (!loaded) return
    if (settings.matchWallpaper) {
      let dispose = () => {}
      api.getTheme().then((t) => t && applyTheme(t))
      dispose = api.onThemeChanged((t) => applyTheme(t))
      return dispose
    }
    applyTheme(themeFromAccent(settings.accentColor))
  }, [settings.matchWallpaper, settings.accentColor, loaded])

  // ---- remember size when the user drags the window edge ----
  useEffect(() => {
    return api.onWindowResized(({ width, height }) => {
      setSettings((s) => (s.width === width && s.height === height ? s : { ...s, width, height }))
    })
  }, [])

  // ---- highlight tasks the scheduler says are due ----
  useEffect(() => {
    return api.onTaskDue((id) => {
      setDueIds((prev) => new Set(prev).add(id))
    })
  }, [])

  const clearDue = useCallback((id: string) => {
    setDueIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Apply a preset / profile size both to state and the real window.
  const applySize = useCallback((width: number, height: number) => {
    setSettings((s) => ({ ...s, width, height }))
    api.resizeWindow(width, height)
  }, [])

  // Guard against the very first render flashing the wrong size.
  const didInitSize = useRef(false)
  useEffect(() => {
    if (loaded && !didInitSize.current) {
      didInitSize.current = true
      api.resizeWindow(settings.width, settings.height)
    }
  }, [loaded, settings.width, settings.height])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full w-full overflow-hidden rounded-xl2 border border-line bg-glass shadow-soft backdrop-blur-2xl"
      style={{ transition: 'background 0.6s ease, border-color 0.6s ease' }}
    >
      <div className="flex h-full flex-col">
        <TopBar
          onOpenSettings={() => setShowSettings(true)}
          settingsOpen={showSettings}
        />

        <div className="flex min-h-0 flex-1">
          <TodoPanel todos={todos} setTodos={setTodos} />
          <div className="w-px shrink-0 bg-line" />
          <SchedulePanel
            schedule={schedule}
            setSchedule={setSchedule}
            dueIds={dueIds}
            clearDue={clearDue}
          />
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            applySize={applySize}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AppState, Board, ScheduleItem, Settings, SpanishProgress, Todo } from './types'
import { api, DEFAULT_SETTINGS } from './api'
import { applyTheme, themeFromAccent } from './theme'
import { uid } from './utils'
import TopBar from './components/TopBar'
import TodoPanel from './components/TodoPanel'
import SchedulePanel from './components/SchedulePanel'
import SettingsPanel from './components/SettingsPanel'
import SpanishPanel from './components/SpanishPanel'
import { VERBS } from './data/verbs'

export default function App() {
  const [boards, setBoards] = useState<Board[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [dueIds, setDueIds] = useState<Set<string>>(new Set())
  const [showSpanish, setShowSpanish] = useState(false)
  const [spanish, setSpanish] = useState<SpanishProgress>({ learnedCount: 0, lastLearnedDate: '' })

  // ---- initial load (migrating any pre-boards todos into a default board) ----
  useEffect(() => {
    let cancelled = false
    api.loadState().then((state: AppState) => {
      if (cancelled) return
      const loadedBoards = state.boards?.length
        ? state.boards
        : [{ id: uid(), name: 'Notes', todos: state.todos ?? [] }]
      setBoards(loadedBoards)
      setSchedule(state.schedule ?? [])
      setSettings({ ...DEFAULT_SETTINGS, ...state.settings })
      setSpanish(state.spanish ?? { learnedCount: 0, lastLearnedDate: '' })
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- persist each slice when it changes (after the first load) ----
  useEffect(() => {
    if (loaded) api.save('boards', boards)
  }, [boards, loaded])
  useEffect(() => {
    if (loaded) api.save('schedule', schedule)
  }, [schedule, loaded])
  useEffect(() => {
    if (loaded) api.save('settings', settings)
  }, [settings, loaded])
  useEffect(() => {
    if (loaded) api.save('spanish', spanish)
  }, [spanish, loaded])

  // ---- reveal a new Spanish verb each calendar day ----
  useEffect(() => {
    if (!loaded) return
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (spanish.lastLearnedDate !== today && spanish.learnedCount < VERBS.length) {
      setSpanish((s) => ({ learnedCount: s.learnedCount + 1, lastLearnedDate: today }))
    }
  }, [loaded, spanish.lastLearnedDate, spanish.learnedCount])

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

  // ---- keyboard shortcuts: Ctrl/Cmd+N focuses quick-add, Esc hides to tray ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const typing =
        !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder^="Write"]')?.focus()
      } else if (e.key === 'Escape' && !typing) {
        api.minimize()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  // ---- boards (multiple to-do lists) ----
  const activeBoard = boards.find((b) => b.id === settings.activeBoardId) ?? boards[0]
  const activeBoardId = activeBoard?.id ?? ''

  const setActiveTodos: React.Dispatch<React.SetStateAction<Todo[]>> = (action) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? {
              ...b,
              todos: typeof action === 'function' ? (action as (t: Todo[]) => Todo[])(b.todos) : action,
            }
          : b,
      ),
    )
  }
  const switchBoard = (id: string) => setSettings((s) => ({ ...s, activeBoardId: id }))
  const addBoard = () => {
    const board: Board = { id: uid(), name: `Board ${boards.length + 1}`, todos: [] }
    setBoards((prev) => [...prev, board])
    setSettings((s) => ({ ...s, activeBoardId: board.id }))
  }
  const renameBoard = (id: string, name: string) =>
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)))
  const deleteBoard = (id: string) => {
    if (boards.length <= 1) return
    const fallback = boards.find((b) => b.id !== id)
    setBoards((prev) => prev.filter((b) => b.id !== id))
    if (activeBoardId === id && fallback) setSettings((s) => ({ ...s, activeBoardId: fallback.id }))
  }

  return (
    <motion.div
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full w-full overflow-hidden rounded-xl2 border border-line bg-glass shadow-card backdrop-blur-2xl backdrop-saturate-150"
      style={{
        opacity: settings.opacity ?? 1,
        transition: 'opacity 0.4s ease, background 0.6s ease, border-color 0.6s ease',
      }}
    >
      <div className="flex h-full flex-col">
        <TopBar
          onOpenSettings={() => setShowSettings(true)}
          settingsOpen={showSettings}
          onOpenSpanish={() => setShowSpanish(true)}
        />

        <div className="flex min-h-0 flex-1">
          <TodoPanel
            todos={activeBoard?.todos ?? []}
            setTodos={setActiveTodos}
            boards={boards}
            activeBoardId={activeBoardId}
            onSwitchBoard={switchBoard}
            onAddBoard={addBoard}
            onRenameBoard={renameBoard}
            onDeleteBoard={deleteBoard}
          />
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

      <AnimatePresence>
        {showSpanish && (
          <SpanishPanel learnedCount={spanish.learnedCount} onClose={() => setShowSpanish(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { api, DEFAULT_SETTINGS } from '../api'
import { applyTheme, themeFromAccent } from '../theme'
import { capitalize, formatDue, parseDeadline } from '../deadline'

type Step = 'text' | 'deadline' | 'done'

const MOD = /mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'

// The quick-add popup, summoned from anywhere by a global shortcut. Type the
// note, Enter; type a deadline (or nothing), Enter; it lands on the active board.
export default function QuickCapture() {
  const [step, setStep] = useState<Step>('text')
  const [text, setText] = useState('')
  const [deadline, setDeadline] = useState('')
  const [savedDue, setSavedDue] = useState<number | undefined>()
  const [boardName, setBoardName] = useState('Notes')
  const inputRef = useRef<HTMLInputElement>(null)
  const stepRef = useRef(step)
  stepRef.current = step
  const [scope, animate] = useAnimate()

  // Pick up the current theme and active board each time the box opens.
  const refresh = useCallback(() => {
    api.loadState().then((state) => {
      const settings = { ...DEFAULT_SETTINGS, ...state.settings }
      const boards = state.boards ?? []
      setBoardName((boards.find((b) => b.id === settings.activeBoardId) ?? boards[0])?.name ?? 'Notes')
      const manual = themeFromAccent(settings.accentColor)
      if (settings.matchWallpaper) api.getTheme().then((t) => applyTheme(t ?? manual))
      else applyTheme(manual)
    })
  }, [])

  const reset = () => {
    setStep('text')
    setText('')
    setDeadline('')
  }

  // A draft survives clicking away; only a finished note starts fresh.
  useEffect(() => {
    refresh()
    return api.onQuickOpen(() => {
      refresh()
      if (stepRef.current === 'done') reset()
      requestAnimationFrame(() => inputRef.current?.focus())
    })
  }, [refresh])

  useEffect(() => {
    const onFocus = () => inputRef.current?.focus()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const parsed = parseDeadline(deadline)
  const stepIndex = { text: 0, deadline: 1, done: 2 }[step]
  const nudge = () => animate(scope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.35 })

  const save = (due?: number) => {
    api.quickAdd({ text: text.trim(), due })
    setSavedDue(due)
    setStep('done')
    setTimeout(() => api.closeQuick(), 700)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (step === 'text') {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!text.trim()) nudge()
        else if (e.ctrlKey || e.metaKey) save()
        else setStep('deadline')
      } else if (e.key === 'Escape') {
        reset()
        api.closeQuick()
      }
    } else if (step === 'deadline') {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (parsed.ok) save(parsed.due)
        else nudge()
      } else if (e.key === 'Escape' || (e.key === 'Backspace' && !deadline)) {
        e.preventDefault()
        setStep('text')
      }
    }
  }

  return (
    <div className="flex h-full w-full items-start justify-center p-3">
      <div ref={scope} className="w-full">
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-line bg-glass-strong shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {/* header: where it's going + progress */}
          <div className="flex items-center justify-between px-4 pt-3 text-[11px] text-ink-soft">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="shrink-0">Quick add to</span>
              <span className="truncate font-medium text-ink">{boardName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1" aria-hidden>
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: stepIndex === i ? 14 : 6,
                    backgroundColor: stepIndex >= i ? 'var(--accent)' : 'var(--ink-soft)',
                    opacity: stepIndex >= i ? 1 : 0.35,
                  }}
                />
              ))}
            </span>
          </div>

          {/* the prompt */}
          <div className="flex min-h-[64px] flex-col justify-center px-4 py-1">
            {step === 'text' && (
              <motion.input
                key="text"
                ref={inputRef}
                autoFocus
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="What do you need to do?"
                aria-label="Note"
                className="w-full bg-transparent text-lg text-ink placeholder:text-ink-soft focus:outline-none"
              />
            )}
            {step === 'deadline' && (
              <motion.div key="deadline" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
                <p className="truncate text-xs text-ink-soft">{text.trim()}</p>
                <input
                  ref={inputRef}
                  autoFocus
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Deadline? e.g. tomorrow 5pm, fri, in 2 hours"
                  aria-label="Deadline"
                  className="w-full bg-transparent text-lg text-ink placeholder:text-ink-soft focus:outline-none"
                />
              </motion.div>
            )}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                </motion.span>
                <span className="truncate text-lg text-ink">{text.trim()}</span>
              </motion.div>
            )}
          </div>

          {/* feedback + key hints */}
          <div className="flex items-center justify-between gap-3 px-4 pb-3 text-[11px] text-ink-soft">
            <span className="min-w-0 truncate">
              {step === 'deadline' && <DeadlinePreview input={deadline} parsed={parsed} />}
              {step === 'done' &&
                (savedDue ? `Added · due ${formatDue(savedDue)}` : `Added to ${boardName}`)}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {step === 'text' && (
                <>
                  <Hint keys="↵">next</Hint>
                  <Hint keys={`${MOD} ↵`}>save now</Hint>
                  <Hint keys="Esc">cancel</Hint>
                </>
              )}
              {step === 'deadline' && (
                <>
                  <Hint keys="↵">save</Hint>
                  <Hint keys="Esc">back</Hint>
                </>
              )}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function DeadlinePreview({ input, parsed }: { input: string; parsed: ReturnType<typeof parseDeadline> }) {
  if (!input.trim() || (parsed.ok && !parsed.due)) return <>No deadline · just press Enter</>
  if (!parsed.ok) {
    return <span style={{ color: '#f6736b' }}>Try “tomorrow 5pm”, “fri”, “25 dec” or “in 2h”</span>
  }
  const past = parsed.due! < Date.now()
  return (
    <span style={{ color: past ? '#f6736b' : 'var(--accent)' }}>
      → {capitalize(formatDue(parsed.due!))}
      {past && ' (already passed)'}
    </span>
  )
}

function Hint({ keys, children }: { keys: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="rounded border border-line px-1 font-sans text-[10px] leading-4 text-ink">{keys}</kbd>
      {children}
    </span>
  )
}

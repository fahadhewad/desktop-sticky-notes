import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Anchor, Settings, ShortcutState, ShortcutStatus, Shortcuts, SizeProfile } from '../types'
import { api } from '../api'
import { uid } from '../utils'
import { acceleratorFromEvent, DEFAULT_SHORTCUTS, formatAccelerator } from '../shortcuts'

interface Props {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  applySize: (width: number, height: number) => void
  onClose: () => void
}

const ACCENTS = ['#f6b06b', '#7aa2f7', '#9ece6a', '#e06c9f', '#bb9af7', '#f7768e']

const ANCHORS: Exclude<Anchor, 'free'>[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]
// Line each mini-widget up with the edge it stands for.
const JUSTIFY = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }
const ALIGN = { top: 'items-start', middle: 'items-center', bottom: 'items-end' }

const anchorLabel = (a: Anchor) =>
  a === 'middle-center'
    ? 'Centre'
    : a
        .replace('middle-', 'middle ')
        .replace('-center', ' centre')
        .replace('-', ' ')
        .replace(/^./, (c) => c.toUpperCase())

const SHORTCUT_ROWS: { key: keyof Shortcuts; label: string; hint: string }[] = [
  { key: 'quickAdd', label: 'Quick add', hint: 'Pop up a box to jot a note from anywhere' },
  { key: 'toggle', label: 'Show / hide widget', hint: 'Tuck the widget away or bring it back' },
]

export default function SettingsPanel({ settings, setSettings, applySize, onClose }: Props) {
  const [profileName, setProfileName] = useState('')

  const saveProfile = () => {
    const name = profileName.trim() || `Size ${settings.sizeProfiles.length + 1}`
    const profile: SizeProfile = {
      id: uid(),
      name,
      width: settings.width,
      height: settings.height,
    }
    setSettings((s) => ({ ...s, sizeProfiles: [...s.sizeProfiles, profile] }))
    setProfileName('')
  }

  const deleteProfile = (id: string) =>
    setSettings((s) => ({ ...s, sizeProfiles: s.sizeProfiles.filter((p) => p.id !== id) }))

  const anchor = settings.anchor ?? 'free'
  const setAnchor = (a: Anchor) => setSettings((s) => ({ ...s, anchor: a }))

  const shortcuts = { ...DEFAULT_SHORTCUTS, ...settings.shortcuts }
  const setShortcut = (key: keyof Shortcuts, accelerator: string) =>
    setSettings((s) => ({ ...s, shortcuts: { ...DEFAULT_SHORTCUTS, ...s.shortcuts, [key]: accelerator } }))
  const [shortcutStatus, setShortcutStatus] = useState<ShortcutStatus>({})
  useEffect(() => {
    api.getShortcutStatus().then(setShortcutStatus)
    return api.onShortcutStatus(setShortcutStatus)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-stretch bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        onClick={(e) => e.stopPropagation()}
        className="no-drag ml-auto flex h-full w-72 flex-col overflow-y-auto scroll-area bg-glass-strong p-5 backdrop-blur-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Settings</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-accent" aria-label="Close settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ---- Size presets ---- */}
        <Label>Size</Label>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {settings.sizeProfiles.slice(0, 3).map((p) => {
            const active = settings.width === p.width && settings.height === p.height
            return (
              <button
                key={p.id}
                onClick={() => applySize(p.width, p.height)}
                className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                  active
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line text-ink-soft hover:text-ink'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        {/* ---- Fine sliders ---- */}
        <Slider
          label="Width"
          value={settings.width}
          min={420}
          max={1100}
          onChange={(v) => applySize(v, settings.height)}
        />
        <Slider
          label="Height"
          value={settings.height}
          min={320}
          max={820}
          onChange={(v) => applySize(settings.width, v)}
        />

        {/* ---- Saved size profiles ---- */}
        <Label>Saved sizes</Label>
        <div className="mb-2 flex gap-2">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
            placeholder="Name this size"
            className="w-full rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-ink placeholder:text-ink-soft focus:outline-none"
          />
          <button
            onClick={saveProfile}
            className="shrink-0 rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent hover:scale-105"
          >
            Save
          </button>
        </div>
        <div className="mb-4 space-y-1">
          {settings.sizeProfiles.map((p) => (
            <div
              key={p.id}
              className="group flex items-center justify-between rounded-lg px-2 py-1 hover:bg-glass"
            >
              <button
                onClick={() => applySize(p.width, p.height)}
                className="flex-1 text-left text-xs text-ink-soft hover:text-ink"
              >
                {p.name}{' '}
                <span className="text-[10px]">
                  {p.width}×{p.height}
                </span>
              </button>
              <button
                onClick={() => deleteProfile(p.id)}
                className="text-ink-soft opacity-0 hover:text-accent group-hover:opacity-100"
                aria-label="Delete size"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* ---- Position ---- */}
        <Label>Position</Label>
        <div className="mb-2 grid aspect-[16/10] w-full grid-cols-3 grid-rows-3 gap-1 rounded-lg border border-line bg-glass p-1.5">
          {ANCHORS.map((a) => {
            const [v, h] = a.split('-') as [keyof typeof ALIGN, keyof typeof JUSTIFY]
            const active = anchor === a
            return (
              <button
                key={a}
                onClick={() => setAnchor(a)}
                title={anchorLabel(a)}
                aria-label={`Stick to ${anchorLabel(a).toLowerCase()}`}
                aria-pressed={active}
                className={`flex rounded-md p-1 transition-colors hover:bg-accent-soft ${JUSTIFY[h]} ${ALIGN[v]}`}
              >
                <span
                  className="block h-3 w-5 rounded-[3px] border transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent)' : 'transparent',
                    borderColor: active ? 'var(--accent)' : 'var(--ink-soft)',
                    opacity: active ? 1 : 0.45,
                  }}
                />
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setAnchor('free')}
          className={`mb-1 w-full rounded-lg border px-3 py-1.5 text-xs transition-colors ${
            anchor === 'free'
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line text-ink-soft hover:text-ink'
          }`}
        >
          Free — drag it anywhere
        </button>
        <p className="mb-4 text-[10px] text-ink-soft">
          {anchor === 'free'
            ? 'Drag the top strip to move the widget.'
            : `Stuck to the ${anchorLabel(anchor).toLowerCase()} of the screen it's on.`}
        </p>

        {/* ---- Opacity ---- */}
        <Label>Opacity</Label>
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-[11px] text-ink-soft">
            <span>Transparency</span>
            <span>{Math.round((settings.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1}
            step={0.02}
            value={settings.opacity ?? 1}
            onChange={(e) => setSettings((s) => ({ ...s, opacity: Number(e.target.value) }))}
            className="w-full"
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>

        {/* ---- Theme ---- */}
        <Label>Theme</Label>
        <button
          onClick={() => setSettings((s) => ({ ...s, matchWallpaper: !s.matchWallpaper }))}
          className="mb-3 flex w-full items-center justify-between rounded-lg border border-line px-3 py-2"
        >
          <span className="text-xs text-ink">Match wallpaper</span>
          <span
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ backgroundColor: settings.matchWallpaper ? 'var(--accent)' : 'var(--line)' }}
          >
            <motion.span
              layout
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
              animate={{ left: settings.matchWallpaper ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          </span>
        </button>

        {!settings.matchWallpaper && (
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setSettings((s) => ({ ...s, accentColor: c }))}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: settings.accentColor === c ? 'var(--ink)' : 'transparent',
                }}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        )}

        {/* ---- Shortcuts ---- */}
        <Label>Shortcuts</Label>
        <div className="mb-4 space-y-2">
          {SHORTCUT_ROWS.map((row) => {
            const other = SHORTCUT_ROWS.find((r) => r.key !== row.key)!
            return (
              <ShortcutRow
                key={row.key}
                label={row.label}
                hint={row.hint}
                value={shortcuts[row.key]}
                defaultValue={DEFAULT_SHORTCUTS[row.key]}
                taken={shortcuts[other.key] ? { by: other.label, accelerator: shortcuts[other.key] } : null}
                status={shortcutStatus[row.key]}
                onChange={(acc) => setShortcut(row.key, acc)}
              />
            )
          })}
        </div>

        {/* ---- Startup ---- */}
        <Label>Startup</Label>
        <button
          onClick={() => setSettings((s) => ({ ...s, launchAtStartup: !s.launchAtStartup }))}
          className="mb-1 flex w-full items-center justify-between rounded-lg border border-line px-3 py-2"
        >
          <span className="text-xs text-ink">Launch at startup</span>
          <span
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ backgroundColor: settings.launchAtStartup ? 'var(--accent)' : 'var(--line)' }}
          >
            <motion.span
              layout
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
              animate={{ left: settings.launchAtStartup ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          </span>
        </button>

        <div className="mt-auto pt-5 text-center text-[10px] text-ink-soft">
          Desktop Sticky Notes · v{__APP_VERSION__}
        </div>
      </motion.div>
    </motion.div>
  )
}

// A global shortcut with a click-to-record button.
function ShortcutRow({
  label,
  hint,
  value,
  defaultValue,
  taken,
  status,
  onChange,
}: {
  label: string
  hint: string
  value: string
  defaultValue: string
  taken: { by: string; accelerator: string } | null
  status?: ShortcutState
  onChange: (accelerator: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  // Read through a ref so re-renders mid-recording don't re-run the effect.
  const latest = useRef({ taken, onChange })
  latest.current = { taken, onChange }

  useEffect(() => {
    if (!recording) return
    // Pause the global shortcuts so pressing the current combo records it
    // instead of firing it.
    api.suspendShortcuts(true)
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const { taken, onChange } = latest.current
      const plain = !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey
      if (plain && e.key === 'Escape') return setRecording(false)
      if (plain && (e.key === 'Backspace' || e.key === 'Delete')) {
        onChange('')
        setError('')
        return setRecording(false)
      }
      const result = acceleratorFromEvent(e)
      if (!result) return // only modifiers so far
      if ('error' in result) return setError(result.error)
      if (taken && result.accelerator === taken.accelerator) {
        return setError(`Already used for “${taken.by}”`)
      }
      onChange(result.accelerator)
      setError('')
      setRecording(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      api.suspendShortcuts(false)
    }
  }, [recording])

  const failed = !recording && status === 'failed' && !!value
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-ink">{label}</p>
          <p className="truncate text-[10px] text-ink-soft">{hint}</p>
        </div>
        <button
          onClick={() => {
            setError('')
            setRecording((r) => !r)
          }}
          onBlur={() => setRecording(false)}
          className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
            recording ? 'animate-pulse border-accent bg-accent-soft text-accent' : 'border-line text-ink hover:border-accent'
          }`}
          title={recording ? 'Press a key combo' : 'Click to change'}
        >
          {recording ? 'Press keys…' : formatAccelerator(value)}
        </button>
      </div>
      {(recording || error || failed || value !== defaultValue) && (
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
          <span className="min-w-0" style={{ color: error || failed ? '#f6736b' : 'var(--ink-soft)' }}>
            {error ||
              (recording
                ? 'Esc to cancel · Backspace to turn off'
                : failed
                  ? 'Another app is using this combo, pick another'
                  : '')}
          </span>
          {!recording && value !== defaultValue && (
            <button
              onClick={() => onChange(defaultValue)}
              className="shrink-0 text-ink-soft transition-colors hover:text-accent"
            >
              Reset to {formatAccelerator(defaultValue)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-soft">{children}</p>
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span>{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
        style={{ accentColor: 'var(--accent)' }}
      />
    </div>
  )
}

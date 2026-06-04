import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Settings, SizeProfile } from '../types'
import { uid } from '../utils'

interface Props {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  applySize: (width: number, height: number) => void
  onClose: () => void
}

const ACCENTS = ['#f6b06b', '#7aa2f7', '#9ece6a', '#e06c9f', '#bb9af7', '#f7768e']

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
      </motion.div>
    </motion.div>
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

import { useEffect, useState } from 'react'
import { api } from '../api'

interface Props {
  onOpenSettings: () => void
  settingsOpen: boolean
}

// A thin draggable strip. A subtle clock sits in the middle; the window controls
// and settings gear stay invisible until the strip is hovered, keeping the
// widget clean and chrome-free.
export default function TopBar({ onOpenSettings, settingsOpen }: Props) {
  return (
    <div className="drag group relative flex h-9 shrink-0 items-center px-3">
      {/* Hover-revealed window controls (left) */}
      <div className="no-drag flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Dot color="#ff5f57" label="Close" onClick={() => api.close()} />
        <Dot color="#febc2e" label="Hide to tray" onClick={() => api.minimize()} />
        <Dot color="#28c840" label="Maximise" onClick={() => api.toggleMaximize()} />
      </div>

      <Clock />

      <div className="flex-1" />

      {/* Hover-revealed settings gear (right) */}
      <button
        onClick={onOpenSettings}
        className={`no-drag relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition-all duration-200 hover:bg-accent-soft hover:text-accent active:scale-95 ${
          settingsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Settings"
        aria-label="Settings"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )
}

// A quiet ambient clock + date, centred in the top strip. Updates every 30s.
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[11px] font-medium text-ink-soft">
      {time}
      <span className="opacity-50"> · {date}</span>
    </div>
  )
}

function Dot({ color, label, onClick }: { color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-3 w-3 rounded-full transition-transform duration-150 hover:scale-110 active:scale-95"
      style={{ backgroundColor: color }}
    />
  )
}

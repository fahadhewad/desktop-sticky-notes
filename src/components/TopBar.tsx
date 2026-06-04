import { motion } from 'framer-motion'
import { api } from '../api'

interface Props {
  onOpenSettings: () => void
  settingsOpen: boolean
}

// A thin draggable strip. The traffic-light controls and the settings gear stay
// invisible until the strip is hovered, keeping the widget clean and chrome-free.
export default function TopBar({ onOpenSettings, settingsOpen }: Props) {
  return (
    <div className="drag group relative flex h-9 shrink-0 items-center px-3">
      {/* Hover-revealed window controls (left) */}
      <motion.div
        className="no-drag flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <Dot color="#ff5f57" hover="#ff5f57" label="Close" onClick={() => api.close()} />
        <Dot color="#febc2e" hover="#febc2e" label="Minimise" onClick={() => api.minimize()} />
        <Dot color="#28c840" hover="#28c840" label="Maximise" onClick={() => api.toggleMaximize()} />
      </motion.div>

      <div className="flex-1" />

      {/* Hover-revealed settings gear (right) */}
      <button
        onClick={onOpenSettings}
        className={`no-drag flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition-all duration-200 hover:bg-accent-soft hover:text-accent ${
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

function Dot({
  color,
  label,
  onClick,
}: {
  color: string
  hover: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-3 w-3 rounded-full transition-transform duration-150 hover:scale-110"
      style={{ backgroundColor: color }}
    />
  )
}

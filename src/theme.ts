import type { Theme } from './types'

// Writes a Theme into the document's CSS variables. Because Tailwind colours
// reference these variables, the whole UI re-themes instantly (and CSS
// transitions make it animate).
export function applyTheme(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--glass', theme.glass)
  root.setProperty('--glass-strong', theme.glassStrong)
  root.setProperty('--ink', theme.ink)
  root.setProperty('--ink-soft', theme.inkSoft)
  root.setProperty('--accent', theme.accent)
  root.setProperty('--accent-soft', theme.accentSoft)
  root.setProperty('--line', theme.line)
}

// Build a coherent dark-glass theme from a single accent colour. Used when the
// user turns wallpaper-matching off and picks an accent manually.
export function themeFromAccent(accent: string): Theme {
  return {
    glass: 'rgba(24, 26, 33, 0.55)',
    glassStrong: 'rgba(24, 26, 33, 0.80)',
    ink: 'rgba(245, 247, 252, 0.96)',
    inkSoft: 'rgba(245, 247, 252, 0.55)',
    accent,
    accentSoft: hexToRgba(accent, 0.18),
    line: 'rgba(255, 255, 255, 0.09)',
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

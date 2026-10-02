import type { Theme } from './types'

// Writes a Theme into the document's CSS variables. Because Tailwind colours
// reference these variables, the whole UI re-themes instantly (and CSS
// transitions make it animate).
export function applyTheme(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--glass', theme.glass)
  root.setProperty('--glass-strong', theme.glassStrong)
  root.setProperty('--glass-solid', theme.glassSolid)
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
    glassSolid: 'rgba(24, 26, 33, 0.96)',
    ink: 'rgba(245, 247, 252, 0.96)',
    inkSoft: 'rgba(245, 247, 252, 0.55)',
    accent,
    accentSoft: hexToRgba(accent, 0.18),
    line: 'rgba(255, 255, 255, 0.09)',
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Is this a light colour (so it needs dark text on it)?
export function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

// CSS variable overrides that turn the widget into a solid surface of the
// chosen colour (used while it sits in front of other windows). Text, lines
// and inner panels flip to dark on light colours so everything stays legible.
export function frontSurface(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)
  const light = isLight(hex)
  const toward = light ? 0 : 255
  const shade = (t: number, a: number) =>
    `rgba(${Math.round(r + (toward - r) * t)}, ${Math.round(g + (toward - g) * t)}, ${Math.round(b + (toward - b) * t)}, ${a})`
  const ink = light ? '20, 22, 28' : '245, 247, 252'
  return {
    '--glass-solid': `rgba(${r}, ${g}, ${b}, 0.97)`,
    '--glass-strong': shade(0.07, 0.98),
    '--glass': shade(0.04, 0.6),
    '--ink': `rgba(${ink}, 0.96)`,
    '--ink-soft': `rgba(${ink}, 0.6)`,
    '--line': light ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)',
  }
}

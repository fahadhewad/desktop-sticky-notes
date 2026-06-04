'use strict'
// Reads the current Windows wallpaper and derives a coherent glass theme from
// its colours. Polls for wallpaper changes so the UI re-themes when the user
// swaps their background. All Windows-specific; returns null elsewhere.

const { exec } = require('child_process')
const fs = require('fs')

function getWallpaperPath() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve(null)
    exec(
      'reg query "HKCU\\Control Panel\\Desktop" /v WallPaper',
      { windowsHide: true },
      (err, stdout) => {
        if (err) return resolve(null)
        // Line looks like:  WallPaper    REG_SZ    C:\path\to\img.jpg
        const match = stdout.match(/WallPaper\s+REG_SZ\s+(.+)/i)
        const path = match ? match[1].trim() : ''
        resolve(path && fs.existsSync(path) ? path : null)
      },
    )
  })
}

function rgba({ r, g, b }, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function mix(c, target, t) {
  return {
    r: Math.round(c.r + (target - c.r) * t),
    g: Math.round(c.g + (target - c.g) * t),
    b: Math.round(c.b + (target - c.b) * t),
  }
}

function luminance({ r, g, b }) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function buildTheme(palette) {
  const sw = (name, fallback) =>
    palette[name] ? { r: palette[name].r, g: palette[name].g, b: palette[name].b } : fallback

  const dark = sw('DarkMuted', { r: 26, g: 28, b: 35 })
  const accentSwatch =
    palette.Vibrant || palette.LightVibrant || palette.Muted || palette.LightMuted
  const accent = accentSwatch
    ? { r: accentSwatch.r, g: accentSwatch.g, b: accentSwatch.b }
    : { r: 246, g: 176, b: 107 }

  // Frost the dark muted colour for the glass panes.
  const glassBase = mix(dark, 0, 0.15) // nudge a touch darker
  const lightBg = luminance(glassBase) > 0.6
  const ink = lightBg ? { r: 20, g: 22, b: 28 } : { r: 245, g: 247, b: 252 }

  return {
    glass: rgba(glassBase, 0.55),
    glassStrong: rgba(glassBase, 0.8),
    ink: rgba(ink, 0.96),
    inkSoft: rgba(ink, 0.55),
    accent: rgba(accent, 1),
    accentSoft: rgba(accent, 0.18),
    line: lightBg ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.09)',
  }
}

async function computeTheme() {
  const path = await getWallpaperPath()
  if (!path) return null
  try {
    const Vibrant = require('node-vibrant')
    const palette = await Vibrant.from(path).getPalette()
    return buildTheme(palette)
  } catch (err) {
    console.warn('[wallpaper] palette failed:', err.message)
    return null
  }
}

// Calls onChange(theme) whenever the wallpaper file path changes. Returns a
// cleanup function.
function watchWallpaper(onChange) {
  let last = ''
  const tick = async () => {
    const path = await getWallpaperPath()
    if (path && path !== last) {
      last = path
      const theme = await computeTheme()
      if (theme) onChange(theme)
    }
  }
  const interval = setInterval(tick, 8000)
  return () => clearInterval(interval)
}

module.exports = { computeTheme, watchWallpaper }

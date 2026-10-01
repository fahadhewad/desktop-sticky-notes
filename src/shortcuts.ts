import type { Shortcuts } from './types'

// Mirrors DEFAULT_SHORTCUTS in electron/main.js.
export const DEFAULT_SHORTCUTS: Shortcuts = {
  quickAdd: 'CommandOrControl+Alt+N',
  toggle: 'CommandOrControl+Shift+S',
}

const isMac = /mac/i.test(navigator.platform)

const NAMED_KEYS: Record<string, string> = {
  Space: 'Space',
  Enter: 'Enter',
  Tab: 'Tab',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Insert: 'Insert',
  Delete: 'Delete',
  Backspace: 'Backspace',
  NumpadAdd: 'numadd',
  NumpadSubtract: 'numsub',
  NumpadMultiply: 'nummult',
  NumpadDivide: 'numdiv',
  NumpadDecimal: 'numdec',
}

// The physical key of a keyboard event as an Electron accelerator key, or null
// for modifiers and keys we don't support.
function keyFromCode(code: string): string | null {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit\d$/.test(code)) return code.slice(5)
  if (/^Numpad\d$/.test(code)) return `num${code.slice(6)}`
  if (/^F([1-9]|1\d|2[0-4])$/.test(code)) return code
  return NAMED_KEYS[code] ?? null
}

export type Recorded = { accelerator: string } | { error: string } | null

// Turn a keydown into an Electron accelerator ("CommandOrControl+Alt+N").
// Returns null while only modifiers are held down.
export function acceleratorFromEvent(e: KeyboardEvent): Recorded {
  const key = keyFromCode(e.code)
  if (!key) return null
  const mods: string[] = []
  if (e.ctrlKey) mods.push(isMac ? 'Ctrl' : 'CommandOrControl')
  if (e.metaKey) mods.push(isMac ? 'CommandOrControl' : 'Super')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')
  const isFunctionKey = /^F\d+$/.test(key)
  if (!isFunctionKey && !mods.some((m) => m !== 'Shift')) {
    return { error: `Add ${isMac ? 'Cmd, Ctrl or Option' : 'Ctrl, Alt or Win'} so it doesn't block normal typing` }
  }
  return { accelerator: [...mods, key].join('+') }
}

// "CommandOrControl+Alt+N" → "Ctrl + Alt + N" (or "⌘ ⌥ N" on a Mac).
export function formatAccelerator(accelerator: string): string {
  if (!accelerator) return 'Off'
  const names: Record<string, string> = isMac
    ? { CommandOrControl: '⌘', Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Super: '⌘' }
    : { CommandOrControl: 'Ctrl', Super: 'Win' }
  return accelerator
    .split('+')
    .map((part) => names[part] ?? (part.startsWith('num') ? `Num ${part.slice(3)}` : part))
    .join(isMac ? ' ' : ' + ')
}

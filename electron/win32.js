'use strict'
// Best-effort Windows desktop pinning.
//
// Goal: keep the widget at the very bottom of the z-order (just above the
// wallpaper, below every normal window) while still being clickable. We do this
// with a couple of user32 calls via koffi (a prebuilt FFI, so no native compile
// step). Everything is wrapped in try/catch — if it fails for any reason the app
// still runs as a plain frameless window.

let api = null

function load() {
  if (api) return api
  const koffi = require('koffi')
  const user32 = koffi.load('user32.dll')

  // HWNDs are pointer-sized; using uintptr_t lets us pass the raw handle value.
  const SetWindowPos = user32.func('__stdcall', 'SetWindowPos', 'bool', [
    'uintptr_t', 'uintptr_t', 'int', 'int', 'int', 'int', 'int', 'uint',
  ])
  const GetWindowLongPtrW = user32.func('__stdcall', 'GetWindowLongPtrW', 'intptr_t', [
    'uintptr_t', 'int',
  ])
  const SetWindowLongPtrW = user32.func('__stdcall', 'SetWindowLongPtrW', 'intptr_t', [
    'uintptr_t', 'int', 'intptr_t',
  ])

  api = { SetWindowPos, GetWindowLongPtrW, SetWindowLongPtrW }
  return api
}

const HWND_BOTTOM = 1
const SWP_NOSIZE = 0x0001
const SWP_NOMOVE = 0x0002
const SWP_NOACTIVATE = 0x0010
const GWL_EXSTYLE = -20
const WS_EX_NOACTIVATE = 0x08000000
const WS_EX_TOOLWINDOW = 0x00000080

function handleOf(win) {
  const buf = win.getNativeWindowHandle()
  // x64 handle is 8 bytes little-endian; fall back to 32-bit if needed.
  return buf.length >= 8 ? buf.readBigUInt64LE(0) : BigInt(buf.readUInt32LE(0))
}

// Make the window never steal activation and stay out of alt-tab.
function makeNonActivating(win) {
  try {
    const { GetWindowLongPtrW, SetWindowLongPtrW } = load()
    const hwnd = handleOf(win)
    const ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE)
    SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex | WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW)
  } catch (err) {
    console.warn('[win32] makeNonActivating failed:', err.message)
  }
}

// Push the window to the bottom of the z-order without moving/resizing it.
function sendToBottom(win) {
  try {
    const { SetWindowPos } = load()
    const hwnd = handleOf(win)
    SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE)
  } catch (err) {
    console.warn('[win32] sendToBottom failed:', err.message)
  }
}

// Pin the window to the desktop layer and keep it there. Returns a cleanup fn.
function pinToDesktop(win) {
  if (process.platform !== 'win32') return () => {}
  makeNonActivating(win)
  sendToBottom(win)
  // Re-assert bottom position whenever something might have raised it.
  const reassert = () => sendToBottom(win)
  win.on('show', reassert)
  win.on('focus', reassert)
  win.on('blur', reassert)
  const interval = setInterval(reassert, 2500)
  return () => clearInterval(interval)
}

module.exports = { pinToDesktop, sendToBottom }

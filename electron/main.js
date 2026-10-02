'use strict'
const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  screen,
} = require('electron')
const path = require('path')
const Store = require('electron-store')
const { pinToDesktop, sendToBottom, setRaised } = require('./win32')
const { computeTheme, watchWallpaper } = require('./wallpaper')
const { rescheduleAll, snoozeTask, rescheduleDeadlines } = require('./scheduler')

const isDev = process.env.NODE_ENV === 'development'

// Mirrors DEFAULT_SHORTCUTS in src/shortcuts.ts. An empty string means "off".
const DEFAULT_SHORTCUTS = {
  quickAdd: 'CommandOrControl+Alt+N',
  toggle: 'CommandOrControl+Shift+S',
}

const ANCHOR_MARGIN = 16 // gap between an anchored widget and the screen edge
const QUICK_WIDTH = 600
const QUICK_HEIGHT = 168

const defaults = {
  todos: [],
  schedule: [],
  spanish: { learnedCount: 0, lastLearnedDate: '' },
  settings: {
    width: 720,
    height: 460,
    matchWallpaper: true,
    accentColor: '#f6b06b',
    opacity: 1,
    launchAtStartup: false,
    sizeProfiles: [
      { id: 'compact', name: 'Compact', width: 560, height: 380 },
      { id: 'standard', name: 'Standard', width: 720, height: 460 },
      { id: 'large', name: 'Large', width: 900, height: 600 },
    ],
  },
}

const store = new Store({ defaults })

let win = null
let quickWin = null
let tray = null
let hintShown = false
let unpin = () => {}
let unwatch = () => {}

function createWindow() {
  const settings = store.get('settings')
  const pos = settings.position || {}

  win = new BrowserWindow({
    width: settings.width,
    height: settings.height,
    x: pos.x,
    y: pos.y,
    minWidth: 420,
    minHeight: 320,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    frame: false,
    transparent: true,
    resizable: true,
    maximizable: true,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    alwaysOnTop: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRenderer(win)

  win.once('ready-to-show', () => {
    applyAnchor()
    win.show()
    // Pin to the desktop layer (Windows only; no-op elsewhere).
    unpin = pinToDesktop(win)
  })

  // --- remember size when the user drags an edge (debounced) ---
  let resizeTimer = null
  win.on('resize', () => {
    if (!win) return
    const [width, height] = win.getSize()
    win.webContents.send('window:resized', { width, height })
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      store.set('settings.width', width)
      store.set('settings.height', height)
      snapToAnchor()
    }, 400)
  })
  win.on('unmaximize', snapToAnchor)
  // A widget summoned to the front drops back to the desktop once you click away.
  win.on('blur', lowerWindow)

  // --- remember position ---
  let moveTimer = null
  win.on('move', () => {
    if (!win) return
    const [x, y] = win.getPosition()
    clearTimeout(moveTimer)
    moveTimer = setTimeout(() => store.set('settings.position', { x, y }), 400)
  })

  win.on('closed', () => {
    win = null
    // The hidden quick-add window would otherwise keep the app alive.
    if (quickWin) quickWin.destroy()
  })
}

function loadRenderer(target, hash) {
  if (isDev) {
    target.loadURL(`http://localhost:5173/${hash ? `#${hash}` : ''}`)
  } else {
    target.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), hash ? { hash } : undefined)
  }
}

// --- anchoring: optionally stick the widget to a corner / edge of its screen ---
function currentAnchor() {
  const anchor = store.get('settings.anchor')
  return anchor && anchor !== 'free' ? anchor : null
}

// Top-left position that puts a width x height window at `anchor` (e.g.
// 'top-right') on the display the widget is currently on.
function anchoredPosition(anchor, width, height) {
  const wa = screen.getDisplayMatching(win.getBounds()).workArea
  const [v, h] = anchor.split('-')
  const x =
    h === 'left'
      ? wa.x + ANCHOR_MARGIN
      : h === 'right'
        ? wa.x + wa.width - width - ANCHOR_MARGIN
        : wa.x + Math.round((wa.width - width) / 2)
  const y =
    v === 'top'
      ? wa.y + ANCHOR_MARGIN
      : v === 'bottom'
        ? wa.y + wa.height - height - ANCHOR_MARGIN
        : wa.y + Math.round((wa.height - height) / 2)
  return { x: Math.max(wa.x, x), y: Math.max(wa.y, y) }
}

function snapToAnchor() {
  const anchor = currentAnchor()
  if (!win || !anchor || win.isMaximized()) return
  const [width, height] = win.getSize()
  const { x, y } = anchoredPosition(anchor, width, height)
  const [cx, cy] = win.getPosition()
  if (cx !== x || cy !== y) win.setPosition(x, y)
}

let appliedAnchor
function applyAnchor() {
  if (!win) return
  appliedAnchor = currentAnchor()
  // An anchored widget stays put; the renderer also drops its drag region.
  win.setMovable(!appliedAnchor)
  snapToAnchor()
}

// --- quick add: a small always-on-top box summoned by a global shortcut ---
function createQuickWindow() {
  quickWin = new BrowserWindow({
    width: QUICK_WIDTH,
    height: QUICK_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  quickWin.setAlwaysOnTop(true, 'screen-saver')
  loadRenderer(quickWin, 'quick')
  // Like a launcher: clicking anywhere else dismisses it (the draft is kept).
  quickWin.on('blur', () => quickWin && quickWin.hide())
  quickWin.on('closed', () => {
    quickWin = null
  })
}

function toggleQuickCapture() {
  if (!quickWin) createQuickWindow()
  if (quickWin.isVisible() && quickWin.isFocused()) {
    quickWin.hide()
    return
  }
  // Open on whichever screen the mouse is on, a little above centre.
  const wa = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea
  quickWin.setBounds({
    x: Math.round(wa.x + (wa.width - QUICK_WIDTH) / 2),
    y: Math.round(wa.y + wa.height * 0.28),
    width: QUICK_WIDTH,
    height: QUICK_HEIGHT,
  })
  quickWin.show()
  quickWin.focus()
  quickWin.webContents.send('quick:open')
}

// --- global shortcuts (configurable in Settings) ---
let shortcutStatus = {}
let shortcutsSuspended = false
let registeredShortcuts = null

function currentShortcuts() {
  return { ...DEFAULT_SHORTCUTS, ...(store.get('settings.shortcuts') || {}) }
}

function registerShortcuts() {
  globalShortcut.unregisterAll()
  registeredShortcuts = null
  // Paused while the user records a new combo in Settings, so pressing the
  // current one doesn't fire it.
  if (shortcutsSuspended) return
  const shortcuts = currentShortcuts()
  const actions = { toggle: summonOrHide, quickAdd: toggleQuickCapture }
  const status = {}
  for (const [name, action] of Object.entries(actions)) {
    const accelerator = shortcuts[name]
    if (!accelerator) {
      status[name] = 'off'
      continue
    }
    let ok = false
    try {
      ok = globalShortcut.register(accelerator, action)
    } catch (err) {
      console.warn(`[shortcut] invalid accelerator ${accelerator}:`, err.message)
    }
    if (!ok) console.warn(`[shortcut] could not register ${accelerator} (${name})`)
    status[name] = ok ? 'ok' : 'failed'
  }
  registeredShortcuts = JSON.stringify(shortcuts)
  shortcutStatus = status
  if (win) win.webContents.send('shortcuts:status', status)
}

// --- system tray: the widget tucks away here instead of cluttering the taskbar ---
function createTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')))
  tray.setToolTip('Desktop Sticky Notes')

  const refresh = () => {
    const visible = !!win && win.isVisible()
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: visible ? 'Hide widget' : 'Show widget', click: toggleWindow },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() },
      ]),
    )
  }

  refresh()
  tray.on('click', toggleWindow)
  if (win) {
    win.on('show', refresh)
    win.on('hide', refresh)
  }
}

// Tray: hide when showing, otherwise bring it back in front of everything.
function toggleWindow() {
  if (!win) return
  if (win.isVisible()) win.hide()
  else raiseWindow()
}

// Show/hide shortcut: the first press brings the widget in front of your
// other windows (and focuses it for typing); pressing again while it's in
// front hides it.
function summonOrHide() {
  if (!win) return
  if (win.isVisible() && win.isFocused()) win.hide()
  else raiseWindow()
}

let isRaised = false
function raiseWindow() {
  if (!win) return
  isRaised = true
  setRaised(true)
  win.show()
  // Briefly topmost so it lands above everything, then a normal window that
  // other apps can cover again once you click them.
  win.setAlwaysOnTop(true)
  win.moveTop()
  win.focus()
  setTimeout(() => win && win.setAlwaysOnTop(false), 200)
}

function lowerWindow() {
  if (!win || !isRaised) return
  isRaised = false
  setRaised(false)
  win.setAlwaysOnTop(false)
  if (process.platform === 'win32') sendToBottom(win)
}

// Hide to the tray (used by the widget's "minimise" control). A real minimise is
// a dead-end here because the window is skipTaskbar, so we hide instead and let
// the tray bring it back.
function hideToTray() {
  if (!win) return
  win.hide()
  if (!hintShown) {
    hintShown = true
    try {
      tray.displayBalloon({
        title: 'Still running',
        content: 'The widget is tucked away in your tray — click the tray icon to bring it back.',
      })
    } catch {
      /* balloons are best-effort */
    }
  }
}

// --- reminders ---
function onTaskDue(item) {
  if (Notification.isSupported()) {
    new Notification({ title: 'Reminder', body: item.text, silent: !!item.silent }).show()
  }
  if (win) win.webContents.send('task:due', item.id)
}

function startScheduler() {
  rescheduleAll(store.get('schedule'), onTaskDue)
}

// --- to-do deadlines ---
function onDeadline(todo) {
  if (Notification.isSupported()) {
    new Notification({ title: 'Deadline', body: todo.text }).show()
  }
}

function startDeadlines() {
  rescheduleDeadlines(store.get('boards'), onDeadline)
}

// Reflect the "launch at startup" setting into the OS login items.
function applyLoginItem(settings) {
  try {
    app.setLoginItemSettings({ openAtLogin: !!(settings && settings.launchAtStartup) })
  } catch (err) {
    console.warn('[startup] setLoginItemSettings failed:', err.message)
  }
}

// --- IPC ---
ipcMain.handle('state:load', () => {
  // Migrate pre-boards data (a flat `todos` list) into a default board.
  let boards = store.get('boards')
  if (!boards) {
    boards = [{ id: 'default', name: 'Notes', todos: store.get('todos') || [] }]
    store.set('boards', boards)
  }
  return {
    boards,
    schedule: store.get('schedule'),
    settings: store.get('settings'),
    spanish: store.get('spanish'),
  }
})

ipcMain.handle('state:save', (_e, key, value) => {
  if (key === 'settings') {
    // The main process owns the window position (saved on move), so don't let
    // the renderer's possibly stale copy overwrite it.
    value = { ...value, position: store.get('settings.position') }
  }
  store.set(key, value)
  if (key === 'schedule') startScheduler()
  if (key === 'boards') startDeadlines()
  if (key === 'settings') {
    applyLoginItem(value)
    if (currentAnchor() !== appliedAnchor) applyAnchor()
    if (!shortcutsSuspended && JSON.stringify(currentShortcuts()) !== registeredShortcuts) {
      registerShortcuts()
    }
  }
})

ipcMain.on('window:resize', (_e, width, height) => {
  if (!win) return
  const w = Math.round(width)
  const h = Math.round(height)
  const anchor = currentAnchor()
  // Resize and re-anchor in one step so an anchored widget doesn't jump.
  if (anchor && !win.isMaximized()) win.setBounds({ ...anchoredPosition(anchor, w, h), width: w, height: h })
  else win.setSize(w, h)
})

ipcMain.on('window:minimize', () => hideToTray())
ipcMain.on('window:toggle-maximize', () => {
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})
ipcMain.on('window:close', () => win && win.close())

ipcMain.handle('theme:get', () => computeTheme())

ipcMain.on('notify', (_e, title, body) => {
  if (Notification.isSupported()) new Notification({ title, body }).show()
})

ipcMain.on('reminder:snooze', (_e, id, minutes) => {
  const item = (store.get('schedule') || []).find((s) => s.id === id)
  if (item) snoozeTask(item, minutes, onTaskDue)
})

ipcMain.handle('shortcuts:status', () => shortcutStatus)
ipcMain.on('shortcuts:suspend', (_e, suspended) => {
  shortcutsSuspended = !!suspended
  // The widget is non-activating on Windows, so make sure it is the one
  // receiving key presses while a new combo is recorded.
  if (shortcutsSuspended && win && !win.isFocused()) win.focus()
  registerShortcuts()
})

// The quick-add box hands its note to the widget, which owns the boards.
ipcMain.on('quick:add', (_e, todo) => {
  if (win && todo && typeof todo.text === 'string') win.webContents.send('todo:quick-add', todo)
})
ipcMain.on('quick:close', () => quickWin && quickWin.hide())

// --- lifecycle ---
app.whenReady().then(() => {
  createWindow()
  createQuickWindow() // pre-warmed so the shortcut opens it instantly
  createTray()
  startScheduler()
  startDeadlines()
  applyLoginItem(store.get('settings'))
  registerShortcuts()
  // Keep an anchored widget in its spot when screens or the taskbar change.
  screen.on('display-metrics-changed', snapToAnchor)
  screen.on('display-added', snapToAnchor)
  screen.on('display-removed', snapToAnchor)
  unwatch = watchWallpaper((theme) => {
    if (win) win.webContents.send('theme:changed', theme)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())

app.on('window-all-closed', () => {
  unpin()
  unwatch()
  if (tray) {
    tray.destroy()
    tray = null
  }
  if (process.platform !== 'darwin') app.quit()
})

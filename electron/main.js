'use strict'
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } = require('electron')
const path = require('path')
const Store = require('electron-store')
const { pinToDesktop } = require('./win32')
const { computeTheme, watchWallpaper } = require('./wallpaper')
const { rescheduleAll, snoozeTask } = require('./scheduler')

const isDev = process.env.NODE_ENV === 'development'

const defaults = {
  todos: [],
  schedule: [],
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

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  win.once('ready-to-show', () => {
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
    }, 400)
  })

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
  })
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

function toggleWindow() {
  if (!win) return
  if (win.isVisible()) win.hide()
  else win.show()
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
    new Notification({ title: 'Reminder', body: item.text, silent: false }).show()
  }
  if (win) win.webContents.send('task:due', item.id)
}

function startScheduler() {
  rescheduleAll(store.get('schedule'), onTaskDue)
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
ipcMain.handle('state:load', () => ({
  todos: store.get('todos'),
  schedule: store.get('schedule'),
  settings: store.get('settings'),
}))

ipcMain.handle('state:save', (_e, key, value) => {
  store.set(key, value)
  if (key === 'schedule') startScheduler()
  if (key === 'settings') applyLoginItem(value)
})

ipcMain.on('window:resize', (_e, width, height) => {
  if (win) win.setSize(Math.round(width), Math.round(height))
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

// --- lifecycle ---
app.whenReady().then(() => {
  createWindow()
  createTray()
  startScheduler()
  applyLoginItem(store.get('settings'))
  unwatch = watchWallpaper((theme) => {
    if (win) win.webContents.send('theme:changed', theme)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  unpin()
  unwatch()
  if (tray) {
    tray.destroy()
    tray = null
  }
  if (process.platform !== 'darwin') app.quit()
})

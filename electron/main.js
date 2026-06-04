'use strict'
const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')
const Store = require('electron-store')
const { pinToDesktop } = require('./win32')
const { computeTheme, watchWallpaper } = require('./wallpaper')
const { rescheduleAll } = require('./scheduler')

const isDev = process.env.NODE_ENV === 'development'

const defaults = {
  todos: [],
  schedule: [],
  settings: {
    width: 720,
    height: 460,
    matchWallpaper: true,
    accentColor: '#f6b06b',
    sizeProfiles: [
      { id: 'compact', name: 'Compact', width: 560, height: 380 },
      { id: 'standard', name: 'Standard', width: 720, height: 460 },
      { id: 'large', name: 'Large', width: 900, height: 600 },
    ],
  },
}

const store = new Store({ defaults })

let win = null
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

// --- IPC ---
ipcMain.handle('state:load', () => ({
  todos: store.get('todos'),
  schedule: store.get('schedule'),
  settings: store.get('settings'),
}))

ipcMain.handle('state:save', (_e, key, value) => {
  store.set(key, value)
  if (key === 'schedule') startScheduler()
})

ipcMain.on('window:resize', (_e, width, height) => {
  if (win) win.setSize(Math.round(width), Math.round(height))
})

ipcMain.on('window:minimize', () => win && win.minimize())
ipcMain.on('window:toggle-maximize', () => {
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
ipcMain.on('window:close', () => win && win.close())

ipcMain.handle('theme:get', () => computeTheme())

ipcMain.on('notify', (_e, title, body) => {
  if (Notification.isSupported()) new Notification({ title, body }).show()
})

// --- lifecycle ---
app.whenReady().then(() => {
  createWindow()
  startScheduler()
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
  if (process.platform !== 'darwin') app.quit()
})

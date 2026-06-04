'use strict'
const { contextBridge, ipcRenderer } = require('electron')

// Bridge exposed to the renderer as window.api. Mirrors StickyApi in src/api.ts.
contextBridge.exposeInMainWorld('api', {
  loadState: () => ipcRenderer.invoke('state:load'),
  save: (key, value) => ipcRenderer.invoke('state:save', key, value),

  resizeWindow: (width, height) => ipcRenderer.send('window:resize', width, height),
  onWindowResized: (cb) => {
    const handler = (_e, size) => cb(size)
    ipcRenderer.on('window:resized', handler)
    return () => ipcRenderer.removeListener('window:resized', handler)
  },

  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),

  getTheme: () => ipcRenderer.invoke('theme:get'),
  onThemeChanged: (cb) => {
    const handler = (_e, theme) => cb(theme)
    ipcRenderer.on('theme:changed', handler)
    return () => ipcRenderer.removeListener('theme:changed', handler)
  },

  notify: (title, body) => ipcRenderer.send('notify', title, body),

  onTaskDue: (cb) => {
    const handler = (_e, id) => cb(id)
    ipcRenderer.on('task:due', handler)
    return () => ipcRenderer.removeListener('task:due', handler)
  },
})

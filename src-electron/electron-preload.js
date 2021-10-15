/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge } from 'electron'
import { ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('list', {
  get: () => {
    ipcRenderer.send('getList')
  },
  onResponse: (fn) => {
    ipcRenderer.on('returnList', (event, ...args) => {
      fn(...args)
    })
  },
})

contextBridge.exposeInMainWorld('Fn', {
  on: (item) => {
    ipcRenderer.send('poweron', item)
  },
  off: (item) => {
    ipcRenderer.send('poweroff', item)
  },
  delete: (item) => {
    ipcRenderer.send('delete', item)
  },
  allon: () => {
    ipcRenderer.send('poweronall')
  },
  alloff: () => {
    ipcRenderer.send('poweroffall')
  },
  deleteAll: () => {
    ipcRenderer.send('deleteAll')
  }
})

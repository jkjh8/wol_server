import { app, BrowserWindow, nativeTheme } from 'electron'
import { ipcMain } from 'electron'
import path from 'path'
import net from 'net'
import dgram from 'dgram'
import wol from 'node-wol'
import db from './db'
import { getList, updateDevice, sendMulticast, sendWindow } from './functions'
import { createMulticast } from './multicast'

import './ipc'

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) {}

let mainWindow
let multicast

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1400, //700
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })
  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // menu
  // mainWindow.setMenu(null)
  // open multicast port
  multicast = await createMulticast()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// const server = dgram.createSocket('udp4')

// server.bind(server_port, () => {
//   server.setBroadcast(true)
//   server.setMulticastTTL(128)
//   server.addMembership(multicast_addr)
// })

// function sync() {
//   setInterval(async () => {
//     // ui list update
//     getList()
//     // send sync to clients
//     server.send(
//       JSON.stringify({ command: 'sync' }),
//       client_port,
//       multicast_addr
//     )
//   }, 5000)
// }

// sync()

// server.on('message', async function (message, remote) {
//   try {
//     const args = JSON.parse(message)
//     switch (args.command) {
//       case 'device':
//         updateDevice(args.value)
//         break
//     }
//   } catch (error) {
//     console.error(error)
//   }
// })

// const tcpSocket = net
//   .createServer(function (socket) {
//     console.log('client connect: ', socket.remoteAddress)
//     socket.on('data', function (data) {
//       console.log(data)
//       socket.write(data)
//     })
//   })
//   .listen(9995, '0.0.0.0')

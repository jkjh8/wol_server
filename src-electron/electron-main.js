import { app, BrowserWindow, nativeTheme } from 'electron'
import { ipcMain } from 'electron'
import path from 'path'
import net from 'net'
import dgram from 'dgram'
import wol from 'node-wol'
import db from './db'
import { getList, updateDevice, sendMulticast, sendWindow } from './func'

const multicast_addr = '230.185.192.109'
const client_port = 52319
const server_port = 56434

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
let interval

function createWindow() {
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
  mainWindow.setMenu(null)
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

const server = dgram.createSocket('udp4')

server.bind(server_port, () => {
  server.setBroadcast(true)
  server.setMulticastTTL(128)
  server.addMembership(multicast_addr)
})

function sync() {
  setInterval(async () => {
    // ui list update
    getList()
    // send sync to clients
    server.send(
      JSON.stringify({ command: 'sync' }),
      client_port,
      multicast_addr
    )
  }, 5000)
}

sync()

server.on('message', async function (message, remote) {
  try {
    const args = JSON.parse(message)
    switch (args.command) {
      case 'device':
        updateDevice(args.value)
        break
    }
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('onRequest', async (e, args) => {
  try {
    let devices
    switch (args.command) {
      case 'delete':
        await db.list.remove({ _id: args.value._id })
        getList()
        break
      case 'deleteAll':
        await db.list.remove({}, { multi: true })
        getList()
        break
      case 'getlist':
        getList()
        break
      case 'off':
        sendMulticast(
          {
            command: 'off',
            value: [args.value.mac],
          },
          server,
          client_port,
          multicast_addr
        )
        break
      case 'on': {
        wol.wake(args.value.mac, (err) => {
          if (err) return console.error(err)
          console.log('power on', args.value.mac)
        })
        break
      }
      case 'alloff':
        devices = await db.list.find()
        sendMulticast(
          {
            command: 'off',
            value: devices.map((e) => e.mac),
          },
          server,
          client_port,
          multicast_addr
        )
        break
      case 'allon':
        devices = await db.list.find()
        devices.forEach((device) => {
          wol.wake(device.mac, (err) => {
            if (err) return console.error(err)
            console.log('power on', device.mac)
          })
        })
        break
    }
  } catch (e) {
    console.error(e)
  }
})

const tcpSocket = net
  .createServer(function (socket) {
    console.log('client connect: ', socket.remoteAddress)
    socket.on('data', function (data) {
      console.log(data)
      socket.write(data)
    })
  })
  .listen(9995, '0.0.0.0')

import { app, BrowserWindow, nativeTheme } from 'electron'
import { ipcMain } from 'electron'
import path from 'path'
import dgram from 'dgram'
import moment from 'moment'
import wol from 'node-wol'

import db from './db'

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
    width: 700,
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
const client = dgram.createSocket('udp4')
const MCAST_ADDR = '230.185.192.109'
const server_port = 12341
const client_port = 12340

server.bind(41418, function () {
  server.setBroadcast(true)
  server.setMulticastTTL(128)
  server.addMembership(MCAST_ADDR)
})

client.bind(client_port, '0.0.0.0')

function sendCommand(command) {
  try {
    const message = JSON.stringify(command)
    server.send(message, 0, message.length, server_port, MCAST_ADDR)
  } catch (error) {
    console.error(error)
  }
}

client.on('listening', function () {
  const address = client.address()
  console.log('udp listening on: ' + address.address + ':' + address.port)
  client.setBroadcast(true)
  client.setMulticastTTL(128)
  client.addMembership(MCAST_ADDR)
})

client.on('message', async function (message, remote) {
  try {
    const device = JSON.parse(message)
    const r = await db.list.update(
      {
        mac: device.mac,
      },
      {
        $set: {
          name: device.name,
          address: device.address,
          mac: device.mac,
          hostname: device.hostname,
          block: device.block,
          idle: false,
        },
      },
      {
        upsert: true,
      }
    )
    console.log(r)
  } catch (error) {
    console.error(error)
  }
})

function sendSync() {
  interval = setInterval(function () {
    sendCommand({ section: 'sync' })
  }, 5000)
}

sendSync()

// list
ipcMain.on('getList', async (event) => {
  const r = await getList()
  mainWindow.webContents.send('returnList', r)
})

async function getList() {
  try {
    const list = await db.list.find()
    const idleCount = await db.list.count({ idle: true })
    const blockCount = await db.list.count({ block: true })
    let statusCount = 0
    const t2 = moment()
    for (let i = 0; i < list.length; i++) {
      list[i]['idx'] = i + 1
      const t1 = moment(list[i].updatedAt)
      const duration = moment.duration(t2.diff(t1)).asSeconds()
      if (duration > 10) {
        list[i]['status'] = false
        statusCount = statusCount + 1
      } else {
        list[i]['status'] = true
      }
    }
    return {
      list,
      listCount: list.length,
      idleCount,
      blockCount,
      statusCount,
    }
  } catch (error) {
    console.error(error)
  }
}

// poweron
ipcMain.on('poweron', async (event, args) => {
  console.log(args)
  wol.wake(args.mac, function (error) {
    if (error) {
      console.error(error)
    }
    return console.log('power on : ', args.mac)
  })
  await db.list.update({ mac: args.mac }, { $set: { idle: true } })
})

ipcMain.on('poweroff', async (event, args) => {
  sendCommand({ section: 'power', args: [args.mac] })
})

ipcMain.on('delete', async (event, args) => {
  console.log(args)
  await db.list.remove({ _id: args._id })
  const r = await getList()
  mainWindow.webContents.send('returnList', r)
})

ipcMain.on('poweronall', async (event) => {
  try {
    const devices = await db.list.find({}, { mac: 1, _id: 0 })
    devices.forEach((device) => {
      wol.wake(device.mac, function (err) {
        if (err) return console.error(err)
        return console.log('Power On: ', device.mac)
      })
    })
    const r = await db.list.update({}, { $set: { idel: true } })
    console.log(r)
  } catch (err) {
    console.error(err)
  }
})

ipcMain.on('poweroffall', async (event) => {
  try {
    const devices = await db.list.find({}, { mac: 1, _id: 0 })
    const deviceMacArr = devices.map((e) => e.mac)
    console.log(deviceMacArr)
    sendCommand({ section: 'power', args: deviceMacArr })
  } catch (err) {
    console.error(err)
  }
})

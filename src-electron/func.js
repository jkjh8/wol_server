import db from './db'
import moment from 'moment'
import { BrowserWindow } from 'electron'

async function getList() {
  try {
    const mainWindow = BrowserWindow.fromId(1)
    if (!mainWindow) return null
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

    return sendWindow({
      command: 'list',
      value: {
        list,
        idleCount,
        blockCount,
        statusCount,
      },
    })
  } catch (e) {
    console.error(e)
  }
}

async function updateDevice(device) {
  try {
    await db.list.update(
      { mac: device.mac },
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
      { upsert: true }
    )
    return await getList()
  } catch (e) {
    console.error(e)
  }
}

async function sendMulticast(args, server, port, addr) {
  try {
    return server.send(JSON.stringify(args), port, addr)
  } catch (e) {
    console.error(e)
  }
}

async function sendWindow(args) {
  try {
    const mainWindow = BrowserWindow.fromId(1)
    mainWindow.webContents.send('onResponse', args)
  } catch (e) {
    console.error(e)
  }
}

export { getList, updateDevice, sendMulticast, sendWindow }

import { ipcMain } from 'electron'
import db from '../db'

import { getList, powerOn } from '../functions'
import { multicastSend } from '../multicast'

ipcMain.on('onRequest', async (e, args) => {
  try {
    let devices
    console.log(args)
    switch (args.command) {
      case 'delete':
        await db.list.remove({ mac: args.value })
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
        multicastSend({
          command: 'off',
          value: [args.value.mac],
        })
        break
      case 'on': {
        powerOn(args.value.mac)
        break
      }
      case 'alloff':
        devices = await db.list.find()
        multicastSend({
          command: 'off',
          value: devices.map((e) => e.mac),
        })
        break
      case 'allon':
        devices = await db.list.find()
        devices.forEach((device) => {
          powerOn(device.mac)
        })
        break
      case 'resync':
        multicastSend({ command: 'sync' })
        break
    }
  } catch (e) {
    console.error(e)
  }
})

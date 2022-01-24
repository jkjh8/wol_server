import { app, Menu, nativeImage, BrowserWindow } from 'electron'

const img_close = nativeImage.createFromPath('src-electron/icons/close.png')
const img_reload = nativeImage.createFromPath('src-electron/icons/reset.png')
const img_info = nativeImage.createFromPath('src-electron/icons/info.png')

let mainMenu
let autoSync = false

const createMainMenu = (syncVal) => {
  if (syncVal) {
    autoSync = true
  }
  mainMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: '종료',
          type: 'normal',
          icon: img_close.resize({ width: 16, height: 16 }),
          accelerator: 'alt+F4',
          click: () => {
            app.exit(0)
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Auto Sync',
          type: 'checkbox',
          checked: autoSync,
          id: 'autoSync',
          accelerator: 'CommandOrControl+S',
          click: () => {
            //
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          type: 'normal',
          accelerator: 'CommandOrControl+R',
          icon: img_reload.resize({ width: 16, height: 16 }),
          click: () => {
            //
          }
        }
      ]
    },
    {
      label: 'Helf',
      submenu: [
        {
          label: 'About',
          type: 'normal',
          icon: img_info.resize({ width: 16, height: 16 }),
          accelerator: 'F1',
          click: () => {
            BrowserWindow.fromId(1).webContents.send('onResponse', {
              command: 'info'
            })
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(mainMenu)
  return mainMenu
}

export { createMainMenu }

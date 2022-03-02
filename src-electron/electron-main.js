import { app, BrowserWindow, nativeTheme } from 'electron'
import path from 'path'

// 중복실행 방지
app.requestSingleInstanceLock({
  key: '2qw2e3r4aldkeos0sl123ao123ads23'
})
app.on('second-instance', (e, argv, cwd) => {
  console.log(e, argv, cwd)
  dialog
    .showMessageBox({
      message: '중복 실행 오류',
      buttons: ['ok']
    })
    .then((r) => {
      console.log(r)
    })
  app.exit(0)
})

import { createMainMenu } from './menu'
import { createMulticast, multicastSend } from './multicast'

import './ipc'
import { getList } from './functions'

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
let mainMenu
let multicast

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700, //700
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
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
  mainMenu = createMainMenu()
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

const mainLoop = setInterval(() => {
  multicastSend({ command: 'sync' })
  getList()
}, 5000)

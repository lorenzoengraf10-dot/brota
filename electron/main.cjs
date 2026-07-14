const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

const DEV_ORIGIN = 'http://localhost:5173'

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 860,
    minWidth: 375,
    title: 'Brota',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  // Links externos: solo https y en el navegador del sistema, nunca en la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Bloquear navegación fuera de la app (dev server o archivo local).
  win.webContents.on('will-navigate', (event, url) => {
    const isDev = !app.isPackaged
    const allowed = isDev ? url.startsWith(DEV_ORIGIN) : url.startsWith('file://')
    if (!allowed) event.preventDefault()
  })

  const isDev = !app.isPackaged
  if (isDev) {
    win.loadURL(DEV_ORIGIN)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const electron = require('electron')
const {app, BrowserWindow} = electron

const path = require('path')
const url = require('url')

// Global reference of the window object
let mainWindow

function createWindow () {
  // Create the browser window
  if (process.env.e !== 'production')
    mainWindow = new BrowserWindow({width: 1300, height: 768})
  else
    mainWindow = new BrowserWindow({width: 1024, height: 768})

  //todo: save window size to setting
  // Load the index.html of the app
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null
  })

  // Open the DevTools
  if (process.env.e !== 'production')
    mainWindow.webContents.openDevTools({mode: 'right'})
}

// When Electron has finished initialization and is ready to create browser windows
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // Only quit the application on OS X if the user hits cmd + q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X, re-create a window in the app when the dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createWindow()
  }
})

if (require('electron-squirrel-startup')) return;
const path = require('path')
const glob = require('glob')
const window = require('window')
const {app, BrowserWindow, dialog, globalShortcut} = require('electron')
const autoUpdater = require('./auto-updater')
window.$ = window.jQuery = require('jquery')


const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Electron APIs')
app.showExitPrompt = true
let mainWindow = null

function initialize () {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()

  loadDemos()

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      frame: false,
      fullscreen: true,
      title: app.getName()
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL("https://google.com")

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }
    mainWindow.maximize()

    mainWindow.on('close', (e) => {
      if (app.showExitPrompt) {
        e.preventDefault() // Prevents the window from closing
        dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Deseja sair da aula',
          message: 'Deseja realmente sair da aula?'
        }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            app.showExitPrompt = false
            mainWindow.close()
          }
        })
      }
    })
  }
  app.on('ready', () => {
    createWindow()
    //autoUpdater.initialize()
    globalShortcut.register('F11', (e) => {
      return false
    })
  })

  app.on('window-all-closed', (e) => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
  /*
  app.on('before-quit', (ev) => {
    const hasUnsavedChanges = true; //Get from somewhere
    if (hasUnsavedChanges) {
      //I actually show a dialog asking if they should quit
      ev.preventDefault();
      createWindow()
      autoUpdater.initialize()
    }
  });*/
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return false

  return app.makeSingleInstance(() => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
  autoUpdater.updateMenu()
}

// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
  case '--squirrel-install':
    autoUpdater.createShortcut(() => { app.quit() })
    break
  case '--squirrel-uninstall':
    autoUpdater.removeShortcut(() => { app.quit() })
    break
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit()
    break
  default:
    initialize()
}
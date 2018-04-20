const electron = require('electron');
const {ipcMain} = require('electron');
const {autoUpdater} = require('electron-updater');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 900})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdates();
});

// When the updater is checking for an update
// let the browser window know.
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('checking-for-update');
});

// When downloading a new update
// let the browser window know.
autoUpdater.on('download-progress', () => {
  mainWindow.webContents.send('download-progress');
});

// When no update is available
// let the browser window know.
autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-not-available');
});

// When the update has been downloaded and is ready to be
// installed, let the browser window know.
autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('updateReady');
});

ipcMain.on('quitAndInstall', (event, arg) => {
  autoUpdater.quitAndInstall();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
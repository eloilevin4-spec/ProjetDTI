const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
const REACT_DEV_URL = 'http://localhost:3000';
const RETRY_INTERVAL = 500; 
const MAX_RETRIES = 40; 

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 540,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: false,
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  if (isDev) {
    waitForReact(REACT_DEV_URL, MAX_RETRIES, RETRY_INTERVAL)
      .then(() => mainWindow.loadURL(REACT_DEV_URL))
      .catch(() => console.error(`Impossible de se connecter au serveur React à ${REACT_DEV_URL}`));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  
  ipcMain.on('show-notification', (event, title, body) => {
    const notification = new Notification({ title, body });
    
    notification.on('click', () => {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    notification.show();
  });
}

function waitForReact(url, retriesLeft, interval) {
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      http.get(url, () => {
        console.log('Serveur React prêt ✔');
        resolve();
      }).on('error', () => {
        if (retriesLeft <= 0) return reject();
        retriesLeft--;
        setTimeout(tryConnect, interval);
      });
    };
    tryConnect();
  });
}

// Gestion du cycle de vie Electron
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

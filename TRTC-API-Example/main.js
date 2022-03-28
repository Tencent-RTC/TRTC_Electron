const path = require('path');
const { app, BrowserWindow, systemPreferences } = require('electron');

let isDev = false;
let debug = false;
for (let i = 2; i < process.argv.length; i++) {
  if (/--debug/.test(process.argv[i])) {
    debug = true;
  } else if (/--trtc_env=dev/.test(process.argv[i])) {
    isDev = true;
  }
}

if (process.mas) app.setName('TRTC Electron API Examples');

let mainWindow = null;

// 检查并申请设备权限：麦克风、摄像头、屏幕录制
async function checkAndApplyDeviceAccessPrivilege() {
  const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera');
  console.log(`checkAndApplyDeviceAccessPrivilege before apply cameraPrivilege: ${cameraPrivilege}`);
  if (cameraPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('camera');
  }

  const micPrivilege = systemPreferences.getMediaAccessStatus('microphone');
  console.log(`checkAndApplyDeviceAccessPrivilege before apply micPrivilege: ${micPrivilege}`);
  if (micPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('microphone');
  }

  const screenPrivilege = systemPreferences.getMediaAccessStatus('screen');
  console.log(`checkAndApplyDeviceAccessPrivilege before apply screenPrivilege: ${screenPrivilege}`);
}

function initialize() {
  makeSingleInstance();

  loadMainModules();

  function createWindow() {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
      },
    };

    mainWindow = new BrowserWindow(windowOptions);

    if (isDev) {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadURL(path.join('file://', __dirname, '/src/app/render/main-page/build/index.html'));
    }

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require('devtron').install();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(async () => {
    await checkAndApplyDeviceAccessPrivilege();
    createWindow();

    app.on('activate', () => {
      if (mainWindow === null) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
  if (process.mas) return;

  app.requestSingleInstanceLock();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Require each JS file in the src/app/main dir
function loadMainModules() {
  ['src/app/main/communication/index.js'].forEach(filePath => {
    require(path.join(__dirname, filePath));
  });
}

initialize();

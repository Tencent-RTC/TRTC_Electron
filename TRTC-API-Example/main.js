const path = require('path');
const { app, BrowserWindow, systemPreferences, crashReporter } = require('electron');

// 开启crash捕获
crashReporter.start({
  productName: 'trtc-electron-api-example',
  companyName: 'Tencent Cloud',
  submitURL: 'https://cloud.tencent.com',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
});

let crashFilePath = '';
let crashDumpsDir = '';
try {
  // electron 低版本
  crashFilePath = path.join(app.getPath('temp'), `${app.getName()} Crashes`);
  console.log('————————crash path:', crashFilePath);

  // electron 高版本
  crashDumpsDir = app.getPath('crashDumps');
  console.log('————————crashDumpsDir:', crashDumpsDir);
} catch (e) {
  console.error('获取奔溃文件路径失败', e);
}

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
      mainWindow.loadURL('http://localhost:8080');
    } else {
      mainWindow.loadURL(path.join('file://', __dirname, '/src/app/render/main-page/build/index.html'));
    }

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require('devtron').install();
    }

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('crash-file-path', `${crashFilePath}|${crashDumpsDir}`);
    });

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

  app.on('gpu-process-crashed', (event, kill) => {
    console.warn('app:gpu-process-crashed', kill);
  });

  app.on('renderer-process-crashed', (event, webContents, kill) => {
    console.warn('app:renderer-process-crashed', kill);
  });

  app.on('render-process-gone', (event, webContents, details) => {
    console.warn('app:render-process-gone', details);
  });

  app.on('child-process-gone', (event, details) => {
    console.warn('app:child-process-gone', details);
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

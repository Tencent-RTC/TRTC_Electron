const { app, BrowserWindow, systemPreferences, crashReporter, ipcMain, protocol } = require('electron');
const path = require('path');

/**
 * Linux 下构建安装包，运行时默认路径是 /User/<用户名> 路径，通过下面几行代码判断，
 * 强制切换到应用安装目录，否则会因找不到 resources 目录，进而导致找不到 .node 文件。
 */
if (app.isPackaged && process.platform === 'linux') {
  process.chdir(process.resourcesPath);
  process.chdir('..');
}

// 开启crash捕获
crashReporter.start({
  productName: 'trtc-electron-simple-demo',
  companyName: 'Tencent',
  submitURL: 'https://www.xxx.com',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
});

// 开启crash捕获
let crashFilePath = '';
let crashDumpsDir = '';
try {
  // electron 低版本
  crashFilePath = path.join(app.getPath('temp'), app.getName() + ' Crashes');
  console.log('————————crash path:', crashFilePath); 

  // electron 高版本
  crashDumpsDir = app.getPath('crashDumps');
  console.log('————————crashDumpsDir:', crashDumpsDir);
} catch (e) {
  console.error('获取奔溃文件路径失败', e);
}

let win = null;

function logBothProcess(msg) {
  console.log(msg);
  if(win && win.webContents) {
    win.webContents.executeJavaScript(`console.log("${msg.toString()}")`);
  }
}

function getParam() {
  const param = {
    BIN_PATH: '',
    APP_PATH: '',
  };
  const tmp = Array.from(process.argv);
  param.BIN_PATH = tmp[0];
  param.APP_PATH = tmp[1];
  tmp.forEach((value, index)=>{
    if (index <= 1) return;
    const splitValue = value.split('=');
    const key = splitValue[0].replace(/--/g, '').replace(/\s/g, '').toUpperCase();
    const val = splitValue[1].replace(/\s/g, '');
    if (typeof param[key] !== 'undefined') {
      param[key] = val;
    }
  });
  return param;
}
const param = getParam();
console.log('electron param:', param);
const portStart = 8080;
function gerServer() {
  return `http://localhost:${portStart}`;
}

async function checkAndApplyDeviceAccessPrivilege() {
  const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera');
  console.log(
    `checkAndApplyDeviceAccessPrivilege before apply cameraPrivilege: ${cameraPrivilege}`
  );
  if (cameraPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('camera');
  }

  const micPrivilege = systemPreferences.getMediaAccessStatus('microphone');
  console.log(
    `checkAndApplyDeviceAccessPrivilege before apply micPrivilege: ${micPrivilege}`
  );
  if (micPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('microphone');
  }

  const screenPrivilege = systemPreferences.getMediaAccessStatus('screen');
  console.log(
    `checkAndApplyDeviceAccessPrivilege before apply screenPrivilege: ${screenPrivilege}`
  );
}

async function createWindow() {
  if (process.platform === "darwin") {
    await checkAndApplyDeviceAccessPrivilege();
  }
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1366,
    height: 1024,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.electron.js'),
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
    },
  });

  // 在执行 npm run start 后，经常会窗口已经显示出来了，但代码还未构建好，
  // 此时捕获到 did-fail-load 事件，在之后延迟重载
  win.webContents.on('did-fail-load', function () {
     console.log(`createWindow: did-fail-load, reload ${app.isPackaged ? "production" : "development"} soon...`);
     setTimeout(()=>{
      win.reload();
     }, 1000);
     logBothProcess('did-fail-load occur')
  });

  win.webContents.on("did-start-loading", () => {
    win.webContents.send("app-path", app.getAppPath());
    win.webContents.send(
      "crash-file-path",
      `did-start-loading: ${crashFilePath}|${crashDumpsDir}`
    );
  });

  win.webContents.on("did-stop-loading", () => {
    win.webContents.send("app-path", app.getAppPath());
    win.webContents.send(
      "crash-file-path",
      `did-stop-loading: ${crashFilePath}|${crashDumpsDir}`
    );
  });

  win.webContents.on('did-finish-load', function(){
    win.webContents.send("app-path", app.getAppPath());
    win.webContents.send(
      "crash-file-path",
      `did-finish-load: ${crashFilePath}|${crashDumpsDir}`
    );
  });

  win.webContents.on("dom-ready", () => {
    win.webContents.send("app-path", app.getAppPath());
    win.webContents.send(
      "crash-file-path",
      `dom-ready: ${crashFilePath}|${crashDumpsDir}`
    );
  });

  ipcMain.handle("app-path", () => {
    return app.getAppPath();
  });

  if (app.isPackaged) {
    win.loadFile('dist/index.html');
  } else {
    win.loadURL(gerServer());
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true
    }
  }
]);

app.whenReady().then(() => {
  if (!app.isPackaged) {
    console.log('Added Extension: installing vue-dev tool...');
    const {
      default: installExtension,
      VUEJS_DEVTOOLS,
    } = require('electron-devtools-installer');
    installExtension(VUEJS_DEVTOOLS)
      .then((name) => {
        console.log(`Added Extension:  ${name}`);
        createWindow();
      })
      .catch((err) => {
        console.error('Added Extension failed: ', err);
        createWindow();
      });
  } else {
    console.log('Packaged env, create window without dev-tool extension.');
    createWindow();
  }
});

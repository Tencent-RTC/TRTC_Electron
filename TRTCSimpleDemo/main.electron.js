const { app, BrowserWindow, systemPreferences } = require('electron');
const path = require('path');

function getParam() {
  const param = {
    BIN_PATH: '',
    APP_PATH: '',
    TRTC_ENV: 'production',
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
  await checkAndApplyDeviceAccessPrivilege();
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1366,
    height: 1024,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.electron.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 在执行 npm run start 后，经常会窗口已经显示出来了，但代码还未构建好，
  // 此时捕获到 did-fail-load 事件，在之后延迟重载
  win.webContents.on('did-fail-load', function () {
     console.log(`createWindow: did-fail-load, reload ${param.TRTC_ENV} soon...`);
     setTimeout(()=>{
      win.reload();
     }, 1000);
  });
  if (param.TRTC_ENV === 'production') {
    win.loadFile('dist/index.html');
  } else {
    win.loadURL(gerServer());
  }
}

app.whenReady().then(createWindow);

console.log(`[preload.js] node version: ${process.versions.node}`);
console.log(`[preload.js] chrome version: ${process.versions.chrome}`);
console.log(`[preload.js] electron version: ${process.versions.electron}`);
console.log(`[preload.js] process.cwd(): ${process.cwd()}`);
console.log(`[preload.js] __dirname: ${__dirname}`);
console.log(`[preload.js] env.NODE_ENV: ${process.env.NODE_ENV}`);

const { ipcRenderer } = require('electron');
const path = require("path");

// 打印来自主进程的奔溃 dump 文件存放目录
ipcRenderer.on('crash-file-path', (event, args) => {
  console.warn('crash-file-path:', args);
});

window.ipcRenderer = ipcRenderer;

window.path = path;
window.ROOT_PATH = path.join(__dirname, "../");
window.PUBLIC_PATH = path.join(__dirname);
ipcRenderer.on("app-path", (event, appPath) => {
  console.warn("APP_PATH:", appPath);
  window.APP_PATH = appPath;
});

console.log("ROOT_PATH:", window.ROOT_PATH);
console.log("PUBLIC_PATH:", window.PUBLIC_PATH);

// // crash test
// setTimeout(() => {
//   console.warn('---------------test crash');
//   process.crash();
// }, 10 * 1000);

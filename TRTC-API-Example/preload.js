// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
console.log(`node version: ${process.versions.node}`);
console.log(`chrome version: ${process.versions.chrome}`);
console.log(`electron version: ${process.versions.electron}`);
console.log(`process.cwd(): ${process.cwd()}`);
console.log(`process.resourcesPath: ${process.resourcesPath}`);
console.log(`process.platform: ${process.platform}`);

const genTestUserSig = require('./assets/debug/gen-test-user-sig');
const { ipcRenderer, shell } = require('electron');

window.ipcRenderer = ipcRenderer;
window.shell = shell;
window.genTestUserSig = genTestUserSig;
window.globalUserId = window.localStorage.getItem('localUserId') || '';
window.globalRoomId = window.parseInt(window.localStorage.getItem('roomId') || 0);

/**
 * Internationalization function
 * Here is a stub function. The real function is defined in initA18n.js,
 * which will be initialized when the UI page has loaded.
 * This function is used be online example code.
 */
window.a18n = keyString => keyString;

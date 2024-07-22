const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('--- afterPack.js ---', context.appOutDir, context.packager.appInfo.productName);

  // Delete trtc_electron_sdk.node file from 'dist' directory, not used.
  const filePath = `${context.appOutDir}/${context.packager.appInfo.productName}.app/Contents/Resources/app/dist/trtc_electron_sdk.node`
  console.log('Remove file:', filePath);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
    console.log('Remove file success');
  }

  if (context.electronPlatformName === 'darwin') {
    // Mac universal build, delete x86 Xmagic and encrypt plugin files in separate packages, because they cannot be merged into universal package.
    if (context.appOutDir.endsWith('mac-universal--arm64') || context.appOutDir.endsWith('mac-universal--x64')) {
      const filesToRemove = [
        `${context.appOutDir}/${context.packager.appInfo.productName}.app/Contents/Resources/app/plugin/encrypt/mac`,
        `${context.appOutDir}/${context.packager.appInfo.productName}.app/Contents/Resources/app/plugin/XMagic/mac`
      ];

      filesToRemove.forEach(file => {
        if (fs.existsSync(file)) {
          console.log('Remove dir:', file);
          fs.rmSync(file, { recursive: true, force: true });
        } else {
          console.log('Dir not exists:', file);
        }
      });
    }

    // Build mac universal package, copy x86_64 Xmagic and encrypt plugin files to universal package.
    if (context.appOutDir.endsWith('mac-universal')) {
      let src = path.join(__dirname, "../node_modules/trtc-electron-plugin-xmagic/plugin/XMagic/mac");
      let dest = `${context.appOutDir}/${context.packager.appInfo.productName}.app/Contents/Resources/app/plugin/XMagic/mac`;
      console.log('Copy Xmagic plugin file:', src, dest);
      fs.cpSync(src, dest, { recursive: true });

      src = path.join(__dirname, "../plugin/encrypt/mac");
      dest = `${context.appOutDir}/${context.packager.appInfo.productName}.app/Contents/Resources/app/plugin/encrypt/mac`;
      console.log('Copy encrypt plugin file:', src, dest);
      fs.cpSync(src, dest, { recursive: true });
    }
  }
};

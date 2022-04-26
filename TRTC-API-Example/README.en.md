# TRTC API-Example

_English | [简体中文](README.md)_

## Overview
TRTC Electron API Examples: It demonstrates the common use cases of [TRTC APIs for Electron](https://web.sdk.qcloud.com/trtc/electron/doc/en-us/trtc_electron_sdk/index.html) to help you understand API features and quickly connect them to your existing project. It supports in-app encoding and execution.

## Directory Structure
```
├── src
│   ├── app
│   │    ├── main                  // Main process running code
│   │    ├── render                // Main window running code of the renderer process
├── assets
│   ├── app-icon
│   ├── code                       // Sample code
│   │    ├── basic                 // Sample code for basic features
│   │    ├── advanced              // Sample code for advanced features
│   ├── debug                      // Contains `gen-test-user-sig.js` to generate a testing `UserSig` locally
├── main.js                        // Electron main process entry file
├── preload.js                     // Electron window preload script
├── package.json                   // Project configuration
├── package-lock.json
```

## Contents
This demo covers the following features (click to view the details of a feature):

- Basic Features
  - [Video call](./assets/code/basic/video-call/index.js)
  - [Audio call](./assets/code/basic/audio-call/index.js)
  - [Screen sharing](./assets/code/basic/screen-share/index.js)
  - [Interactive video live streaming](./assets/code/basic/video-live/index.js)
  - [Interactive audio live streaming](./assets/code/basic/audio-call/index.js)
  - [Device testing](./assets/code/basic/device-test/index.js)
- Advanced Features
  - [Video quality setting](./assets/code/advanced/video-quality/index.js)
  - [Stream mix](./assets/code/advanced/video-stream-mix/index.js)
  - [Big and small images](./assets/code/advanced/big-small-stream/index.js)
  - [Rendering control](./assets/code/advanced/video-render-params/index.js)
  - [Built-in beauty filter](./assets/code/advanced/beauty-sdk-inner/index.js)
  - [Cross-room communication](./assets/code/advanced/connect-other-room/index.js)
  - [Role switch](./assets/code/advanced/switch-role/index.js)
  - [Call statistics](./assets/code/advanced/call-statistics/index.js)
  - [Volume control](./assets/code/advanced/volume-control/index.js)

## Prerequisites
You have [signed up for a Tencent Cloud account](https://intl.cloud.tencent.com/document/product/378/17985) and completed [identity verification](https://intl.cloud.tencent.com/document/product/378/3629).

## Directions
### Step 1. Create an application
1. Log in to the TRTC console and select **Development Assistance** > **[Demo Quick Run](https://console.cloud.tencent.com/trtc/quickstart)**.
2. Click **Start Now**, enter an application name such as `TestTRTC`, and click **Create Application**.

### Step 2. Configure API Examples project files
1. Find and open the `assets/debug/gen-test-user-sig.js` file.
2. Set parameters in `gen-test-user-sig.js` as follows:
  <ul><li>SDKAPPID: `0` by default. Set it to the actual `SDKAppID`.</li>
  <li>SECRETKEY: Left empty by default. Set it to the actual key.</li></ul>
3. Return to the TRTC console and click **Pasted and Next**.
4. Click **Return to Overview Page**.
5. Set `window.globalUserId` and `window.globalRoomId` in the `preload.js` file, which will take effect in all API Examples.

> ⚠️Note:
> In this document, the method to obtain UserSig is to configure a SECRETKEY in the client code. In this method, the SECRETKEY is vulnerable to decompilation and reverse engineering. Once your SECRETKEY is leaked, attackers can steal your Tencent Cloud traffic. Therefore, **this method is only suitable for locally running a demo project and feature debugging**.
>
> The correct `UserSig` distribution method is to integrate the calculation code of `UserSig` into your server and provide an application-oriented API. When `UserSig` is needed, your application can send a request to the business server for a dynamic `UserSig`. For more information, see [How do I calculate `UserSig` during production?](https://intl.cloud.tencent.com/document/product/647/35166).

### Step 3. Run API Examples
> ⚠️Note:
> 1. Use Node.js 14.16.0 or later as the environment.

#### 1. Install dependencies
```bash
npm install
cd src/app/render/main-page
npm install
cd ../../../..
```

#### 2. Run the development environment
```bash
npm run start
```

#### 3. Package the production environment
win
```bash
npm run package:win
```

mac
```bash
npm run package:mac
```

## Demos

You can download built installation packages for a quick tryout: [Windows edition](https://web.sdk.qcloud.com/trtc/electron/download/api-example/TRTC-Electron-API-Examples-windows.zip) or [macOS edition](https://web.sdk.qcloud.com/trtc/electron/download/api-example/TRTC-Electron-API-Examples-mac.zip).

## FAQs

### 1. There is only information of the public and private keys when I try to view the secret key. How do I get the secret key?
TRTC SDK 6.6 (August 2019) and later versions use the new signature algorithm HMAC-SHA256. If your application was created before August 2019, you need to upgrade the signature algorithm to get a new key. Without upgrading, you can continue to use the [old algorithm ECDSA-SHA256](https://cloud.tencent.com/document/product/647/17275#.E8.80.81.E7.89.88.E6.9C.AC.E7.AE.97.E6.B3.95).

Upgrade operation:
1. Log in to the [TRTC console](https://console.cloud.tencent.com/trtc).
2. Click **Application Management** on the left sidebar, find your application, and click **Application Info**.
3. Select the **Quick Start** tab and click **Upgrade** in **Step 2: Obtain the secret key to issue UserSig**.

### 2. What should I do if the error "Electron failed to install correctly" occurs in the terminal?
Manually install Electron as instructed in [FAQs About Electron](https://cloud.tencent.com/developer/article/1616668).

### 3. FAQs
1. [FAQs at Tencent Cloud official website](https://intl.cloud.tencent.com/document/product/647/43093).

2. [FAQs in the Tencent Cloud developer forum](https://cloud.tencent.com/developer/article/1616668).

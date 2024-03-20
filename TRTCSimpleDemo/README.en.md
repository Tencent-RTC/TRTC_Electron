_English | [简体中文](README.md)_

This document describes how to quickly run the TRTC demo for Electron.
![](https://demovideo-1252463788.cos.ap-shanghai.myqcloud.com/electron/livemode.gif)

## Prerequisites

You have [signed up for a Tencent Cloud account](https://intl.cloud.tencent.com/document/product/378/17985) and completed [identity verification](https://intl.cloud.tencent.com/document/product/378/3629).

## Directions

<span id="step1" name="step1"> </span>

### Step 1. Create an application

1. Log in to the TRTC console and select **Development Assistance** > **[Demo Quick Run](https://console.cloud.tencent.com/trtc/quickstart)**.
2. Enter an application name such as `TestTRTC` and click **Create**.

<span id="step2" name="step2"> </span>

### Step 2. Download the SDK and demo source code

1. Hover over the block of the platform you use, click **[GitHub](https://github.com/LiteAVSDK/TRTC_Electron/tree/main/TRTCSimpleDemo)** (or **[ZIP](https://web.sdk.qcloud.com/trtc/electron/download/TXLiteAVSDK_TRTC_Electron_latest.zip)**) to download the SDK and demo source code.
    ![img](https://main.qcloudimg.com/raw/6273f79193eb7af25eff64020a0ea476.png)
2. After the download, return to the TRTC console and click **Next** to view your `SDKAppID` and key.<span id="idandkey" name="idandkey"> </span>

<span id="step3" name="step3"> </span>

### Step 3. Configure the demo project file
2. Find and open the `gen-test-user-sig.js` file in the `debug` directory.

3. Set parameters in `gen-test-user-sig.js` as follows:

    -   `SDKAPPID`: Set it to the `SDKAppID` obtained in [step 2](#idandkey).
    -   `SECRETKEY`: Set it to the key obtained in [step 2](#idandkey).
    
    
    
    >!
    >In this document, the `SECRETKEY` is configured in the client code to obtain `UserSig`. The `SECRETKEY` is easily decompiled and reverse cracked. If the `SECRETKEY` is leaked, hackers can steal your Tencent Cloud traffic. Therefore, **this method only applies to locally running a demo project and commissioning features**.
    > For the correct UserSig generating method, see [How do I calculate `UserSig` during production?](https://intl.cloud.tencent.com/document/product/647/35166).
    
    

**File paths and description:**

This directory contains the simplest sample code to demonstrate how to call TRTC APIs and use the most basic audio/video features.

```bash
.
|--main.electron.js                      Main Electron file
|--package.json                          Project configuration
|--vue.config.js                         Vue CLI project file
|--src                                   Source code directory
|  |--pages                               
|  |  |--trtc                            Demo of TRTC running in call mode. In this mode, there is no concept of role
|  |  |--live                            Demo for live streaming mode in TRTC. In this mode, there is a concept of role
|  |--debug                              Contains `GenerateTestUserSig` to generate a testing `UserSig` locally  
```

<span id="step4"> </span>

### Step 4. Compile and run the demo

1. Install the latest version of Node.js. For more information, visit [Node.js official website](https://nodejs.org/en/download/).

2. Start the terminal, switch to the project directory, and run the following command.
	
    ```shell
    $ npm install
    ```
	
    

	>   !
	>
	>   If you find it slow to install Electron using the above method, refer to the "Installation" section and "Appendix: Install Electron Offline Manually" in [FAQs About Electron](https://cloud.tencent.com/developer/article/1616668).
	
	
	
4. After the npm dependencies are installed, run the following command in the Command Prompt to run the demo.

    ```shell
    $ npm run start  # On first run, it may take a while to show the UI.
    ```
    
### Main project commands

| Command | Description |
|--|--|
| npm run start | Runs the demo in development environment. |
| npm run pack:mac | Packages the project into a DMG installer for macOS. Runtime instruction type is same with the builder machine CPU instruction type.|
| npm run pack:mac-universal | Packages the project into a DMG installer for macOS. Runtime instruction supports both X64 and ARM64 CPU instruction types. |
| npm run pack:win32 | Packages the project into a 32-bit EXE installer for Windows. |
| npm run pack:win64 | Packages the project into a 64-bit EXE installer for Windows. |

## FAQs

### 1. There is only information of the public and private keys when I try to view the secret key. How do I get the secret key?

TRTC SDK 6.6 (August 2019) and later versions use the new signature algorithm HMAC-SHA256. If your application was created before August 2019, you need to upgrade the signature algorithm to get a new key. Without upgrading, you can continue to use the [old algorithm ECDSA-SHA256](https://cloud.tencent.com/document/product/647/17275#.E8.80.81.E7.89.88.E6.9C.AC.E7.AE.97.E6.B3.95).

Upgrade operation:

1. Log in to the [TRTC console](https://console.cloud.tencent.com/trtc).
2. Click **Application Management** on the left sidebar, find your application, and click **Application Info**.
3. Select the **Quick Start** tab and click **Upgrade** in **Step 2: Obtain the secret key to issue UserSig**.

### 2. The demo is running on two devices, but why can't they display the images of each other?

Make sure that the two devices use different `UserIDs`. With TRTC, you cannot use the same `UserID` on two devices simultaneously unless the `SDKAppIDs` are different.

![img](https://main.qcloudimg.com/raw/209a0d0d5833d68c1ad46ed7e74b97e8.png)

### 3. What firewall restrictions does the SDK face?

Because the SDK uses the UDP protocol for audio/video transmission, it cannot be used in office networks that block UDP. If you encounter such a problem, see [How to Deal with Firewall Restrictions](https://cloud.tencent.com/document/product/647/34399) for assistance.



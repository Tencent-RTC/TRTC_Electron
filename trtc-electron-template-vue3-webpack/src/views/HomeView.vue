<template>
  <h1>TRTC SDK version:{{ sdkVersion }}</h1>
  <h2>Welcome to Your Vue.js + TypeScript App</h2>
  <div style="height: 200px" ref="cameraPreviewRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Ref} from 'vue';
import TRTCCloud, { TRTCParams, TRTCAppScene } from 'trtc-electron-sdk';
import genTestUserSig from '../debug/gen-test-user-sig';

const userId = "test-user";
const roomId = 5055005;
const sdkVersion: Ref<string> = ref('');
const cameraPreviewRef:Ref<HTMLDivElement | null> = ref(null);

const trtcCloud = TRTCCloud.getTRTCShareInstance();

const startCamera = () => {
  trtcCloud.startLocalPreview(cameraPreviewRef.value);
};

const enterRoom = () => {
  const sdkInfo = genTestUserSig(userId);
  let param = new TRTCParams();
  param.sdkAppId = sdkInfo.sdkAppId;
  param.userSig = sdkInfo.userSig;
  param.roomId = roomId;
  param.userId = userId;
  trtcCloud.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);
};

const registerEvent = () => {
  trtcCloud.on("onError", (errCode: number, errMsg: string) => {
    console.log(`App.vue onError:`, errCode, errMsg);
  });

  trtcCloud.on("onWarning", (code: number, msg: string, extra: any) => {
    console.log(`App.vue onWarning:`, code, msg, extra);
  });

  trtcCloud.on("onEnterRoom", (result: number) => {
    console.log(`App.vue onEnterRoom:`, result);
  });

  trtcCloud.on("onRemoteUserEnterRoom", (userId: string) => {
    console.log(`App.vue onRemoteUserEnterRoom:`, userId);
  });

  trtcCloud.on("onUserVideoAvailable", (userId: string, available: number) => {
    console.log(`App.vue onUserVideoAvailable:`, userId, available);
  });
};

onMounted(() => {
  registerEvent();

  sdkVersion.value = trtcCloud.getSDKVersion();
  
  startCamera();
  enterRoom();
});
</script>
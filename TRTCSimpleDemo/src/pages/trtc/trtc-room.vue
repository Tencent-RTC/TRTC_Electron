<template name="trtc-room">
  <div id="trtc-room">
    <nav-bar :title="'房间号：' + roomId + '；用户：' + userId"></nav-bar>

    <div id="video-container"></div>
    <div id="beauty-setting-panel" v-show="isBeautySettingVisiable">
      <beauty-panel @on-change="handleBeautyEffectChange" />
    </div>
    <div id="controll-bar">
      <b-button variant="link" @click="toggleMic">
        <b-iconstack font-scale="1">
          <b-icon icon="mic-fill" color="white"></b-icon>
          <b-icon icon="slash" variant="danger" v-if="isMuteMic"></b-icon>
        </b-iconstack>
      </b-button>

      <b-button variant="link" @click="toggleCamera">
        <b-iconstack font-scale="1">
          <b-icon icon="camera-video-fill" color="white"></b-icon>
          <b-icon icon="slash" variant="danger" v-if="isDisableCamera"></b-icon>
        </b-iconstack>
      </b-button>

      <b-button variant="link" class="btn-beauty" @click="toggleBeauty">
        <b-iconstack font-scale="1">
          <b-icon icon="emoji-laughing" color="white"></b-icon>
          <b-icon icon="slash" variant="danger" v-if="isDisableBeauty"></b-icon>
        </b-iconstack>
        <span
          class="btn-beauty-more"
          :class="{ 'is-open': isBeautySettingVisiable }"
          v-if="!isDisableBeauty"
          @click="toggleBeautySetting"
        ></span>
      </b-button>

      <b-button variant="link">
        <b-iconstack font-scale="1" @click="toggleScreenSharing">
          <b-icon icon="tv-fill" color="yellow" v-if="isScreenSharing"></b-icon>
          <b-icon icon="tv-fill" color="white" v-else></b-icon>
        </b-iconstack>
      </b-button>
      <b-button variant="link">
        <b-iconstack font-scale="1" @click="toggleEncrypting">
          <b-icon icon="lock" color="yellow" v-if="isEncryptEnabled"></b-icon>
          <b-icon icon="unlock" color="white" v-else></b-icon>
        </b-iconstack>
      </b-button>

      <b-button variant="link" @click="exitRoom">
        <b-iconstack font-scale="1">
          <b-icon icon="power" variant="warning"></b-icon>
        </b-iconstack>
      </b-button>
    </div>

    <div>
      <b-modal
        id="screens-list-modal"
        size="lg"
        title="可分享的窗口列表"
        v-model="screensListVisiable"
      >
        <show-screen-capture
          v-bind:list="screensList"
          v-bind:onClick="chooseWindowCapture"
        ></show-screen-capture>
      </b-modal>
    </div>
  </div>
</template>

<script>
import TRTCCloud, {
  TRTCAppScene,
  TRTCVideoStreamType,
  TRTCVideoFillMode,
  TRTCParams,
  TRTCVideoEncParam,
  TRTCVideoResolution,
  TRTCVideoResolutionMode,
  TRTCBeautyStyle,
  Rect,
  TRTCScreenCaptureProperty,
  TRTCPluginType,
  TRTCVideoPixelFormat,
  TRTCVideoBufferType,
} from "trtc-electron-sdk";
import showScreenCpature from "../../components/show-screen-capture.vue";
import BeautyPanel from "../../components/beauty-panel.vue";
import { XmagicLicense, TRTCXmagicFactory } from "../../constant/beauty";
import genTestUserSig from "../../debug/gen-test-user-sig";
import trtcState from "../../common/trtc-state";
import Log from "../../common/log";
import { BDVideoEncode, BDBeauty } from "../../common/bd-tools";

const logger = new Log(`trtcRoom`);

let trtcCloud = null; // 用于TRTCQcloud 实例， mounted 时实体化
let encryptPlugin = null; // 自定义加解密插件
let beautyPlugin = null;
export default {
  components: {
    "show-screen-capture": showScreenCpature,
    "beauty-panel": BeautyPanel,
  },
  data() {
    return {
      roomId: 0,
      userId: "",
      cameraId: "",
      videosList: [],
      streamType: TRTCVideoStreamType.TRTCVideoStreamTypeBig,
      isMuteMic: false,
      isDisableCamera: false,
      isDisableBeauty: true,
      isBeautySettingVisiable: false,
      isScreenSharing: false,
      isEncryptEnabled: false,
      getScreensTaskID: 0,
      screensList: [],
      screensListVisiable: false,
      videoContainer: null,
      sdkInfo: null,
      // 存放远程用户视频列表
      remoteVideos: {},
      isRemoteScreenSharing: false, // 远程用户是否正在分享屏幕
    };
  },

  computed: {
    subStreamWidth() {
      return Math.floor(this.videoContainer.clientWidth * 0.2);
    },

    subStreamHeight() {
      return Math.floor(this.videoContainer.clientHeight * 0.2);
    },
  },

  methods: {
    /**
     * SDK 不可恢复的错误，一定要监听，并分情况给用户适当的界面提示。
     */
    onError(errCode, errMsg) {
      logger.error(`SDK onError: ${errCode} ${errMsg}`);
      window.appMonitor?.reportEvent(
        "EnterVideoRoom",
        `failed#error:${errCode} ${errMsg}`
      );
    },

    /**
     * 用于告知您一些非严重性问题，例如出现了卡顿或者可恢复的解码失败。
     */
    onWarning(warningCode, warningMsg) {
      logger.warn(`SDK onWarning: ${warningCode} ${warningMsg}`);
    },

    /**
     * 当进入房间时触发的回调
     * @param {number} result - 进房结果， 大于 0 时，为进房间消耗的时间，这表示进进房成功。如果为 -1 ，则表示进房失败。
     **/
    onEnterRoom(result) {
      if (result > 0) {
        logger.log(`onEnterRoom，进房成功，使用了 ${result} 毫秒`);
        // 显示摄像头，开房麦克风，开始推流
        this.startCameraAndMic();
      } else {
        logger.warn(`onEnterRoom: 进房失败 ${result}`);
      }
    },

    /**
     * 当退出房间时触发的回调
     */
    onExitRoom(reason) {
      logger.warn(`onExitRoom, reason: ${reason}`);
    },

    /**
     * 远程用户视频流的状态发生变更时触发。
     * @param {number} uid - 用户标识
     * @param {boolean} available - 画面是否开启
     **/
    onUserVideoAvailable(uid, available) {
      logger.log(`onUserVideoAvailable: uid: ${uid}, available: ${available}`);
      if (available === 1) {
        this.showVideo(uid);
      } else {
        this.closeVideo(uid);
      }
    },

    /***
     * 显示其他用户的视频
     * @param {number} uid - 用户ID
     */
    showVideo(uid) {
      let id = `${uid}-${this.roomId}-${TRTCVideoStreamType.TRTCVideoStreamTypeBig}`;
      let view = document.getElementById(id);
      if (!view) {
        view = document.createElement("div");
        view.id = id;
        this.videoContainer.appendChild(view);
      }
      view.style.width = `${this.subStreamWidth}px`;
      view.style.height = `${this.subStreamHeight}px`;
      this.remoteVideos[id] = view;
      trtcCloud.startRemoteView(uid, view);
      trtcCloud.setRemoteViewFillMode(
        uid,
        TRTCVideoFillMode.TRTCVideoFillMode_Fill
      );
      this.videoTypeSetting();
    },

    /**
     * 关闭其他用户的视频
     * @param {number} uid
     */
    closeVideo(uid) {
      let id = `${uid}-${this.roomId}-${TRTCVideoStreamType.TRTCVideoStreamTypeBig}`;
      let view = document.getElementById(id);
      if (view) {
        this.videoContainer.removeChild(view);
      }
      delete this.remoteVideos[id];
    },

    /**
     * 当远端用户进入本房间，创建对应对应的画面。
     */
    onRemoteUserEnterRoom(uid) {
      logger.warn("onRemoteUserEnterRoom", uid);
    },

    /**
     * 当远端用户离开本房间时，关闭对应的画面。
     */
    onRemoteUserLeaveRoom(uid) {
      logger.warn("onRemoteUserLeaveRoom", uid);
      this.closeVideo(uid);
    },

    /**
     * 当远程用户屏幕分享的状态发生变化，会根据 available 参数打开或关闭画面
     **/
    onUserSubStreamAvailable(uid, available) {
      logger.log(`onUserSubStreamAvailable: ${uid}, ${available}`);
      if (available) {
        this.showRemoteScreenSharing(uid);
        this.isRemoteScreenSharing = true;
      } else {
        this.closeRemoteScreenSharing(uid);
        this.isRemoteScreenSharing = false;
      }
    },

    /**
     * 显示远程用户的屏幕分享
     */
    showRemoteScreenSharing(uid) {
      let id = `${uid}-${this.roomId}-${TRTCVideoStreamType.TRTCVideoStreamTypeSub}`;
      logger.log(`showRemoteScreenSharing:  uid: ${id}`);
      let W = this.subStreamWidth;
      let H = this.subStreamHeight;
      let view = document.getElementById(id);
      if (!view) {
        view = document.createElement("div");
        view.id = id;
        view.style.width = `${W}px`;
        view.style.height = `${H}px`;
        this.videoContainer.appendChild(view);
      }
      this.remoteVideos[id] = view;
      trtcCloud.startRemoteSubStreamView(uid, view);
      trtcCloud.setRemoteSubStreamViewFillMode(
        uid,
        TRTCVideoFillMode.TRTCVideoFillMode_Fill
      );
      this.videoTypeSetting();
    },

    /**
     * 关闭远程用户的屏幕分享
     *
     * @param {*} uid
     */
    closeRemoteScreenSharing(uid) {
      let id = `${uid}-${this.roomId}-${TRTCVideoStreamType.TRTCVideoStreamTypeSub}`;
      let view = document.getElementById(id);
      if (view) {
        this.videoContainer.removeChild(view);
      }
      delete this.remoteVideos[id];
    },

    /**
     * 对视频元素进行排版
     */
    videoTypeSetting() {
      let marginTop = 80;
      let margin = 5;
      let H = this.subStreamHeight;
      let m = 0;
      let topIndex = 0;
      let remoteVideos = this.remoteVideos;
      let typeClassName = "";
      let top = 0;
      let i = 0;
      for (let id in remoteVideos) {
        topIndex = Math.floor(i / 2);
        typeClassName = i % 2 === 0 ? "right" : "left";
        top = topIndex * H + (topIndex + 1) * margin + marginTop;
        remoteVideos[id].className = `user-video-container ${typeClassName}`;
        remoteVideos[id].style.top = `${top}px`;
        logger.log(
          `videoTypeSetting: i:${i}, ti: ${topIndex}, top ${top}, H: ${H}, m: ${m}, id:${id},`
        );
        i++;
      }
    },

    /**
     * 开启 / 关闭麦克风
     */
    async toggleMic(event) {
      const isOwnDevicePrivilege =
        await window.checkAndApplyDevicesAccessPrivilege("microphone", {
          isShowDialog: true,
          isJumpToPrivilegeSettings: true,
        });
      if (isOwnDevicePrivilege) {
        this.isMuteMic = !this.isMuteMic;
      } else {
        this.isMuteMic = true;
      }
      trtcCloud.muteLocalAudio(this.isMuteMic);
      logger.log("toggleMic", this.isMuteMic, event);
    },

    /**
     * 开启 / 关闭摄像头
     */
    async toggleCamera(event) {
      const isOwnDevicePrivilege =
        await window.checkAndApplyDevicesAccessPrivilege("camera", {
          isShowDialog: true,
          isJumpToPrivilegeSettings: true,
        });
      if (isOwnDevicePrivilege) {
        this.isDisableCamera = !this.isDisableCamera;
      } else {
        this.isDisableCamera = true;
      }
      if (this.isDisableCamera) {
        this.hideLocalCameraVideoDom();
      } else {
        this.startCameraAndMicDom();
      }
      trtcCloud.muteLocalVideo(this.isDisableCamera);
      logger.log("toggleCamera", this.isDisableCamera, event);
    },

    async resetIconAndGetPrivilege() {
      const microphonePrivilege = await window.checkAndApplyDevicesAccessPrivilege("microphone");
      const cameraPrivilege = await window.checkAndApplyDevicesAccessPrivilege("camera");
      this.isMuteMic = microphonePrivilege ? false : true;
      this.isDisableCamera = cameraPrivilege ? false : true;
      trtcCloud.muteLocalVideo(this.isDisableCamera);
      trtcCloud.muteLocalAudio(this.isMuteMic);
      return { microphonePrivilege, cameraPrivilege };
    },

    /**
     * 开启/关闭摄象头美颜
     */
    toggleBeauty() {
      this.isDisableBeauty = !this.isDisableBeauty;
      if (!this.isDisableBeauty) {
        this.startBeauty();
      } else {
        this.stopBeauty();
      }
      this.isBeautySettingVisiable = false;
      logger.log("toggleBeauty is disabled:", this.isDisableBeauty);
    },

    /**
     * 打开/关闭美颜参数设置区域
     */
    toggleBeautySetting(event) {
      event.stopPropagation();
      this.isBeautySettingVisiable = !this.isBeautySettingVisiable;
    },

    /**
     * 开启 / 关闭屏幕分享，开启时会弹出窗口选择列表
     */
    toggleScreenSharing() {
      if (this.isRemoteScreenSharing === true) {
        this.$bvToast.toast(`其他主播正在分享屏幕，您现在无法分享。`, {
          variant: "warning",
        });
        return;
      }
      if (this.isScreenSharing === false) {
        this.getScreensList();
        return;
      }
      this.isScreenSharing = false;
      this.stopScreenShare();
    },

    /**
     * 开启 / 关闭自定义加解密
     */
    toggleEncrypting() {
      if (!this.isEncryptEnabled) {
        // 开启自定义加解密
        trtcCloud.setPluginParams(
          TRTCPluginType.TRTCPluginTypeMediaEncryptDecrypt,
          { enable: true }
        );
        trtcCloud.setPluginCallback((pluginId, errorCode, msg) => {
          console.log(
            `plugin callback: ${pluginId}, errorCode: ${errorCode}, msg: ${msg}`
          );
        });
        let libPath = "";
        if (process.platform === "win32") {
          if (process.arch === "x64") {
            libPath = window.path.resolve(
              window.APP_PATH,
              "plugin/encrypt/win/x64/MediaEncryptDecryptPlugin.dll"
            );
          } else {
            libPath = window.path.resolve(
              window.APP_PATH,
              "plugin/encrypt/win/ia32/MediaEncryptDecryptPlugin.dll"
            );
          }
        } else {
          libPath = window.path.resolve(
            window.APP_PATH,
            "plugin/encrypt/mac/MediaEncryptDecryptPlugin.dylib"
          );
        }
        encryptPlugin = trtcCloud.addPlugin({
          id: "encrypt",
          path: libPath,
          type: TRTCPluginType.TRTCPluginTypeMediaEncryptDecrypt,
        });
        encryptPlugin.enable();
        window._encryptPlugin = encryptPlugin;

        this.isEncryptEnabled = true;
      } else {
        // 关闭自定义加解密
        if (encryptPlugin) {
          encryptPlugin.disable();
          trtcCloud.removePlugin(encryptPlugin.id);
          encryptPlugin = null;
          window._encryptPlugin = undefined;
        }
        trtcCloud.setPluginParams(
          TRTCPluginType.TRTCPluginTypeMediaEncryptDecrypt,
          { enable: false }
        );

        this.isEncryptEnabled = false;
      }
    },

    /**
     * 获取窗口列表，用于屏幕分享
     */
    getScreensList() {
      // 获取窗口快照，这是资源消耗很高的函数，做个防抖，防频繁点击。
      clearTimeout(this.getScreensTaskID);
      let my = this;
      this.getScreensTaskID = setTimeout(() => {
        my.screensList = trtcCloud.getScreenCaptureSources(200, 160, 0, 0);
        console.warn("getScreensList:", my.screensList);
        my.screensListVisiable = true;
      }, 200);
    },

    /**
     * 当在 show-screen-capture 组件中选择了一个窗口快照后触发，这里会开始屏幕分享
     */
    chooseWindowCapture(event) {
      const sourceId = event.currentTarget.dataset.id;

      const source = this.screensList.filter(
        (item) => item.sourceId === sourceId
      )[0];
      if (source) {
        logger.log("chooseWindowCapture", source);
        this.startScreenShare(source);
        this.screensListVisiable = false;
        this.isScreenSharing = true;
      } else {
        const errMsg = `无效的屏幕或窗口ID ${sourceId}`;
        console.log(errMsg);
        this.logger.errMsg(errMsg);
      }
    },

    startScreenShare(source) {
      const rect = new Rect(0, 0, 0, 0);
      // eslint-disable-next-line no-unused-vars
      const captureProperty = new TRTCScreenCaptureProperty(
        true, // enable capture mouse
        true, // enable highlight
        true, // enable high performance
        0, // default highlight color
        8, // highlight width
        true // disable capture child window
      );
      // 方式一
      trtcCloud.selectScreenCaptureTarget(source, rect, captureProperty);
      // // 方式二
      // trtcCloud.selectScreenCaptureTarget(
      //   source.type,
      //   source.sourceId,
      //   source.sourceName,
      //   rect,
      //   true,
      //   true
      // );
      trtcCloud.startScreenCapture(
        null,
        TRTCVideoStreamType.TRTCVideoStreamTypeSub,
        new TRTCVideoEncParam(
          TRTCVideoResolution.TRTCVideoResolution_1920_1080,
          TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape,
          24,
          1600,
          200,
          true
        )
      );
    },

    stopScreenShare() {
      trtcCloud.stopScreenCapture();
    },

    /**
     * 离开房间,会退回到入口页面。
     */
    exitRoom(event) {
      logger.log("exitRoom", event);
      trtcCloud.exitRoom();
      let my = this;
      setTimeout(() => {
        my.$router.push("/trtc-index");
      }, 0);
    },

    /**
     * 隐藏摄像头画面
     */
    hideLocalCameraVideoDom() {
      document.querySelector("div.local-video-container").style.display =
        "none";
    },

    /**
     * 显示摄像头画面
     */
    startCameraAndMicDom() {
      document.querySelector("div.local-video-container").style.display =
        "inline-block";
    },

    /**
     * 开启美颜
     */
    async startBeauty(type = 1) {
      logger.log("startBeauty", type);
      this.openPluginManager();
      const currentCamera = trtcCloud.getCurrentCameraDevice();
      logger.log("current camera:", currentCamera);
      if (currentCamera) {
        const libPath = await TRTCXmagicFactory.getEffectPluginLibPath();
        beautyPlugin = trtcCloud.addPlugin({
          id: `${currentCamera.deviceId}-${new Date().getTime()}`, // ID 可以随意设置，只要唯一、不重复就行
          path: libPath,
          type: 1,
        });
        console.log("startBeauty plugin:", beautyPlugin);
        const initParam = await TRTCXmagicFactory.buildEffectInitParam(
          XmagicLicense
        );
        console.log("startBeauty initParam:", initParam);
        beautyPlugin.setParameter(JSON.stringify(initParam));
        beautyPlugin.enable();

        const beautySetting = {
          beautySetting: [],
        };

        const jsonParam = JSON.stringify(beautySetting);
        logger.log("beauty parameter:", jsonParam);
        beautyPlugin.setParameter(jsonParam);
        window.__beautyPlugin = beautyPlugin;
      }
    },

    /**
     * 结束美颜
     */
    stopBeauty() {
      logger.log("stopBeauty");
      if (beautyPlugin) {
        beautyPlugin.disable();
        trtcCloud.removePlugin(beautyPlugin.id);
      }
      this.closePluginManager();
    },

    /**
     * 处理美颜参数更新
     * @param {*[]} effectProperties
     */
    handleBeautyEffectChange(effectProperties) {
      console.log("handleBeautyEffectChange", effectProperties);
      beautyPlugin.setParameter(
        JSON.stringify({
          beautySetting: effectProperties,
        })
      );
    },

    /**
     * 启动摄像头、麦克风，显示本地画面
     */
    async startCameraAndMic() {
      const { cameraPrivilege, microphonePrivilege } =
        await this.resetIconAndGetPrivilege();
      if (!cameraPrivilege || !microphonePrivilege) return;
      let id = `local_video-${this.roomId}-${TRTCVideoStreamType.TRTCVideoStreamTypeBig}`;
      logger.log(`startCameraAndMic: ${id}`);
      let view = document.getElementById(id);
      if (!view) {
        view = document.createElement("div");
        view.id = id;
        view.className = "local-video-container";
        this.videoContainer.appendChild(view);
      }
      trtcCloud.startLocalPreview(view);
      trtcCloud.startLocalAudio();
      trtcCloud.setLocalViewFillMode(TRTCVideoFillMode.TRTCVideoFillMode_Fill);
    },
    warn(message) {
      logger.warn(message);
      this.$bvToast.toast(message, {
        title: "警告",
        variant: "warning",
        solid: true,
      });
    },
    onSnapshotComplete(userId, streamType, imageData, width, height) {
      logger.log(
        `onSnapshotComplete:userId: ${userId}, type: ${streamType} width: ${width}, height: ${height}`
      );
      logger.log("onSnapshotComplete:imageData:", imageData);
    },

    // 开启插件管理器，支持美颜
    openPluginManager() {
      logger.log(
        "openPluginManager",
        TRTCVideoPixelFormat,
        TRTCVideoBufferType
      );
      trtcCloud.initPluginManager({
        pixelFormat: TRTCVideoPixelFormat.TRTCVideoPixelFormat_BGRA32,
        bufferType: TRTCVideoBufferType.TRTCVideoBufferType_Buffer,
      });
      trtcCloud.setPluginCallback((pluginId, errorCode, msg) => {
        console.log(
          `plugin here plugin: ${pluginId}, errorCode: ${errorCode}, msg: ${msg}`
        );
      });
    },

    closePluginManager() {
      logger.log("closePluginManager");
      trtcCloud.destroyPluginManager();
    },
  },

  async mounted() {
    // 没有摄像头，有麦克风，可以音频
    if (trtcState.isCameraReady() === false) {
      this.warn("找不到可用的摄像头，远端用户将无法看到您的画面。");
    }
    // 有摄像头，没有麦克风，可以视频
    if (trtcState.isMicReady() === false) {
      this.warn("找不到可用的麦克风，远端用户将无法听到您的声音。");
    }
    // 1. 获取用于承载视频的 HTMLElement；
    this.videoContainer = document.querySelector("#video-container");
    logger.log(`mounted: `, this.$route.params);

    // 获取 vue-router 传参：userId 和 roomId
    this.roomId = parseInt(this.$route.params.roomId); // roomId 为整数类型
    this.userId = this.$route.params.userId.toString(); // userId 为字符串类型
    this.cameraId = decodeURIComponent(
      this.$route.params.cameraId?.toString() || ""
    ); // 摄像头ID

    if (!this.roomId || !this.userId) {
      this.$bvToast.toast("roomId 或 userId 为空，请填写后再试。");
      this.$router.push("trtc-index");
      return;
    }
    // 2. 计算签名
    this.sdkInfo = genTestUserSig(this.userId);

    // 3. 实例化一个 trtc-electron-sdk
    trtcCloud = TRTCCloud.getTRTCShareInstance();
    logger.warn(`sdk version: ${trtcCloud.getSDKVersion()}`);

    // 4. 配置基本的事件订阅
    trtcCloud.on("onError", this.onError.bind(this));
    trtcCloud.on("onWarning", this.onWarning.bind(this));
    trtcCloud.on("onStatistics", (statis) => {
      logger.log("onStatistics", statis);
    });
    trtcCloud.on("onEnterRoom", this.onEnterRoom.bind(this));
    trtcCloud.on("onExitRoom", this.onExitRoom.bind(this));
    trtcCloud.on("onUserVideoAvailable", this.onUserVideoAvailable.bind(this));
    trtcCloud.on(
      "onRemoteUserEnterRoom",
      this.onRemoteUserEnterRoom.bind(this)
    );
    trtcCloud.on(
      "onRemoteUserLeaveRoom",
      this.onRemoteUserLeaveRoom.bind(this)
    );
    trtcCloud.on(
      "onUserSubStreamAvailable",
      this.onUserSubStreamAvailable.bind(this)
    );
    trtcCloud.on("onSnapshotComplete", this.onSnapshotComplete.bind(this));
    logger.log(`mounted, setCurrentCameraDevice('${this.cameraId}')`);
    trtcCloud.setCurrentCameraDevice(this.cameraId);
    // 5. 设置编码参数
    // TRTCVideoEncParam 的详细说明，请参考： https://web.sdk.qcloud.com/trtc/electron/doc/zh-cn/trtc_electron_sdk/TRTCVideoEncParam.html
    let encParam = new TRTCVideoEncParam();

    /**
     *  videoResolution
     * 【字段含义】 视频分辨率
     * 【推荐取值】 : Window 和 iMac 建议选择 640 × 360 及以上分辨率，resMode 选择 TRTCVideoResolutionModeLandscape
     * 【特别说明】 TRTCVideoResolution 默认只能横屏模式的分辨率，例如640 × 360。
     */
    encParam.videoResolution =
      TRTCVideoResolution.TRTCVideoResolution_1920_1080;

    /**
     * TRTCVideoResolutionMode
     *【字段含义】分辨率模式（横屏分辨率 - 竖屏分辨率）
     *【推荐取值】Window 和 Mac 建议选择 TRTCVideoResolutionModeLandscape
     *【特别说明】如果 videoResolution 指定分辨率 640 × 360，resMode 指定模式为 Portrait，则最终编码出的分辨率为360 × 640。
     */
    encParam.resMode = TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape;
    encParam.videoFps = 30;
    encParam.videoBitrate = 2000;
    encParam.minVideoBitrate = 2000;
    encParam.enableAdjustRes = false;
    trtcCloud.setVideoEncoderParam(encParam);

    // 6. 开启美颜
    // setBeautyStyle 详细信息，请参考：https://web.sdk.qcloud.com/trtc/electron/doc/zh-cn/trtc_electron_sdk/TRTCCloud.html#setBeautyStyle
    trtcCloud.setBeautyStyle(TRTCBeautyStyle.TRTCBeautyStyleNature, 5, 5, 5);

    // 7. 进入房间
    // TRTCParams 详细说明，请查看文档：https://web.sdk.qcloud.com/trtc/electron/doc/zh-cn/trtc_electron_sdk/TRTCParams.html
    let param = new TRTCParams();
    param.sdkAppId = this.sdkInfo.sdkappid;
    param.userSig = this.sdkInfo.userSig;
    param.roomId = this.roomId;
    param.userId = this.userId;
    param.privateMapKey = ""; // 房间签名（非必填），7.1.157 版本以上（含），可以忽略此参数，7.1.157 之前的版本建议赋值为空字符串
    param.businessInfo = ""; // 业务数据（非必填），7.1.157 版本以上（含），可以忽略此参数，7.1.157 之前的版本建议赋值为空字符串

    /**
     * TRTCAppScene.TRTCAppSceneVideoCall: 视频通话场景，适合[1对1视频通话]、[300人视频会议]、[在线问诊]、[视频聊天]、[远程面试]等。
     */
    trtcCloud.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);
    window.appMonitor?.reportEvent("EnterVideoRoom", "success");

    // 挂到 windows BOM 下，方便调试。
    window.trtc = trtcCloud;
    window.videoEncode = new BDVideoEncode(trtcCloud);
    window.beauty = new BDBeauty(trtcCloud);
  },

  beforeDestroy() {
    this.isScreenSharing = false;
    if (!this.isDisableBeauty) {
      this.stopBeauty();
    }
    trtcCloud.stopLocalPreview();
    trtcCloud.stopLocalAudio();
  },
};
</script>

<style scoped>
#controll-bar {
  position: fixed;
  width: 100%;
  height: 3rem;
  bottom: 0;
  left: 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
}

#controll-bar > button {
  margin: 0 0.2em;
  border: none;
  width: 5rem;
}

#controll-bar > button > .b-icon {
  width: 2.5;
}

#beauty-setting-panel {
  position: fixed;
  width: 70%;
  height: 20rem;
  bottom: 3rem;
  left: 15%;
}

.btn-link:focus {
  box-shadow: none;
}

.btn-beauty {
  position: relative;
}

.btn-beauty-more {
  position: absolute;
  top: 1.25rem;
  left: 4.125rem;
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  transform: rotate(45deg);
  border-top: 0.125rem solid white;
  border-left: 0.125rem solid white;
}
.btn-beauty-more.is-open {
  /* top: 1rem; */
  transform: rotate(-135deg);
}
</style>

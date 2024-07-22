import TRTCXmagicFactory, {
  TRTCXmagicEffectConstant,
  TRTCXmagicEffectValueType,
} from "trtc-electron-plugin-xmagic";
import { getAppPath } from "../util";

export {
  TRTCXmagicEffectConstant,
  TRTCXmagicEffectValueType,
  TRTCXmagicEffectCategory,
  default as TRTCXmagicFactory
} from "trtc-electron-plugin-xmagic";

async function init() {
  const appPath = await getAppPath();
  TRTCXmagicFactory.init(appPath);
}
init();

const { platform } = process;

export const XmagicLicense = {
  licenseURL: "",
  licenseKey: "",
};

const lutResourceList = [
  {
    label: "清晰",
    label_en: "Refreshing",
    resPath: "lut.bundle/moren_lf.png",
    icon: "./assets/beauty_panel/panel_icon/lut_icon/moren_lf.png",
  },
  {
    label: "自然",
    label_en: "Natural",
    resPath: "lut.bundle/n_ziran.png",
    icon: "./assets/beauty_panel/panel_icon/lut_icon/ziran_lf.png",
  },
  {
    label: "心动",
    label_en: "Allure",
    resPath: "lut.bundle/xindong_lf.png",
    icon: "./assets/beauty_panel/panel_icon/lut_icon/xindong_lf.png",
  },
]
// Lut(Filter)
TRTCXmagicEffectConstant["EFFECT_LUT"].options = TRTCXmagicEffectConstant["EFFECT_LUT"].options.concat(
  lutResourceList.map(item => {
    return {
      ...TRTCXmagicEffectConstant["EFFECT_LUT"].valueMeta.value,
      ...item,
    }
  })
);

// Makeup
TRTCXmagicEffectConstant["EFFECT_MAKEUP"].options = TRTCXmagicEffectConstant["EFFECT_MAKEUP"].options.concat([
  { 
    label: "桃花", 
    label_en: "Peach",
    effKey: platform === "win32" ? "makeup.strength" : "video_fenfenxia",
    valueType: TRTCXmagicEffectValueType.ZERO_ONE,
    resPath: 
      platform === "win32"
        ? "makeupMotionRes.bundle/video_fenfenxia/template.json"
        : "makeupMotionRes.bundle/video_fenfenxia",
    icon: "./assets/beauty_panel/panel_icon/makeup_icon/video_fenfenxia.png"
  },
  { 
    label: "晒伤",
    label_en: "Sunburn",
    effKey: platform === "win32" ? "makeup.strength" : "video_shaishangzhuang",
    valueType: TRTCXmagicEffectValueType.ZERO_ONE,
    resPath:
        platform === "win32"
          ? "makeupMotionRes.bundle/video_shaishangzhuang/template.json"
          : "makeupMotionRes.bundle/video_shaishangzhuang",
    icon: "./assets/beauty_panel/panel_icon/makeup_icon/video_shaishangzhuang.png"
  },
]);

// Motion
TRTCXmagicEffectConstant["EFFECT_MOTION"]["2dOptions"] = TRTCXmagicEffectConstant["EFFECT_MOTION"]["2dOptions"].concat([
  {
    label: "兔兔酱",
    label_en: "Bunny",
    effKey: "video_tutujiang",
    resPath: 
      platform === "win32"
        ? "2dMotionRes.bundle/video_tutujiang/template.json"
        : "2dMotionRes.bundle",
    icon: "./assets/beauty_panel/panel_icon/motions_icon/video_tutujiang.png",
    valueType: TRTCXmagicEffectValueType.NONE,
  },
]); 
TRTCXmagicEffectConstant["EFFECT_MOTION"]["3dOptions"] = TRTCXmagicEffectConstant["EFFECT_MOTION"]["3dOptions"].concat([
  {
    label: "知性玫瑰",
    label_en: "Glasses",
    effKey: "video_zhixingmeigui",
    resPath:
      platform === "win32"
        ? "3dMotionRes.bundle/video_zhixingmeigui/template.json"
        : "3dMotionRes.bundle",
    icon:"./assets/beauty_panel/panel_icon/motions_icon/video_zhixingmeigui.png",
    valueType: TRTCXmagicEffectValueType.NONE,
  },
]); 
TRTCXmagicEffectConstant["EFFECT_MOTION"]["handOptions"] = TRTCXmagicEffectConstant["EFFECT_MOTION"]["handOptions"].concat([
  {
    label: "樱花女孩",
    label_en: "Sakura",
    effKey: "video_sakuragirl",
    resPath: 
      platform === "win32" 
        ? "handMotionRes.bundle/video_sakuragirl/template.json"
        : "handMotionRes.bundle",
    icon:"./assets/beauty_panel/panel_icon/motions_icon/video_sakuragirl.png",
    valueType: TRTCXmagicEffectValueType.NONE,
  },
]); 

const greenScreenBackgroundImageList = [
  {
    label: "绿幕/水滴",
    label_en: "Green Screen/Water Drops",
    icon: "./assets/virtual_bg/water-drops.jpg",
  }
];

const virtualBackgroundImageList = [
  {
    label: "黑板",
    label_en: "Blackboard",
    icon: "./assets/virtual_bg/黑板.jpg",
  },
]
// Virtual background
TRTCXmagicEffectConstant["EFFECT_SEGMENTATION"].options = TRTCXmagicEffectConstant["EFFECT_SEGMENTATION"].options.concat(
  greenScreenBackgroundImageList.map(item => {
    return {
      ...TRTCXmagicEffectConstant["EFFECT_SEGMENTATION"].valueMeta.greenScreen,
      ...item,
    }
  }),
  virtualBackgroundImageList.map(item => {
    return {
      ...TRTCXmagicEffectConstant["EFFECT_SEGMENTATION"].valueMeta.background,
      ...item,
    }
  })
);

export const customEffectConstant = TRTCXmagicEffectConstant;

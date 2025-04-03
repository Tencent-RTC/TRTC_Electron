// vue.config.js
const StringReplaceWebpackPlugin = require("string-replace-webpack-plugin");
const os = require("os");
console.log("process.argv:", process.argv);
console.log("\n\n");

function getArgvToObject() {
  let cmdArgvs = process.argv;
  let param = {};
  let key = "";
  let tmp = [];
  for (let i = 0; i < cmdArgvs.length; i++) {
    if (/^--[\w\d_-]+/g.test(cmdArgvs[i])) {
      tmp = cmdArgvs[i].replace("--", "").split("=");
      key = tmp[0].toUpperCase();
      param[key] = tmp[1];
    }
  }
  console.log("getArgvToObject param: ", param);
  return param;
}

let param = getArgvToObject();

const targetPlatform = (function () {
  let target = os.platform();
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].includes("--target_platform=")) {
      target = process.argv[i].replace("--target_platform=", "");
      break;
    }
  }
  if (!["win32", "darwin", "linux"].includes(target)) target = os.platform();
  return target;
})();

console.log("targetPlatform", targetPlatform);

const getRewritePath = function () {
  let rewritePath = "";
  if (process.env.NODE_ENV === "production") {
    switch (targetPlatform) {
      case "win32":
        rewritePath = "./";
        break;
      case "darwin":
        rewritePath = "../";
        break;
      case "linux":
        rewritePath = "./";
        break;
    }
  } else if (process.env.NODE_ENV === "development") {
    rewritePath = "node_modules/trtc-electron-sdk/build/Release";
  }
  return rewritePath;
};

console.log("param:", param);

let vueCliConfig = {
  publicPath: "./",
  configureWebpack: {
    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "native-ext-loader",
          options: {
            emit: true,
            rewritePath: getRewritePath(),
          },
        },
      ],
    },
    plugins: [new StringReplaceWebpackPlugin()],
    node: {
      process: false,
    },
  },
};

module.exports = vueCliConfig;

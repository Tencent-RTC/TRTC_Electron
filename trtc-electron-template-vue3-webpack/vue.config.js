const { defineConfig } = require('@vue/cli-service');
const os = require("os");

const isProduction = process.env.NODE_ENV === "production";
const platform = os.platform();

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  configureWebpack: {
    devtool: isProduction ? "source-map" : "inline-source-map",
    target: "electron-renderer",
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "native-ext-loader",
          options: {
            rewritePath: isProduction
              ? platform === "win32"
                ? "./resources"
                : "../Resources"
              : "./node_modules/trtc-electron-sdk/build/Release",
          },
        },
      ],
    },
  }
});

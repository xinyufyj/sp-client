const path = require("path");

module.exports = {
  pages: {
    index: {
      entry: "src/renderer/editor/main.js",
      template: "public/editor.html"
    },
    login: {
      entry: "src/renderer/login/main.js",
      template: "public/login.html"
    }
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/main/background.js",
      preload: "src/main/preload.js",
      builderOptions: {
        productName: "rto",
        linux: {
          target: "AppImage",
          category: "Utility"
        },
        mac: {
          identity: null
        }
      }
    },
  },
  chainWebpack(config) {
    const root = path.join(__dirname, "src", "renderer");
    config.resolve.alias.set("@@", root);
  }
}
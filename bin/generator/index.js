const path = require("path");
const spawn = require("cross-spawn");
const fse = require("fs-extra");
const fs = require("fs");
const { isPathDir } = require("../utils");
const { hackForClient } = require("./hack");

function buildDistDir() {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["gulp", "build"], { stdio: "inherit" });
    child.on("close", () => {
      resolve();
    });
    child.on("error", () => {
      reject();
    });
  });
}

function installDependencies(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npm",
      [
        "install",
        "--save",
        "--registry",
        "https://registry.npm.taobao.org",
        "node-html-parser@3.0.3",
        "ant-design-vue@1.7.4",
        "cookie",
        "set-cookie-parser"
      ],
      { stdio: "inherit", cwd }
    );
    child.on("close", () => {
      resolve();
    });
    child.on("error", () => {
      reject();
    });
  });
}

module.exports = async function (projectName) {
  const electronDir = path.join(process.cwd(), projectName);
  const publicDir = path.join(process.cwd(), projectName, "public");
  const distDir = path.join(process.cwd(), "dist");
  const srcDir = path.join(process.cwd(), projectName, "src");
  const templatesDir = path.join(__dirname, "templates");

  // check distDir is exist
  if (!isPathDir(distDir)) {
    await buildDistDir();
  }

  // remove publicDir
  fse.emptydir(publicDir, (err) => {
    if (err) {
      throw err;
    }
    // copy src from dest
    fse.copy(distDir, publicDir, function (err) {
      if (err) {
        throw err;
      }
      // hack editor.html
      let editorPath = path.join(publicDir, "editor.html");
      let editor = fs.readFileSync(editorPath, "utf8");
      fs.writeFileSync(editorPath, hackForClient(editor));

      // copy generate templates
      fse.emptyDir(srcDir, (err) => {
        if (err) {
          throw err;
        }
        fse.copy(templatesDir, electronDir, function (err) {
          if (err) {
            throw err;
          }
          installDependencies(electronDir);
        });
      });
    });
  });
};

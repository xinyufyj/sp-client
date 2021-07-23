const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { isPathDir, isPathFile } = require('./utils')
const path = require('path')
const log = require('./log')
const fse = require("fs-extra");
const fs = require("fs");
const spawn = require("cross-spawn");

const projectName = 'electron'
const workDir = path.join(process.cwd(), projectName)

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

function update() {
  let pkg = path.join(process.cwd(), 'package.json')
  if(!isPathFile(pkg) || (JSON.parse(fs.readFileSync(pkg, 'utf8')).name != 'studio')) {
    log.error('This cli must exec in suanpan-web root dir.')
    return
  }
  if(!isPathDir(workDir)) {
    log.error(`${projectName} directory does not exist. Do you mean create?`)
    return
  }

  const distDir = path.join(process.cwd(), "dist");
  if (!isPathDir(distDir)) {
    log.error(`dist directory does not exist. Please build first.`)
    return  
  }

  const argv = yargs(hideBin(process.argv)).argv
  let isBuild = !!argv.build
  if(isBuild) {
    fse.remove(distDir, async (err) => {
      if(err) {
        throw err
      }
      await buildDistDir();
      updateEditor();
    })
  }else {
    updateEditor();
  }

}

function updateEditor() {
  const editorPath = path.join(process.cwd(), "dist", 'editor.html')
  if(!isPathFile(editorPath)) {
    log.error(`editor.html does not exist.`)
    return
  }
  const electronPath = path.join(process.cwd(), projectName, 'public/editor.html')
  if(!isPathFile(electronPath)) {
    log.error(`editor.html does not exist.`)
    return
  }
  let distEditor = fs.readFileSync(editorPath, "utf8");
  let electronEditor = fs.readFileSync(electronPath, "utf8")
  let regex = /(assets\/web\/(css|js)\/(main|lib)-\S+?\.(css|js))/g;
  let result = ''
  let cssMain, jsLib, jsMain;
  while((result = regex.exec(distEditor))) {
    if(result[1].startsWith('assets/web/css/main-')) {
      cssMain = result[1]
    }else if(result[1].startsWith('assets/web/js/lib-')) {
      jsLib = result[1]
    }else if(result[1].startsWith('assets/web/js/main-')) {
      jsMain = result[1]
    }
  }
  electronEditor = electronEditor.replace(/assets\/web\/css\/main-\S+?\.css/, cssMain)
  electronEditor = electronEditor.replace(/assets\/web\/js\/lib-\S+?\.js/, jsLib)
  electronEditor = electronEditor.replace(/assets\/web\/js\/main-\S+?\.js/, jsMain)

  fs.writeFileSync(electronPath, electronEditor);

  let electronPublicAssets = path.join(process.cwd(), projectName, 'public/assets')
  let distPublicAssets = path.join(process.cwd(), 'dist', 'assets')
  fse.emptydir(electronPublicAssets, (err) => {
    if (err) {
      throw err;
    }
    fse.copy(distPublicAssets, electronPublicAssets, function (err) {
      if (err) {
        throw err;
      }
      log.success('update successfully')
    });
  })
}

module.exports = update
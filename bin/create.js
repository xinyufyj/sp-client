const spawn = require('cross-spawn')
const path = require('path')
const log = require('./log')
const fs = require('fs')
const { getNodeJSVerson, getVueCliVersion, isPathDir, isPathFile } = require('./utils')
const generator = require('./generator')

const projectName = 'electron'
const workDir = path.join(process.cwd(), projectName)

function createVueProject() {
  return new Promise((resolve, reject) => {
    const jsonPreset = {
      "useConfigFiles": true,
      "plugins": {
        "@vue/cli-plugin-babel": {},
        "@vue/cli-plugin-vuex": {}
      },
      "vueVersion": "2",
      "cssPreprocessor": "less"
    };
    const child = spawn('vue', ['create', projectName, '--inlinePreset', JSON.stringify(jsonPreset)], { stdio: 'inherit' });
    child.on('close', () => {
      resolve();
    });
    child.on('error', () => {
      reject();
    })
  });
}

function createVueElectronBuilder() {
  return new Promise((resolve, reject) => {
    const child = spawn('vue', ['add', 'electron-builder'], { stdio: 'inherit', cwd: path.resolve(process.cwd(), projectName) });
    child.on('close', () => {
      resolve();
    });
    child.on('error', () => {
      reject();
    })
  });
}

function removeClientDir() {
  fs.rmdir(workDir, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
  });
}

function injectElectronVersion() {
  let pkgPath = path.join(process.cwd(), projectName, 'package.json')
  let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if(!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  pkg.devDependencies.electron = "^11.0.0";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
}

async function create() {
  log.info(`
    create client
  `)
  // check nodejs
  if(getNodeJSVerson() < 14.0) {
    log.error('nodejs must be greater than 14.0')
    return
  }

  // check vue cli
  if(getVueCliVersion() < 4.0) {
    log.error(`This cli depends on @vue/cli, which must be greater than 4.0. please install (npm install -g @vue/cli) or update (npm update -g @vue/cli)`)
    return
  }
  
  // check cwd
  let pkg = path.join(process.cwd(), 'package.json')
  if(!isPathFile(pkg) || (JSON.parse(fs.readFileSync(pkg, 'utf8')).name != 'studio')) {
    log.error('This cli must exec in suanpan-web root dir.')
    return
  }

  if(isPathDir(workDir)) {
    log.error(`${projectName} directory has been existed. Do you mean update?`)
    return;
  }

  try {
    await createVueProject()
    injectElectronVersion()
    await createVueElectronBuilder()
    await generator(projectName)
  } catch (error) {
    removeClientDir()
    log.error('create client failed')
  }
}

module.exports = create
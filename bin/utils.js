const spawn = require('cross-spawn')
const fs = require('fs')

function isPathExist(path) {
  return fs.existsSync(path)
}

function isPathDir(path) {
  if(!isPathExist(path)) {
    return false;
  }
  return fs.lstatSync(path).isDirectory()
}

function isPathFile(path) {
  if(!isPathExist(path)) {
    return false;
  }
  return fs.lstatSync(path).isFile()
}

function getNodeJSVerson() {
  const result = spawn.sync('node', ['-v'])
  const outputStr = result.stdout.toString('utf8').trim()
  let v = 0
  if(outputStr) {
    v = parseFloat(outputStr.match(/^v(\d+\.\d+)/)[1])
  }
  return v
}

function getVueCliVersion() {
  const result = spawn.sync('vue', ['--version'])
  const outputStr = result.stdout.toString('utf8').trim()
  let v = 0
  if(outputStr) {
    v = parseFloat(outputStr.match(/(\d+\.\d+)/)[1])
  }
  return v
}

module.exports = {
  getNodeJSVerson,
  getVueCliVersion,
  isPathDir,
  isPathFile
}
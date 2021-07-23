#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const log = require('./log')
const argv = yargs(hideBin(process.argv)).argv
const create = require('./create')
const update = require('./update')

let argvs = argv._
if(argvs.length > 0) {
  if(argvs[0] === 'create') {
    create()
  }else if(argvs[0] === 'update') {
    update()
  }else {
    log.error('unknown command. Do you mean create or update?')
  }
}else {
  log.error('Do you mean create or update?')
}
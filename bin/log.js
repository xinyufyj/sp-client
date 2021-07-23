const chalk = require('chalk');

const errorChalk = chalk.bold.red;
const warningChalk = chalk.keyword('orange');
const successChalk =  chalk.keyword('green');
const infoChalk =  chalk.keyword('white');

function success(...data) {
  console.log(successChalk(['success:', ...data].join(' ')));
}

function error(...data) {
  console.log(errorChalk(['error:', ...data].join(' ')));
}

function warning(...data) {
  console.log(warningChalk(['warning:', ...data].join(' ')));
}

function info(...data) {
  console.log(infoChalk([...data].join(' ')));
}

module.exports = {
  success,
  error,
  warning,
  info
}
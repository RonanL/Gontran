import yargs from 'yargs';
import fs from 'fs';

const argv = yargs
  .alias('c', 'config')
  .argv;

let configFilePath = './settings/config.json';
if (typeof argv.config !== 'undefined') {
  configFilePath = argv.config;
}

const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

const argvData = {};

if (typeof argv.inputFolder !== 'undefined') {
  argvData.inputFolder = argv.inputFolder;
}

const context = Object.assign(configData, argvData);

export default context;
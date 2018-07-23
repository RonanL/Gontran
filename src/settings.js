import yaml from 'yaml-js';
import yargs from 'yargs';
import fs from 'fs';

const argv = yargs
  .alias('c', 'config')
  .argv;

let configFilePath = './settings/config.yml';
if (typeof argv.config !== 'undefined') {
  configFilePath = argv.config;
}

const configData = yaml.load(fs.readFileSync(configFilePath, 'utf8'));

const argvData = {};

if (typeof argv.inputFolder !== 'undefined') {
  argvData.inputFolder = argv.inputFolder;
}

const context = Object.assign(configData, argvData);

export default context;
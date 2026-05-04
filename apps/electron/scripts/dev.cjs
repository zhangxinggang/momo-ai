process.env.NODE_ENV = 'development';

const ChildProcess = require('child_process');
const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const Electron = require('electron');
const { EOL } = require('os');
const prepare = require('./prepare.cjs');

let electronProcess = null;
let electronProcessLocker = false;
let rendererPort = 0;
let isBuilding = false;

/** 开发态从 dist/src/main/dev 启动，调用包导出的 init */
const mainEntry = path.join(__dirname, '..', 'dist', 'src', 'main', 'dev.cjs');
const srcPath = path.join(__dirname, '..', 'src');

async function buildAndStartElectron() {
  if (isBuilding) {
    return;
  }
  isBuilding = true;
  try {
    await prepare();
  } catch {
    console.log(chalk.redBright('Could not start Electron because of the above build error(s).'));
    electronProcessLocker = false;
    isBuilding = false;
    return;
  }
  isBuilding = false;

  if (electronProcess) {
    restartElectron();
    return;
  }

  const args = [mainEntry, rendererPort];
  electronProcess = ChildProcess.spawn(Electron, args);
  electronProcessLocker = false;

  electronProcess.stdout.on('data', (data) => {
    if (data == EOL) {
      return;
    }
    process.stdout.write(chalk.blueBright(`[electron] `) + chalk.white(data.toString()));
  });
  electronProcess.stderr.on('data', (data) =>
    process.stderr.write(chalk.blueBright(`[electron] `) + chalk.white(data.toString())),
  );
  electronProcess.on('exit', () => stop());
}

function restartElectron() {
  if (electronProcess) {
    electronProcess.removeAllListeners('exit');
    electronProcess.kill();
    electronProcess = null;
  }

  if (!electronProcessLocker) {
    electronProcessLocker = true;
    buildAndStartElectron();
  }
}

function stop() {
  process.exit();
}

async function start() {
  console.log(`${chalk.greenBright('=======================================')}`);
  console.log(`${chalk.greenBright('Starting Electron + Vite Dev Server...')}`);
  console.log(`${chalk.greenBright('=======================================')}`);

  if (!electronProcessLocker) {
    electronProcessLocker = true;
    await buildAndStartElectron();
  }

  chokidar
    .watch(srcPath, {
      cwd: srcPath,
      ignoreInitial: true,
    })
    .on('change', (changedPath) => {
      console.log(chalk.blueBright(`[electron] `) + `Change in ${changedPath}. rebuilding...`);
      if (!electronProcessLocker) {
        electronProcessLocker = true;
        buildAndStartElectron();
      }
    });
}

start();

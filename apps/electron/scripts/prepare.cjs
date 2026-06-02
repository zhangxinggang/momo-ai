const path = require('path');
const ChildProcess = require('child_process');
const Chalk = require('chalk');
const fs = require('fs');

const nativeFolder = 'src/main/database/native';
const STATIC_FOLDER_NAME = 'static';
const CONFIG_FILE = 'appConf.cjs';
const SERVER_FOLDER = 'server';
const SYSTEM_SERVER_FOLDER = 'src/main/server/system';

const electronRoot = path.join(__dirname, '..');
const distRoot = path.join(electronRoot, 'dist');

/** 先编译 workspace 包，避免 Node 以 strip-only 方式直接执行 .ts 里的 import/export */
function buildMomoUtils() {
  const repoRoot = path.join(electronRoot, '..', '..');
  return new Promise((resolve, reject) => {
    const child = ChildProcess.exec('pnpm --filter @momo/utils run build', {
      cwd: repoRoot,
    });
    child.stdout.on('data', (data) =>
      process.stdout.write(Chalk.cyanBright('[@momo/utils] ') + Chalk.white(data.toString())),
    );
    child.stderr.on('data', (data) =>
      process.stderr.write(Chalk.cyanBright('[@momo/utils] ') + Chalk.white(data.toString())),
    );
    child.on('exit', (exitCode) => {
      if (exitCode > 0) {
        reject(new Error('@momo/utils build failed'));
      } else {
        resolve();
      }
    });
  });
}

function buildMomoServer() {
  const repoRoot = path.join(electronRoot, '..', '..');
  return new Promise((resolve, reject) => {
    const child = ChildProcess.exec('pnpm --filter @momo/server run build', {
      cwd: repoRoot,
    });
    child.stdout.on('data', (data) =>
      process.stdout.write(Chalk.cyanBright('[@momo/server] ') + Chalk.white(data.toString())),
    );
    child.stderr.on('data', (data) =>
      process.stderr.write(Chalk.cyanBright('[@momo/server] ') + Chalk.white(data.toString())),
    );
    child.on('exit', (exitCode) => {
      if (exitCode > 0) {
        reject(new Error('@momo/server build failed'));
      } else {
        resolve();
      }
    });
  });
}

function buildWithVite() {
  return new Promise((resolve, reject) => {
    const child = ChildProcess.exec('pnpm exec vite build', {
      cwd: electronRoot,
    });
    child.stdout.on('data', (data) =>
      process.stdout.write(Chalk.yellowBright('[vite] ') + Chalk.white(data.toString())),
    );
    child.stderr.on('data', (data) =>
      process.stderr.write(Chalk.yellowBright('[vite] ') + Chalk.white(data.toString())),
    );
    child.on('exit', (exitCode) => {
      if (exitCode > 0) {
        reject(new Error('Vite build failed'));
      } else {
        resolve();
      }
    });
  });
}

/** 将 system 动态路由 TS 编译为 CJS，供运行时 require 加载 */
async function compileSystemServerRoutes() {
  const systemServerSrcDir = path.join(electronRoot, SYSTEM_SERVER_FOLDER);
  const systemServerOutDir = path.join(distRoot, SYSTEM_SERVER_FOLDER);

  if (!fs.existsSync(systemServerSrcDir)) {
    return;
  }

  const tsFileNames = fs.readdirSync(systemServerSrcDir).filter((name) => name.endsWith('.ts'));
  if (tsFileNames.length === 0) {
    return;
  }

  const { transformWithEsbuild } = await import('vite');

  if (fs.existsSync(systemServerOutDir)) {
    fs.rmSync(systemServerOutDir, { recursive: true, force: true });
  }
  fs.mkdirSync(systemServerOutDir, { recursive: true });

  for (const fileName of tsFileNames) {
    const sourcePath = path.join(systemServerSrcDir, fileName);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const result = await transformWithEsbuild(source, sourcePath, {
      loader: 'ts',
      format: 'cjs',
      platform: 'node',
      target: 'node20',
    });
    const outPath = path.join(systemServerOutDir, fileName.replace(/\.ts$/, '.js'));
    fs.writeFileSync(outPath, result.code);
  }
}

/** 将 server、static、appConf.cjs 复制到 dist 根目录，供打包后运行时解析 */
function copyDistRootAssets() {
  const copyList = [
    { name: STATIC_FOLDER_NAME },
    { name: CONFIG_FILE },
    { name: SERVER_FOLDER },
    { name: nativeFolder },
  ];

  for (const { name } of copyList) {
    const from = path.join(electronRoot, name);
    const to = path.join(distRoot, name);
    if (!fs.existsSync(from)) {
      continue;
    }
    if (fs.existsSync(to)) {
      fs.rmSync(to, { recursive: true, force: true });
    }
    fs.cpSync(from, to, { recursive: true });
  }
}

module.exports = function () {
  return buildMomoUtils()
    .then(buildMomoServer)
    .then(buildWithVite)
    .then(compileSystemServerRoutes)
    .then(() => {
      copyDistRootAssets();
      return 1;
    });
};

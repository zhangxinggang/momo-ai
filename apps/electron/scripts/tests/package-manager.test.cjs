const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

const builderRequire = createRequire(require.resolve('electron-builder'));
const { detectPackageManager } = builderRequire('app-builder-lib/out/node-module-collector/packageManager');

test('electron-builder selects pnpm even when packaging is started with npm run', async () => {
  const previous = { userAgent: process.env.npm_config_user_agent, execPath: process.env.npm_execpath };
  process.env.npm_config_user_agent = 'npm/10.9.3 node/v22.20.0 win32 x64';
  process.env.npm_execpath = path.join('npm', 'bin', 'npm-cli.js');
  try {
    const detected = await detectPackageManager([path.join(__dirname, '../..')]);
    assert.equal(detected.pm, 'pnpm');
    assert.equal(detected.detectionMethod, 'packageManager field');
  } finally {
    for (const [key, value] of [['npm_config_user_agent', previous.userAgent], ['npm_execpath', previous.execPath]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

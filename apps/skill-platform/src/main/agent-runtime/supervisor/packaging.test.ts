import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
const require = createRequire(import.meta.url);
const verify = require('../../../../scripts/build/verify-harness-native.cjs');
const checkOutputIdle = require('../../../../scripts/build/check-output-idle.cjs');
const { packHarness } = require('../../../../scripts/build/pack-harness.cjs');
const { copyFiles, getFileMatchers } = createRequire(require.resolve('electron-builder'))(
  'app-builder-lib/out/fileMatcher',
);
const buildConfig = require('../../../../scripts/build/electron-builder-win.json');
const entry = 'node_modules/@deepseek-ai/dsh/lib/bin.js';
describe('packaged Harness integrity gate', () => {
  let home: string, root: string, archive: string;
  beforeEach(async () => {
    home = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-harness-pack-'));
    root = path.join(home, 'harness-builtin');
    archive = path.join(home, 'resources/harness-builtin.asar');
    await fs.mkdir(root, { recursive: true });
    const files: Record<string, string> = {};
    const node = process.platform === 'win32' ? 'node.exe' : 'node';
    await fs.copyFile(process.execPath, path.join(root, node));
    const paths = [
      node,
      entry,
      'node_modules/.bin/dsh.cmd',
      'node_modules/.package-lock.json',
      'node_modules/dependency/index.js',
      'node_modules/dependency/node_modules/nested/index.js',
      'package-lock.json',
      'profile/cordis.patch.yml',
      'plugins/momo-host-bridge/index.mjs',
      'plugins/momo-host-bridge/tool-schema.mjs',
      'plugins/momo-model-credentials/index.mjs',
    ];
    for (const relative of paths) {
      const target = path.join(root, relative);
      if (relative !== node) {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, 'fixture');
      }
      files[relative] = createHash('sha256')
        .update(await fs.readFile(target))
        .digest('hex');
    }
    const sorted = Object.fromEntries(
      Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    await fs.writeFile(
      path.join(root, 'runtime.json'),
      JSON.stringify({
        runtimeId: 'deepseek-harness',
        bundleId:
          'dsh-test-' +
          createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16),
        coreVersion: 'test',
        hostProtocolRange: '1.x',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        node,
        entry,
        files,
      }),
    );
  });
  afterEach(async () => {
    await fs.rm(home, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  });
  it.runIf(process.platform === 'win32')(
    'refuses a locked output before any old files are removed',
    async () => {
      const sentinel = path.join(root, 'package.json');
      await fs.writeFile(sentinel, 'old-build');
      const child = spawn(
        process.execPath,
        [
          '-e',
          "require('fs').openSync(process.argv[1], 'r'); console.log('ready'); setInterval(()=>{}, 1000)",
          sentinel,
        ],
        { windowsHide: true },
      );
      try {
        await new Promise<void>((resolve, reject) => {
          child.once('error', reject);
          child.stdout.once('data', () => resolve());
        });
        await expect(
          checkOutputIdle({ appOutDir: root, electronPlatformName: 'win32' }),
        ).rejects.toThrow('清理前停止');
        expect(await fs.readFile(sentinel, 'utf8')).toBe('old-build');
      } finally {
        const closed = new Promise((resolve) => child.once('close', resolve));
        child.kill();
        await closed;
      }
      await expect(
        checkOutputIdle({ appOutDir: root, electronPlatformName: 'win32' }),
      ).resolves.toBeUndefined();
    },
    30_000,
  );
  it('verifies copied assets and starts the matched packaged Node', async () => {
    await packHarness(root, archive, { quality: 1 });
    await expect(
      verify({ appOutDir: home, electronPlatformName: process.platform }),
    ).resolves.toBeUndefined();
  }, 90_000);
  it('copies the complete runtime through electron-builder extraResources', async () => {
    const projectDir = path.join(home, 'project/apps/skill-platform');
    const source = path.join(home, 'project/apps/skill-platform/dist/runtime/harness-builtin.asar');
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.dirname(source), { recursive: true });
    await packHarness(root, source, { compressed: false });
    const extraResources = buildConfig.extraResources.filter(
      (resource: { to: string }) => resource.to === 'harness-builtin.asar',
    );
    const matchers = getFileMatchers(
      { ...buildConfig, extraResources },
      'extraResources',
      path.join(home, 'resources'),
      {
        defaultSrc: projectDir,
        globalOutDir: path.join(projectDir, 'out'),
        customBuildOptions: {},
        macroExpander: (value: string) => value,
      },
    );
    await copyFiles(matchers, undefined, false);
    await expect(
      verify({ appOutDir: home, electronPlatformName: process.platform }),
    ).resolves.toBeUndefined();
  });
  it('rejects a modified host bridge before publishing', async () => {
    await fs.writeFile(path.join(root, 'plugins/momo-host-bridge/index.mjs'), 'changed');
    await packHarness(root, archive, { compressed: false });
    await expect(
      verify({ appOutDir: home, electronPlatformName: process.platform }),
    ).rejects.toThrow('corrupted');
  });
});

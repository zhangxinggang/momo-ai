import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
const require = createRequire(import.meta.url);
const verify = require('../../../../scripts/build/verify-harness-native.cjs');
const { copyFiles, getFileMatchers } = createRequire(require.resolve('electron-builder'))(
  'app-builder-lib/out/fileMatcher',
);
const buildConfig = require('../../../../scripts/build/electron-builder-win.json');
const entry = 'node_modules/@deepseek-ai/dsh/lib/bin.js';
describe('packaged Harness integrity gate', () => {
  let home: string, root: string;
  beforeEach(async () => {
    home = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-harness-pack-'));
    root = path.join(home, 'resources/harness-builtin');
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
      'plugins/momo-tools/action-worker.mjs',
      'plugins/momo-tools/action-worker.py',
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
  it('verifies copied assets and starts the matched packaged Node', async () => {
    await expect(
      verify({ appOutDir: home, electronPlatformName: process.platform }),
    ).resolves.toBeUndefined();
  });
  it('copies the complete runtime through electron-builder extraResources', async () => {
    const projectDir = path.join(home, 'project/apps/skill-platform');
    const source = path.join(home, 'project/packages/momo-harness-runner/dist');
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.rename(root, source);
    const extraResources = buildConfig.extraResources.filter(
      (resource: { to: string }) =>
        resource.to === 'harness-builtin' || resource.to.startsWith('harness-builtin/'),
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
  it('rejects a modified action worker before publishing', async () => {
    await fs.writeFile(path.join(root, 'plugins/momo-tools/action-worker.py'), 'changed');
    await expect(
      verify({ appOutDir: home, electronPlatformName: process.platform }),
    ).rejects.toThrow('corrupted');
  });
});

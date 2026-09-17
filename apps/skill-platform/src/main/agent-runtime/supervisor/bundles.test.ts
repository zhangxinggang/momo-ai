import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RuntimeBundles } from './bundles';

describe('builtin adapter updates with the same native core', () => {
  let root: string, builtin: string, bundles: RuntimeBundles, bundleId: string;
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-bundle-replay-'));
    builtin = path.join(root, 'builtin');
    await fs.mkdir(builtin);
    const files: Record<string, string> = {};
    for (const relative of [
      'node.exe',
      'node_modules/@deepseek-ai/dsh/lib/bin.js',
      'plugins/momo-host-bridge/index.mjs',
      'plugins/momo-host-bridge/tool-schema.mjs',
      'plugins/momo-model-credentials/index.mjs',
      'plugins/momo-tools/action-worker.mjs',
      'plugins/momo-tools/action-worker.py',
      'profile/agent-presets/momo-default/agent.cordis.yml',
      'profile/package.json',
      'profile/cordis.patch.yml',
    ]) {
      const file = path.join(builtin, relative);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, 'fixture');
      files[relative] = createHash('sha256').update('fixture').digest('hex');
    }
    const sorted = Object.fromEntries(
      Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    bundleId =
      'dsh-0.1.6-alpha.2-' +
      createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16);
    await fs.writeFile(
      path.join(builtin, 'runtime.json'),
      JSON.stringify({
        runtimeId: 'deepseek-harness',
        bundleId,
        coreVersion: '0.1.6-alpha.2',
        hostProtocolRange: '1.x',
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        node: 'node.exe',
        entry: 'node_modules/@deepseek-ai/dsh/lib/bin.js',
        files: sorted,
      }),
    );
    bundles = new RuntimeBundles(path.join(root, 'imports'), builtin);
  });
  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });
  it('keeps the original native journal namespace when only the builtin adapter changed', async () => {
    const old = 'dsh-0.1.6-alpha.2-0000000000000000';
    expect(await bundles.get(old)).toMatchObject({
      root: builtin,
      sessionNamespace: old,
      manifest: { bundleId },
    });
    expect(await bundles.get()).not.toHaveProperty('sessionNamespace');
  });
  it('does not migrate a different native core', async () => {
    await expect(bundles.get('dsh-0.1.5-0000000000000000')).rejects.toThrow('版本不存在');
  });
  it('continues verifying explicit pinned runtime directories', async () => {
    const pinned = path.join(root, 'imports', bundleId);
    await fs.cp(builtin, pinned, { recursive: true });
    expect(await bundles.get(bundleId)).toMatchObject({ root: pinned, manifest: { bundleId } });
  });
});

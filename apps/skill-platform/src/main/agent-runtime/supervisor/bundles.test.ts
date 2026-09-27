import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { create } from 'tar';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { materializeBuiltinBundle, RuntimeBundles } from './bundles';

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
      'dsh-0.2.1-alpha.1-' +
      createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16);
    await fs.writeFile(
      path.join(builtin, 'runtime.json'),
      JSON.stringify({
        runtimeId: 'deepseek-harness',
        bundleId,
        coreVersion: '0.2.1-alpha.1',
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
    const old = 'dsh-0.2.1-alpha.1-0000000000000000';
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
  it('materializes the packaged builtin into its immutable user-data cache', async () => {
    const cache = path.join(root, 'builtin-cache');
    const packaged = new RuntimeBundles(path.join(root, 'imports'), builtin, cache);
    const result = await packaged.get();
    const expected = path.join(cache, bundleId);
    expect(result).toMatchObject({ root: expected, manifest: { bundleId } });
    await expect(fs.readFile(path.join(expected, 'runtime.json'), 'utf8')).resolves.toContain(
      bundleId,
    );
  });
  async function compressFixture(tampered = false, extra = false) {
    const relative = 'plugins/momo-host-bridge/index.mjs';
    const file = path.join(builtin, relative);
    if (tampered) await fs.writeFile(file, 'tampered');
    const manifest = JSON.parse(await fs.readFile(path.join(builtin, 'runtime.json'), 'utf8'));
    if (extra) await fs.writeFile(path.join(builtin, 'undeclared.txt'), 'extra');
    await create(
      {
        cwd: builtin,
        file: path.join(builtin, 'payload.tar.br'),
        brotli: true,
        portable: true,
        noMtime: true,
      },
      [...Object.keys(manifest.files), ...(extra ? ['undeclared.txt'] : [])],
    );
    await fs.writeFile(
      path.join(builtin, 'storage.json'),
      JSON.stringify({
        format: 'brotli-tar-v1',
      }),
    );
    return { relative, file };
  }
  it('stream-decodes the solid payload, preserves identity and repairs a damaged cache', async () => {
    const { relative } = await compressFixture();
    const cache = path.join(root, 'builtin-cache');
    const target = await materializeBuiltinBundle(builtin, cache);
    expect(target).toBe(path.join(cache, bundleId));
    expect(await fs.readFile(path.join(target, relative), 'utf8')).toBe('fixture');
    await fs.writeFile(path.join(target, relative), 'damaged');
    expect(await materializeBuiltinBundle(builtin, cache)).toBe(target);
    expect(await fs.readFile(path.join(target, relative), 'utf8')).toBe('fixture');
    // A valid cache is independent of its original archive's storage encoding.
    await fs.rm(builtin, { recursive: true });
    await fs.mkdir(builtin);
    await fs.copyFile(path.join(target, 'runtime.json'), path.join(builtin, 'runtime.json'));
    expect(await materializeBuiltinBundle(builtin, cache)).toBe(target);
  });
  it('rejects corrupt compressed payloads without leaving a partial cache', async () => {
    await compressFixture(true);
    const cache = path.join(root, 'builtin-cache');
    await expect(materializeBuiltinBundle(builtin, cache)).rejects.toThrow('校验失败');
    expect(await fs.readdir(cache)).toEqual([]);
  });
  it('rejects a truncated Brotli stream and cleans partial extraction', async () => {
    await compressFixture();
    const payload = path.join(builtin, 'payload.tar.br');
    const bytes = await fs.readFile(payload);
    await fs.writeFile(payload, bytes.subarray(0, bytes.length - 16));
    const cache = path.join(root, 'builtin-cache');
    await expect(materializeBuiltinBundle(builtin, cache)).rejects.toThrow();
    expect(await fs.readdir(cache)).toEqual([]);
  });
  it('rejects unknown storage formats and undeclared payload entries', async () => {
    const cache = path.join(root, 'builtin-cache');
    await fs.writeFile(path.join(builtin, 'storage.json'), JSON.stringify({ format: 'future-v2' }));
    await expect(materializeBuiltinBundle(builtin, cache)).rejects.toThrow(
      'INVALID_BUILTIN_STORAGE',
    );
    await compressFixture(false, true);
    await expect(materializeBuiltinBundle(builtin, cache)).rejects.toThrow('INVALID_BUILTIN_ENTRY');
    expect(await fs.readdir(cache)).toEqual([]);
  });
});

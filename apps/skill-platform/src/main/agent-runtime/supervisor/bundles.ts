import type { RuntimeBundleManifest } from '@momo/agent-contracts';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function safeExistingPath(root: string, relative: string): Promise<string> {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..'))
    throw new Error('INVALID_BUNDLE_PATH');
  const base = await fs.realpath(root);
  let walked = base;
  for (const part of relative.split(/[\\/]/).filter((p) => p && p !== '.')) {
    walked = path.join(walked, part);
    if ((await fs.lstat(walked)).isSymbolicLink()) throw new Error('SYMLINK_NOT_ALLOWED');
  }
  const full = await fs.realpath(path.resolve(base, relative));
  const inside = path.relative(base, full);
  if (inside.startsWith('..') || path.isAbsolute(inside)) throw new Error('PATH_ESCAPES_ROOT');
  return full;
}
export async function verifyBundle(root: string): Promise<RuntimeBundleManifest> {
  const manifest = JSON.parse(
    await fs.readFile(path.join(root, 'runtime.json'), 'utf8'),
  ) as RuntimeBundleManifest;
  if (
    manifest.runtimeId !== 'deepseek-harness' ||
    !/^dsh-[a-zA-Z0-9.-]+$/.test(manifest.bundleId) ||
    manifest.hostProtocolRange !== '1.x' ||
    manifest.platform !== process.platform ||
    manifest.arch !== process.arch
  )
    throw new Error('运行包与当前系统不兼容');
  if (
    !manifest.files ||
    !Object.keys(manifest.files).length ||
    Object.keys(manifest.files).length > 100000
  )
    throw new Error('INVALID_FILE_MANIFEST');
  for (const required of [
    manifest.entry,
    manifest.node,
    'plugins/momo-host-bridge/index.mjs',
    'plugins/momo-host-bridge/tool-schema.mjs',
    'plugins/momo-model-credentials/index.mjs',
    'plugins/momo-tools/action-worker.mjs',
    'plugins/momo-tools/action-worker.py',
    'profile/agent-presets/momo-default/agent.cordis.yml',
    'profile/package.json',
    'profile/cordis.patch.yml',
  ]) {
    if (!Object.hasOwn(manifest.files, required)) throw new Error('缺少运行包文件：' + required);
  }
  const version = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(manifest.nodeVersion);
  if (
    !version ||
    !((Number(version[1]) === 22 && Number(version[2]) >= 19) || Number(version[1]) >= 24)
  )
    throw new Error('运行包 Node 版本不兼容');
  const sorted = Object.fromEntries(
    Object.entries(manifest.files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  const digest = createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16);
  if (manifest.bundleId !== 'dsh-' + manifest.coreVersion + '-' + digest)
    throw new Error('INVALID_BUNDLE_IDENTITY');
  const entries = Object.entries(manifest.files);
  let next = 0;
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      while (next < entries.length) {
        const [relative, hash] = entries[next++];
        if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('INVALID_FILE_HASH');
        const file = await safeExistingPath(root, relative);
        if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('运行包不允许链接');
        const actual = createHash('sha256')
          .update(await fs.readFile(file))
          .digest('hex');
        if (actual !== hash) throw new Error('运行包文件校验失败：' + relative);
      }
    }),
  );
  return manifest;
}
export class RuntimeBundles {
  private verified = new Map<
    string,
    { root: string; manifest: RuntimeBundleManifest; sessionNamespace?: string }
  >();
  constructor(
    private root: string,
    private builtin: string,
  ) {}
  async get(bundleId?: string) {
    if (!bundleId) {
      try {
        bundleId = JSON.parse(
          await fs.readFile(path.join(this.root, 'active.json'), 'utf8'),
        ).bundleId;
      } catch {
        /* Default bundled runtime. */
      }
    }
    if (bundleId && this.verified.has(bundleId)) return this.verified.get(bundleId)!;
    let directory = this.builtin,
      pinned = false;
    if (bundleId) {
      if (!/^dsh-[a-zA-Z0-9.-]+$/.test(bundleId)) throw new Error('INVALID_BUNDLE_ID');
      const candidate = path.join(this.root, bundleId);
      try {
        await fs.access(candidate);
        directory = candidate;
        pinned = true;
      } catch {
        /* May refer to the bundled version. */
      }
    }
    const manifest = await verifyBundle(directory);
    const changed = bundleId && bundleId !== manifest.bundleId;
    // An updated builtin adapter can replay journals from the identical native core.
    // Explicit imported bundles stay pinned, and a core upgrade never silently migrates history.
    if (changed && (pinned || !bundleId.startsWith('dsh-' + manifest.coreVersion + '-')))
      throw new Error('会话绑定的 Harness 版本不存在，无法恢复');
    const result = {
      root: directory,
      manifest,
      ...(changed ? { sessionNamespace: bundleId } : {}),
    };
    this.verified.set(bundleId ?? manifest.bundleId, result);
    return result;
  }
  async list() {
    await fs.mkdir(this.root, { recursive: true });
    const active = await this.get();
    const builtin = JSON.parse(
      await fs.readFile(path.join(this.builtin, 'runtime.json'), 'utf8'),
    ) as RuntimeBundleManifest;
    const bundles = [builtin];
    if (active.manifest.bundleId !== builtin.bundleId) bundles.push(active.manifest);
    for (const item of await fs.readdir(this.root, { withFileTypes: true })) {
      if (
        !item.isDirectory() ||
        !item.name.startsWith('dsh-') ||
        bundles.some((b) => b.bundleId === item.name)
      )
        continue;
      try {
        bundles.push(
          JSON.parse(await fs.readFile(path.join(this.root, item.name, 'runtime.json'), 'utf8')),
        );
      } catch {
        /* Incomplete staging packages are not offered. */
      }
    }
    return { activeBundleId: active.manifest.bundleId, bundles };
  }
  async import(
    directory: string,
    probe: (root: string, manifest: RuntimeBundleManifest) => Promise<unknown>,
  ) {
    await fs.mkdir(this.root, { recursive: true });
    const staging = path.join(this.root, 'staging-' + randomUUID());
    await fs.mkdir(staging);
    const manifest = await verifyBundle(directory);
    // Copy only declared immutable files; candidate-supplied extra files cannot influence resolution.
    for (const relative of Object.keys(manifest.files)) {
      const target = path.join(staging, relative);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(await safeExistingPath(directory, relative), target);
    }
    await fs.copyFile(path.join(directory, 'runtime.json'), path.join(staging, 'runtime.json'));
    await verifyBundle(staging);
    const report = await probe(staging, manifest);
    const target = path.join(this.root, manifest.bundleId);
    try {
      await fs.access(target);
      await verifyBundle(target);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
      await fs.rename(staging, target);
    }
    this.verified.set(manifest.bundleId, { root: target, manifest });
    await this.activate(manifest.bundleId);
    return { manifest, report };
  }
  private async activate(bundleId: string) {
    const bundle = await this.get(bundleId);
    const manifest = await verifyBundle(bundle.root);
    await fs.mkdir(this.root, { recursive: true });
    const temporary = path.join(this.root, 'active-' + randomUUID() + '.json');
    await fs.writeFile(
      temporary,
      JSON.stringify({ bundleId: manifest.bundleId, activatedAt: Date.now() }),
    );
    await fs.rename(temporary, path.join(this.root, 'active.json'));
    return manifest;
  }
}

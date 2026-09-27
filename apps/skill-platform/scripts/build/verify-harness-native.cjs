const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { createBrotliDecompress } = require('node:zlib');
const tar = require('tar');
module.exports = async function verifyHarnessNative(context) {
  const archive = path.join(context.appOutDir, 'resources', 'harness-builtin.asar');
  const { loadAsar } = require('./pack-harness.cjs');
  const asar = loadAsar();
  const readRaw = (relative) => asar.extractFile(archive, path.normalize(relative));
  const manifest = JSON.parse(readRaw('runtime.json').toString('utf8'));
  const storage = JSON.parse(readRaw('storage.json').toString('utf8'));
  if (!['raw-v1', 'brotli-tar-v1'].includes(storage.format))
    throw new Error('Invalid Harness storage format');
  if (
    manifest.runtimeId !== 'deepseek-harness' ||
    manifest.platform !== context.electronPlatformName ||
    manifest.hostProtocolRange !== '1.x'
  )
    throw new Error('Harness runtime packaging mismatch');
  const sorted = Object.fromEntries(
    Object.entries(manifest.files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  if (
    manifest.bundleId !==
    'dsh-' +
      manifest.coreVersion +
      '-' +
      createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16)
  )
    throw new Error('Harness bundle identity mismatch');
  for (const required of [
    manifest.node,
    manifest.entry,
    'profile/cordis.patch.yml',
    'plugins/momo-host-bridge/index.mjs',
    'plugins/momo-model-credentials/index.mjs',
    'plugins/momo-host-bridge/tool-schema.mjs',
  ])
    if (!Object.hasOwn(sorted, required))
      throw new Error('Harness packaged file missing: ' + required);
  const temporary = await fsp.mkdtemp(path.join(os.tmpdir(), 'momo-harness-node-'));
  try {
    const compressed = storage.format === 'brotli-tar-v1';
    if (compressed) {
      let invalid;
      const seen = new Set();
      await pipeline(
        Readable.from([readRaw('payload.tar.br')]),
        createBrotliDecompress(),
        tar.extract({
          cwd: temporary,
          strict: true,
          noMtime: true,
          filter(relative, entry) {
            if (
              entry.type !== 'File' ||
              !Object.hasOwn(sorted, relative) ||
              path.isAbsolute(relative) ||
              relative.split(/[\\/]/).includes('..') ||
              seen.has(relative)
            ) {
              invalid = relative;
              return false;
            }
            seen.add(relative);
            return true;
          },
        }),
      );
      if (invalid !== undefined) throw new Error('Invalid Harness payload entry: ' + invalid);
    }
    const read = (relative) =>
      compressed ? fsp.readFile(path.join(temporary, relative)) : readRaw(relative);
    for (const [relative, expected] of Object.entries(sorted)) {
      if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..'))
        throw new Error('Unsafe Harness manifest path');
      if (
        createHash('sha256')
          .update(await read(relative))
          .digest('hex') !== expected
      )
        throw new Error('Harness packaged file corrupted: ' + relative);
    }
    const node = path.join(temporary, path.basename(manifest.node));
    if (!compressed || path.normalize(manifest.node) !== path.basename(manifest.node))
      await fsp.writeFile(node, await read(manifest.node));
    if (process.platform !== 'win32') await fsp.chmod(node, 0o755);
    const check = spawnSync(
      node,
      [
        '-e',
        'process.stdout.write(JSON.stringify({nodeVersion:process.version,platform:process.platform,arch:process.arch}))',
      ],
      {
        cwd: temporary,
        encoding: 'utf8',
        windowsHide: true,
        timeout: 10000,
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      },
    );
    if (check.status !== 0) throw new Error('Bundled Harness Node cannot start');
    const actual = JSON.parse(check.stdout);
    for (const key of ['nodeVersion', 'platform', 'arch'])
      if (actual[key] !== manifest[key]) throw new Error('Bundled Harness Node mismatch: ' + key);
  } finally {
    await fsp.rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
};

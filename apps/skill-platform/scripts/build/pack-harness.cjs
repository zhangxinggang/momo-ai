const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const { constants } = require('node:zlib');
const tar = require('tar');

const storageFormat = 'brotli-tar-v1';

const appRoot = path.join(__dirname, '../..');
const source = path.join(appRoot, '../../packages/momo-harness-runner/dist');
const destination = path.join(appRoot, 'dist/runtime/harness-builtin.asar');

function loadAsar() {
  // electron-builder already owns the matching ASAR writer. Resolve it from the
  // builder package so the application does not ship a build-only dependency.
  const builderRequire = createRequire(require.resolve('electron-builder'));
  return builderRequire('@electron/asar');
}

async function packHarness(
  sourceDir = source,
  archivePath = destination,
  { compressed = true, quality = 10 } = {},
) {
  const manifest = JSON.parse(await fs.readFile(path.join(sourceDir, 'runtime.json'), 'utf8'));
  if (manifest.runtimeId !== 'deepseek-harness' || !manifest.bundleId) {
    throw new Error('Harness runtime manifest is invalid');
  }

  const asar = loadAsar();
  await fs.mkdir(path.dirname(archivePath), { recursive: true });
  try {
    const archivedManifest = JSON.parse(
      asar.extractFile(archivePath, 'runtime.json').toString('utf8'),
    );
    const storage = JSON.parse(asar.extractFile(archivePath, 'storage.json').toString('utf8'));
    if (
      archivedManifest.bundleId === manifest.bundleId &&
      storage.format === (compressed ? storageFormat : 'raw-v1') &&
      (!compressed || storage.quality === quality)
    ) {
      const size = (await fs.stat(archivePath)).size;
      console.log(
        `[pack-harness] reuse ${manifest.bundleId} (${(size / 1024 / 1024).toFixed(1)} MiB)`,
      );
      return { archivePath, manifest };
    }
  } catch {
    // A missing, incomplete, or stale archive is replaced below.
  }
  // A solid tar/Brotli payload shares its dictionary across files and avoids
  // thousands of ASAR headers. Decode directly into the existing runtime cache.
  const staging = await fs.mkdtemp(path.join(path.dirname(archivePath), 'harness-storage-'));
  const temporaryArchive = staging + '.asar';
  try {
    const relatives = Object.keys(manifest.files);
    for (const relative of relatives) {
      if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..'))
        throw new Error('Unsafe Harness manifest path');
      if (!(await fs.lstat(path.join(sourceDir, relative))).isFile())
        throw new Error('Harness payload must contain regular files: ' + relative);
    }
    if (compressed) {
      await tar.create(
        {
          cwd: sourceDir,
          file: path.join(staging, 'payload.tar.br'),
          portable: true,
          noMtime: true,
          strict: true,
          brotli: { params: { [constants.BROTLI_PARAM_QUALITY]: quality } },
        },
        relatives,
      );
    } else {
      for (const relative of relatives) {
        const target = path.join(staging, relative);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(path.join(sourceDir, relative), target);
      }
    }
    await fs.copyFile(path.join(sourceDir, 'runtime.json'), path.join(staging, 'runtime.json'));
    await fs.writeFile(
      path.join(staging, 'storage.json'),
      JSON.stringify({
        format: compressed ? storageFormat : 'raw-v1',
        ...(compressed ? { quality } : {}),
      }),
    );
    await asar.createPackageFromFiles(
      staging,
      temporaryArchive,
      [...(compressed ? ['payload.tar.br'] : relatives), 'runtime.json', 'storage.json'].map(
        (relative) => path.join(staging, relative),
      ),
    );
    await fs.rename(temporaryArchive, archivePath);
    asar.uncache(archivePath);
  } finally {
    await fs.rm(staging, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    await fs.rm(temporaryArchive, { force: true });
  }
  const size = (await fs.stat(archivePath)).size;
  console.log(
    `[pack-harness] ${manifest.bundleId} -> ${archivePath} (${(size / 1024 / 1024).toFixed(1)} MiB)`,
  );
  return { archivePath, manifest };
}

module.exports = { loadAsar, packHarness };

if (require.main === module) {
  const { prepareHarness } = require('./prepare-harness.cjs');
  prepareHarness(source, path.join(appRoot, 'dist/runtime/harness-production'))
    .then(async ({ staging }) => {
      await require('./verify-harness-runtime.cjs')(staging);
      return packHarness(staging);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

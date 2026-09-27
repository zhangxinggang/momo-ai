const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');

async function probe(resources) {
  const appRequire = createRequire(path.join(resources, 'app.asar/package.json'));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-native-probe-'));
  const Module = require('node:module');
  const originalResolve = Module._resolveFilename;
  const asarRoot = path.join(resources, 'app.asar') + path.sep;
  const nativeRoot = path.join(resources, 'native') + path.sep;
  // A build inside the checkout must not accidentally resolve missing packaged
  // dependencies from the developer's ancestor node_modules directories.
  Module._resolveFilename = function (request, parent, ...options) {
    const resolved = originalResolve.call(this, request, parent, ...options);
    if (parent?.filename.startsWith(asarRoot) && path.isAbsolute(resolved)) {
      assert.ok(
        resolved.startsWith(asarRoot) || resolved.startsWith(nativeRoot),
        `Dependency escaped app.asar: ${request} -> ${resolved}`,
      );
    }
    return resolved;
  };
  function loadNative(name, platformPackage, filename, version) {
    const original = Module._load;
    Module._load = function (request, parent, isMain) {
      if (request === platformPackage)
        return original.call(this, path.join(resources, 'native', filename), parent, isMain);
      if (request === `${platformPackage}/package.json`) return { version };
      return original.call(this, request, parent, isMain);
    };
    try {
      return appRequire(name);
    } finally {
      Module._load = original;
    }
  }
  try {
    const Database = appRequire('better-sqlite3');
    const db = new Database(':memory:', {
      nativeBinding: path.join(
        resources,
        'native/better-sqlite3-v12.9.0-electron-v140-win32-x64.node',
      ),
    });
    try {
      db.exec('CREATE TABLE probe (value TEXT)');
      db.prepare('INSERT INTO probe VALUES (?)').run('sqlite-ok');
      assert.equal(db.prepare('SELECT value FROM probe').get().value, 'sqlite-ok');
    } finally {
      db.close();
    }
    assert.equal(typeof appRequire('typeorm').DataSource, 'function');
    assert.equal(typeof appRequire('log4js').getLogger, 'function');
    const lance = loadNative(
      '@lancedb/lancedb',
      '@lancedb/lancedb-win32-x64-msvc',
      'lancedb.win32-x64-msvc.node',
      '0.22.3',
    );
    const connection = await lance.connect(path.join(temporary, 'lance'));
    try {
      const table = await connection.createTable('probe', [{ id: 1, vector: [1, 0, 0] }]);
      try {
        assert.equal((await table.vectorSearch([1, 0, 0]).limit(1).toArray())[0].id, 1);
      } finally {
        table.close();
      }
    } finally {
      connection.close();
    }
    const xberg = loadNative(
      '@xberg-io/xberg',
      '@xberg-io/xberg-win32-x64-msvc',
      'xberg-node.win32-x64-msvc.node',
      '1.0.7',
    );
    const result = await xberg.extract({
      kind: 'bytes',
      bytes: Buffer.from('<h1>native-ok</h1>'),
      mimeType: 'text/html',
      filename: 'probe.html',
    });
    assert.ok(result.results?.[0]?.content?.includes('native-ok'), JSON.stringify(result.errors));
    console.log(
      '[verify-app-runtime] SQLite, TypeORM, log4js, LanceDB vector search and Xberg extraction passed',
    );
  } finally {
    Module._resolveFilename = originalResolve;
    // Only the probe's own mkdtemp directory is removed.
    await fs.rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

module.exports = async function verifyAppRuntime(context) {
  if (context.electronPlatformName !== 'win32') return;
  const executable = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`,
  );
  const result = spawnSync(executable, [__filename, path.join(context.appOutDir, 'resources')], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    encoding: 'utf8',
    windowsHide: true,
    timeout: 30000,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `Packaged runtime check failed: ${result.error || result.stderr || result.stdout}`,
    );
  console.log(result.stdout.trim());
};

if (require.main === module)
  probe(path.resolve(process.argv[2])).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

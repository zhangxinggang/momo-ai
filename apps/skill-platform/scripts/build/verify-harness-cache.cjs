const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');

// Exercise the production materializer with Electron's actual ASAR fs layer,
// then start the decoded CLI outside the checkout (no developer dependencies).
module.exports = async function verifyHarnessCache(context) {
  if (context.electronPlatformName !== 'win32') return;
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-harness-cache-probe-'));
  try {
    const materializer = path.join(temporary, 'materializer.cjs');
    const build = createRequire(require.resolve('vite'))('esbuild');
    await build.build({
      entryPoints: [path.join(__dirname, '../../src/main/agent-runtime/supervisor/bundles.ts')],
      outfile: materializer,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
    });
    const script = path.join(temporary, 'probe.cjs');
    await fs.writeFile(
      script,
      `
      const { materializeBuiltinBundle } = require('./materializer.cjs');
      (async () => {
        const start = Date.now();
        const root = await materializeBuiltinBundle(process.argv[2], process.argv[3]);
        const coldMs = Date.now() - start;
        const warmStart = Date.now();
        if (await materializeBuiltinBundle(process.argv[2], process.argv[3]) !== root)
          throw new Error('Cache identity changed');
        console.log(JSON.stringify({ root, coldMs, warmMs: Date.now() - warmStart }));
      })().catch(error => { console.error(error); process.exitCode = 1; });
    `,
    );
    const executable = path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.exe`,
    );
    const result = spawnSync(
      executable,
      [
        script,
        path.join(context.appOutDir, 'resources/harness-builtin.asar'),
        path.join(temporary, 'cache'),
      ],
      {
        cwd: temporary,
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
        encoding: 'utf8',
        windowsHide: true,
        timeout: 90000,
      },
    );
    if (result.error || result.status !== 0)
      throw new Error(
        `Harness cache check failed: ${result.error || result.stderr || result.stdout}`,
      );
    const report = JSON.parse(result.stdout.trim());
    await require('./verify-harness-runtime.cjs')(report.root);
    console.log(
      `[verify-harness-cache] ASAR decode, SHA-256 and real CLI passed; cold ${report.coldMs} ms, warm ${report.warmMs} ms`,
    );
  } finally {
    // Only this invocation's mkdtemp directory is removed.
    await fs.rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
};

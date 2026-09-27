const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

// Run the actual profile after pruning/minification, before accepting its ASAR.
module.exports = async function verifyHarnessRuntime(bundle) {
  const manifest = JSON.parse(await fs.readFile(path.join(bundle, 'runtime.json'), 'utf8'));
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-production-probe-'));
  let child;
  try {
    const profile = path.join(home, 'profiles/momo');
    await fs.cp(path.join(bundle, 'profile'), profile, { recursive: true });
    const patch = path.join(profile, 'cordis.patch.yml');
    await fs.writeFile(
      patch,
      (await fs.readFile(patch, 'utf8'))
        .replace(
          "'__MOMO_BRIDGE_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-host-bridge/index.mjs')),
        )
        .replace(
          "'__MOMO_CREDENTIAL_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-model-credentials/index.mjs')),
        ),
    );
    await new Promise((resolve, reject) => {
      let buffer = '',
        errors = '',
        described = false,
        listed = false;
      const timer = setTimeout(
        () => finish(new Error('Harness production probe timed out')),
        30000,
      );
      const finish = (error) => {
        clearTimeout(timer);
        error ? reject(new Error(`${error.message}\n${errors.slice(-4000)}`)) : resolve();
      };
      child = spawn(
        path.join(bundle, manifest.node),
        [path.join(bundle, manifest.entry), '--profile', 'momo'],
        {
          cwd: bundle,
          windowsHide: true,
          env: {
            ...process.env,
            DSH_HOME: home,
            MOMO_SESSION_ROOT: path.join(home, 'sessions'),
            MOMO_BUNDLE_ID: manifest.bundleId,
            MOMO_CORE_VERSION: manifest.coreVersion,
          },
        },
      );
      child.on('error', finish);
      child.stderr.on('data', (data) => {
        errors += data;
      });
      child.stdin.on('error', finish);
      const send = (method) => child.stdin.write(JSON.stringify({ id: method, method }) + '\n');
      child.stdout.on('data', (data) => {
        buffer += data;
        let end;
        while ((end = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, end);
          buffer = buffer.slice(end + 1);
          let frame;
          try {
            frame = JSON.parse(line);
          } catch {
            finish(new Error('Invalid Harness output: ' + line));
            return;
          }
          if (frame.error) {
            finish(new Error(JSON.stringify(frame.error)));
            return;
          }
          if (frame.id === 'describe') {
            described = true;
            send('listAgents');
          }
          if (frame.id === 'listAgents') {
            listed = true;
            send('shutdown');
          }
        }
      });
      child.on('close', (code) =>
        finish(
          code === 0 && described && listed
            ? null
            : new Error('Harness production probe exited: ' + code),
        ),
      );
      send('describe');
    });
    console.log(
      '[verify-harness-runtime] production CLI/profile started and shut down successfully',
    );
  } catch (error) {
    const logs = await fs.readdir(path.join(home, 'logs')).catch(() => []);
    for (const file of logs.filter(
      (name) => name.startsWith('startup-') && name.endsWith('.log'),
    )) {
      error.message += '\n' + (await fs.readFile(path.join(home, 'logs', file), 'utf8'));
    }
    throw error;
  } finally {
    if (child && child.exitCode === null) {
      const closed = new Promise((resolve) => child.once('close', resolve));
      child.kill();
      await closed;
    }
    // home was created by mkdtemp above, never supplied by a caller.
    await fs.rm(home, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
};

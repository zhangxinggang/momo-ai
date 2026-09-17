import { HarnessProcess } from '@momo/harness-adapter';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { probeRuntime } from './probe';
describe('official dsh process contract (keyless)', () => {
  it('streams, dispatches, asks, reviews plans, cancels, and resumes the native journal', async () => {
    const bundle = path.resolve('../../packages/momo-harness-runner/dist');
    const home = path.resolve('../../temp/harness-contract-' + randomUUID());
    const profile = path.join(home, 'profiles/momo');
    await fs.mkdir(profile, { recursive: true });
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
    const report = await probeRuntime(
      async () =>
        new HarnessProcess(
          path.join(bundle, process.platform === 'win32' ? 'node.exe' : 'node'),
          path.join(bundle, 'node_modules/@deepseek-ai/dsh/lib/bin.js'),
          {
            cwd: bundle,
            env: {
              DSH_HOME: home,
              MOMO_SESSION_ROOT: path.join(home, 'sessions'),
              MOMO_PRESET_ROOT: path.join(bundle, 'profile/agent-presets'),
              MOMO_BUNDLE_ID: 'contract-test',
              MOMO_CORE_VERSION: '0.1.6-alpha.2',
            },
          },
        ),
    );
    expect(report.checks).toContain('native-resume');
    expect(report.requests).toBeGreaterThan(8);
    await fs.writeFile(path.join(home, 'contract-report.json'), JSON.stringify(report, null, 2));
  }, 120000);
});

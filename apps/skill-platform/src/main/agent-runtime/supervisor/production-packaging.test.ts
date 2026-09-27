import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  prepareHarness,
  selectPackages,
  keepFile,
} = require('../../../../scripts/build/prepare-harness.cjs');
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');

describe('production Harness dependency boundary', () => {
  let home: string, root: string;
  async function write(relative: string, content: string) {
    const file = path.join(root, relative);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content);
  }
  async function pkg(name: string, extra = {}) {
    await write(
      `node_modules/${name}/package.json`,
      JSON.stringify({ name, version: '1.0.0', ...extra }),
    );
  }
  beforeEach(async () => {
    home = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-production-test-'));
    root = path.join(home, 'source');
    await write('package.json', JSON.stringify({ dependencies: { '@deepseek-ai/dsh': '1.0.0' } }));
    await write('profile/cordis.patch.yml', "- insert:\n    - name: '@fixture/plugin'\n");
    await write('plugins/host/index.mjs', "import 'credentials';\n");
    await pkg('@deepseek-ai/dsh', { dependencies: { 'unused-ui': '1', boot: '1' } });
    await write(
      'node_modules/@deepseek-ai/dsh/lib/bin.js',
      "import 'boot'; import('./chunk.js');\n",
    );
    await write('node_modules/@deepseek-ai/dsh/lib/chunk.js', "import 'node:fs';\n");
    await pkg('boot', { dependencies: { shared: '1' } });
    await pkg('shared');
    await pkg('credentials');
    await pkg('@fixture/plugin', {
      dependencies: { shared: '2' },
      peerDependencies: { peer: '1' },
      optionalDependencies: { 'foreign-native': '1' },
    });
    await pkg('@fixture/plugin/node_modules/shared');
    await pkg('peer');
    await pkg('unused-ui');
  });
  afterEach(async () => {
    await fs.rm(home, { recursive: true, force: true });
  });

  it('retains CLI imports, profile and bridge dependencies, nested versions and peers', async () => {
    const selected = [...(await selectPackages(root)).keys()].map((file: string) =>
      path.relative(root, file).replaceAll('\\', '/'),
    );
    expect(selected).toContain('node_modules/@fixture/plugin/node_modules/shared');
    expect(selected).toContain('node_modules/peer');
    expect(selected).toContain('node_modules/credentials');
    expect(selected).toContain('node_modules/shared');
    expect(selected).not.toContain('node_modules/unused-ui');
  });

  it('fails when a required peer is absent or the upstream CLI adds an opaque dynamic import', async () => {
    await write('node_modules/peer/package.json', '{"dependencies":{"missing":"1"}}');
    await expect(selectPackages(root)).rejects.toThrow('Missing Harness dependency missing');
    await pkg('peer');
    await write('node_modules/@deepseek-ai/dsh/lib/bin.js', 'import(process.env.PLUGIN);');
    await expect(selectPackages(root)).rejects.toThrow('Unaudited dynamic Harness import');
  });

  it('re-hashes minified files, keeps legal/runtime assets, and leaves the source intact', async () => {
    await write(
      'node_modules/boot/index.js',
      '/*! license fixture */\nmodule.exports = class RuntimeService {};\n',
    );
    await write('node_modules/boot/index.js.map', '{}');
    await write('node_modules/boot/index.d.ts', 'export {};');
    await write('node_modules/boot/LICENSE', 'license text');
    await write('node_modules/boot/template.md', '# runtime prompt');
    const files: Record<string, string> = {};
    async function collect(directory: string) {
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) await collect(file);
        else files[path.relative(root, file).replaceAll('\\', '/')] = hash(await fs.readFile(file));
      }
    }
    await collect(root);
    await write(
      'runtime.json',
      JSON.stringify({ files, coreVersion: 'test', platform: 'win32', arch: 'x64' }),
    );
    const { staging, manifest } = await prepareHarness(root, path.join(home, 'harness-production'));
    expect(manifest.files['node_modules/boot/index.js.map']).toBeUndefined();
    expect(manifest.files['node_modules/boot/index.d.ts']).toBeUndefined();
    expect(manifest.files['node_modules/boot/LICENSE']).toBe(files['node_modules/boot/LICENSE']);
    expect(manifest.files['node_modules/boot/template.md']).toBe(
      files['node_modules/boot/template.md'],
    );
    expect(require(path.join(staging, 'node_modules/boot/index.js')).name).toBe('RuntimeService');
    const carrier = JSON.parse(
      await fs.readFile(path.join(staging, 'node_modules/@deepseek-ai/dsh/package.json'), 'utf8'),
    );
    expect(carrier.dependencies['@fixture/plugin']).toBe('1.0.0');
    expect(carrier.dependencies.credentials).toBe('1.0.0');
    expect(carrier.dependencies['unused-ui']).toBeUndefined();
    for (const [relative, expected] of Object.entries(manifest.files)) {
      expect(hash(await fs.readFile(path.join(staging, relative)))).toBe(expected);
    }
    expect(await fs.readFile(path.join(root, 'node_modules/boot/index.js.map'), 'utf8')).toBe('{}');
    await write('plugins/host/index.mjs', "import 'credentials'; // corrupted");
    await expect(prepareHarness(root, path.join(home, 'harness-production'))).rejects.toThrow(
      'Harness source corrupted',
    );
  });

  it('keeps target native binaries, runtime TypeScript and licenses while omitting debug artifacts', () => {
    for (const file of [
      'node_modules/a/runtime.ts',
      'node_modules/a/LICENSE.md',
      'node_modules/node-pty/prebuilds/win32-x64/conpty.node',
    ]) {
      expect(keepFile(file, 'win32', 'x64')).toBe(true);
    }
    for (const file of [
      'node_modules/a/index.d.mts',
      'node_modules/a/index.js.map',
      'node_modules/a/debug.pdb',
      'node_modules/node-pty/prebuilds/win32-arm64/conpty.node',
    ]) {
      expect(keepFile(file, 'win32', 'x64')).toBe(false);
    }
  });
});

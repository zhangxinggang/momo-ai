import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof import('fs/promises')>();
  return { ...original, readdir: vi.fn(original.readdir) };
});

vi.mock('../../../runtime-paths', () => ({
  getSkillsDir: () => process.cwd(),
}));

import {
  listLocalRepoDirectoryByPath,
  readLocalRepoFileByPath,
  readLocalRepoFilesByPath,
  searchLocalRepoFilesByPath,
} from './repo';

describe('lazy repo file listing', () => {
  let repoPath = '';

  beforeEach(async () => {
    repoPath = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-file-tree-'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (repoPath) {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });

  it('reads unfamiliar text extensions and keeps binary content out of text editing', async () => {
    await fs.writeFile(path.join(repoPath, 'server.log'), 'INFO 服务启动\n');
    await fs.writeFile(path.join(repoPath, 'custom.data'), 'name=value\n');
    await fs.writeFile(path.join(repoPath, 'binary.txt'), new Uint8Array([65, 0, 66]));
    expect((await readLocalRepoFileByPath(repoPath, 'server.log'))?.content).toBe(
      'INFO 服务启动\n',
    );
    expect((await readLocalRepoFileByPath(repoPath, 'custom.data'))?.content).toBe('name=value\n');
    expect((await readLocalRepoFileByPath(repoPath, 'binary.txt'))?.content).toBe('[binary file]');
  });

  it('continues reading when an optional file disappears after directory listing', async () => {
    const agentsPath = path.join(repoPath, 'agents');
    await fs.mkdir(agentsPath);
    await fs.writeFile(path.join(repoPath, 'SKILL.md'), '# skill');
    await fs.writeFile(path.join(agentsPath, 'openai.yaml'), 'name: test');
    const { readdir } = await vi.importActual<typeof import('fs/promises')>('fs/promises');
    vi.spyOn(fs, 'readdir').mockImplementation((async (...args: Parameters<typeof fs.readdir>) => {
      const entries = await readdir(...args);
      if (String(args[0]) === agentsPath) await fs.unlink(path.join(agentsPath, 'openai.yaml'));
      return entries;
    }) as typeof fs.readdir);
    const files = await readLocalRepoFilesByPath(repoPath);
    expect(files.find((file) => file.path === 'SKILL.md')?.content).toBe('# skill');
    expect(files.some((file) => file.path.endsWith('openai.yaml'))).toBe(false);
  });

  it('lists only direct children of the requested directory', async () => {
    await fs.mkdir(path.join(repoPath, 'src', 'nested'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'node_modules', 'package'), { recursive: true });
    await fs.writeFile(path.join(repoPath, 'README.md'), 'readme');
    await fs.writeFile(path.join(repoPath, 'src', 'index.ts'), 'export {};');

    const rootEntries = await listLocalRepoDirectoryByPath(repoPath);
    expect(rootEntries.map((entry) => entry.path)).toEqual(['node_modules', 'src', 'README.md']);

    const sourceEntries = await listLocalRepoDirectoryByPath(repoPath, 'src');
    expect(sourceEntries.map((entry) => entry.path)).toEqual([
      path.join('src', 'nested'),
      path.join('src', 'index.ts'),
    ]);
  });

  it('searches unopened directories and skips generated dependency folders', async () => {
    await fs.mkdir(path.join(repoPath, 'src', 'deep'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'node_modules', 'package'), { recursive: true });
    await fs.mkdir(path.join(repoPath, '.pnpm-store', 'package'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'dist'), { recursive: true });
    await fs.writeFile(path.join(repoPath, 'src', 'deep', 'needle.ts'), 'export {};');
    await fs.writeFile(path.join(repoPath, 'node_modules', 'package', 'needle.js'), '');
    await fs.writeFile(path.join(repoPath, '.pnpm-store', 'package', 'needle.js'), '');
    await fs.writeFile(path.join(repoPath, 'dist', 'needle.js'), '');

    const results = await searchLocalRepoFilesByPath(repoPath, 'needle');
    expect(results.map((entry) => entry.path)).toEqual([path.join('src', 'deep', 'needle.ts')]);
  });
});

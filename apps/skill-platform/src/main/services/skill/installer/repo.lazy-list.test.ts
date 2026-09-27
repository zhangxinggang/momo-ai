import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../runtime-paths', () => ({
  getSkillsDir: () => process.cwd(),
}));

import { listLocalRepoDirectoryByPath, searchLocalRepoFilesByPath } from './repo';

describe('lazy repo file listing', () => {
  let repoPath = '';

  beforeEach(async () => {
    repoPath = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-file-tree-'));
  });

  afterEach(async () => {
    if (repoPath) {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
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

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeWorkspaceFile } from './workspace-files';

describe('confined workspace writes', () => {
  let root: string;
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-workspace-write-'));
  });
  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });
  it('creates and updates files with the correct UTF-8 byte count', async () => {
    expect(await writeWorkspaceFile([root], 'note.md', '目标')).toEqual({
      path: 'note.md',
      bytes: 6,
    });
    await writeWorkspaceFile([root], path.join(root, 'note.md'), 'updated');
    expect(await fs.readFile(path.join(root, 'note.md'), 'utf8')).toBe('updated');
  });
  it('rejects relative and absolute paths outside the workspace', async () => {
    await expect(writeWorkspaceFile([root], '../escape.md', 'bad')).rejects.toThrow('不属于');
    await expect(
      writeWorkspaceFile([root], path.join(root, '..', 'escape.md'), 'bad'),
    ).rejects.toThrow('不属于');
  });
  it('rejects linked parent directories before writing', async () => {
    const real = path.join(root, 'real');
    await fs.mkdir(real);
    await fs.symlink(
      real,
      path.join(root, 'linked'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await expect(writeWorkspaceFile([root], 'linked/note.md', 'bad')).rejects.toThrow('SYMLINK');
    expect(await fs.readdir(real)).toEqual([]);
  });
});

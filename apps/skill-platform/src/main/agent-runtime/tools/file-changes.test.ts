import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { testStore } from '../persistence/test-store';
import { WorkspaceFileChanges } from './file-changes';
import * as snapshots from './workspace-snapshot';

let root: string;
let store: ReturnType<typeof testStore>;
let changes: WorkspaceFileChanges;
let filename: string;
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-file-review-'));
  store = testStore();
  changes = new WorkspaceFileChanges(store);
  filename = path.join(root, 'note.txt');
});
afterEach(async () => {
  vi.restoreAllMocks();
  store.db.close();
  await fs.rm(root, { recursive: true, force: true });
});
it('combines repeated writes into one file record and restores the first actual content', async () => {
  await fs.writeFile(filename, 'already modified by user\na=1\nb=1\n');
  await changes.write('run', [root], filename, 'already modified by user\na=2\nb=1\n');
  await changes.write('run', [root], filename, 'already modified by user\na=2\nb=2\n');
  expect(changes.list('run').files).toHaveLength(1);
  expect((await changes.review('run', filename)).before).toBe(
    'already modified by user\na=1\nb=1\n',
  );
  await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('already modified by user\na=1\nb=1\n');
  expect(changes.list('run').files[0].status).toBe('undone');
});
it('preserves corrections and rejects stale saves', async () => {
  await fs.writeFile(filename, 'a=1\nb=1\n');
  await changes.write('run', [root], filename, 'a=2\nb=2\n');
  const review = await changes.review('run', filename);
  await changes.correct('run', filename, 'a=42\nb=2\n', review.revision);
  await expect(changes.correct('run', filename, 'bad', review.revision)).rejects.toThrow(
    '其他地方',
  );
  const result = await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('a=42\nb=1\n');
  expect(result.preserved).toBeGreaterThan(0);
});
it('protects manual corrections changed back to the same AI value', async () => {
  await fs.writeFile(filename, 'a=1\nb=1\n');
  await changes.write('run', [root], filename, 'a=2\nb=2\n');
  let review = await changes.review('run', filename);
  review = await changes.correct('run', filename, 'a=3\nb=2\n', review.revision);
  await changes.correct('run', filename, 'a=2\nb=2\n', review.revision);
  await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('a=2\nb=1\n');
});
it('preserves user changes made between two AI writes', async () => {
  await fs.writeFile(filename, 'a=1\nb=1\n');
  await changes.write('run', [root], filename, 'a=2\nb=1\n');
  await fs.writeFile(filename, 'a=42\nb=1\n');
  await changes.write('run', [root], filename, 'a=42\nb=2\n');
  await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('a=42\nb=1\n');
});
it('removes untouched new files but preserves user-modified new files', async () => {
  await changes.write('run', [root], filename, 'hello');
  await changes.undo('run');
  await expect(fs.stat(filename)).rejects.toMatchObject({ code: 'ENOENT' });
  const next = path.join(root, 'next.txt');
  await changes.write('run', [root], next, 'hello');
  await fs.writeFile(next, 'hello user');
  await changes.undo('run');
  expect(await fs.readFile(next, 'utf8')).toBe('hello user');
});
it('accepts pending changes when the conversation continues and makes undo idempotent', async () => {
  await fs.writeFile(filename, 'a=1');
  await changes.write('run', [root], filename, 'a=2');
  changes.acceptSession('session');
  expect(changes.list('run').files[0].status).toBe('accepted');
  expect((await changes.undo('run')).reverted).toBe(0);
  expect(await fs.readFile(filename, 'utf8')).toBe('a=2');
});
it('tracks files created, edited and deleted by execution tools, including a failed tool', async () => {
  await fs.writeFile(filename, 'a=1');
  await expect(
    changes.observeExecution('run', [root], async () => {
      await fs.writeFile(filename, 'a=2');
      await fs.writeFile(path.join(root, 'created.txt'), 'new');
      throw new Error('tool failed after writing');
    }),
  ).rejects.toThrow('tool failed');
  expect(changes.list('run').files).toHaveLength(2);
  await changes.observeExecution('run', [root], async () => {
    await fs.unlink(filename);
  });
  await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('a=1');
});
it('rejects traversal, symlink targets, and unrelated review paths', async () => {
  await expect(changes.write('run', [root], '../outside.txt', 'bad')).rejects.toThrow('不属于');
  await expect(changes.review('run', filename)).rejects.toThrow('不属于本轮');
});

it('reviews and restores a file whose parent directory was deleted by the tool', async () => {
  const directory = path.join(root, 'nested');
  await fs.mkdir(directory);
  const target = path.join(directory, 'a.txt');
  await fs.writeFile(target, 'original');
  await changes.observeExecution('run', [root], async () => {
    await fs.unlink(target);
    await fs.rmdir(directory);
  });
  expect(await changes.review('run', target)).toMatchObject({
    before: 'original',
    current: '',
    currentExists: false,
  });
  await changes.undo('run');
  expect(await fs.readFile(target, 'utf8')).toBe('original');
});

it('never starts a command after its pre-execution scan was cancelled', async () => {
  await fs.writeFile(filename, 'source');
  const controller = new AbortController();
  const open = fs.open.bind(fs);
  vi.spyOn(fs, 'open').mockImplementationOnce(async (...args) => {
    const file = await open(...args);
    controller.abort(new Error('scan timed out'));
    return file;
  });
  const execute = vi.fn();
  await expect(changes.observeExecution('run', [root], execute, controller.signal)).rejects.toThrow(
    'scan timed out',
  );
  expect(execute).not.toHaveBeenCalled();
  expect(changes.list('run').files).toEqual([]);
});

it('releases retained text on abort while the command RPC is still settling', async () => {
  await fs.writeFile(filename, 'source');
  const controller = new AbortController();
  const capture = vi.spyOn(snapshots, 'snapshotWorkspace');
  await expect(
    changes.observeExecution(
      'run',
      [root],
      async () => {
        const before = await capture.mock.results[0].value;
        expect(before.files.size).toBe(1);
        controller.abort(new Error('cancelled'));
        expect(before.files.size).toBe(0);
        expect(before.seen.size).toBe(0);
        return 'late result';
      },
      controller.signal,
    ),
  ).rejects.toThrow('cancelled');
  expect(capture).toHaveBeenCalledTimes(1);
});

it('does not misclassify files outside the snapshot budget as creations or deletions', async () => {
  const capture = snapshots.snapshotWorkspace;
  vi.spyOn(snapshots, 'snapshotWorkspace').mockImplementation((roots, read, signal) =>
    capture(roots, read, signal, { ...snapshots.SNAPSHOT_LIMITS, contentBytes: 20 }),
  );
  const first = path.join(root, 'a.txt'),
    second = path.join(root, 'b.txt');
  await fs.writeFile(first, 'original');
  await fs.writeFile(second, 'untracked content');
  await changes.observeExecution('run', [root], async () => {
    await fs.writeFile(first, 'changed');
    await fs.writeFile(second, 'ok');
    await fs.writeFile(path.join(root, 'c.txt'), 'new');
  });
  expect(changes.list('run').files.map((file) => file.path)).toEqual([first]);
  await changes.undo('run');
  expect(await fs.readFile(first, 'utf8')).toBe('original');
  expect(await fs.readFile(second, 'utf8')).toBe('ok');
  expect(await fs.readFile(path.join(root, 'c.txt'), 'utf8')).toBe('new');
});

it('does not treat a previously binary file as a new file and delete it on undo', async () => {
  await fs.writeFile(filename, Buffer.from([0, 1, 2]));
  await changes.observeExecution('run', [root], () => fs.writeFile(filename, 'now text'));
  expect(changes.list('run').files).toEqual([]);
  await changes.undo('run');
  expect(await fs.readFile(filename, 'utf8')).toBe('now text');
});

it('skips oversized files and keeps reviewing small files', async () => {
  const large = path.join(root, 'large.txt');
  const file = await fs.open(large, 'w');
  await file.truncate(64 * 1024 * 1024);
  await file.close();
  await fs.writeFile(filename, 'before');
  await changes.observeExecution('run', [root], () => fs.writeFile(filename, 'after'));
  expect(changes.list('run').files.map((item) => item.path)).toEqual([filename]);
});

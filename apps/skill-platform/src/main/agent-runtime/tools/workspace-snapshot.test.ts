import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SNAPSHOT_LIMITS, snapshotWorkspace } from './workspace-snapshot';

let root: string;
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-snapshot-'));
});
afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});
const read = (_root: string, file: string) => fs.readFile(file, 'utf8');

it('bounds retained text across files using UTF-16 memory size', async () => {
  for (let i = 0; i < 8; i++) await fs.writeFile(path.join(root, `${i}.txt`), '中文ab');
  const result = await snapshotWorkspace([root], read, undefined, {
    ...SNAPSHOT_LIMITS,
    contentBytes: 16,
  });
  expect(result.contentBytes).toBe(16);
  expect(result.files.size).toBe(2);
  expect(result.complete).toBe(false);
});

it('prunes generated trees and ASAR archives before reading their contents', async () => {
  for (const name of ['out', 'node_modules', '.venv', 'logs', 'app.asar', 'app.asar.unpacked']) {
    await fs.mkdir(path.join(root, name));
    await fs.writeFile(path.join(root, name, 'large.txt'), 'generated');
  }
  await fs.writeFile(path.join(root, 'code.ts'), 'source');
  const reader = vi.fn(read);
  const result = await snapshotWorkspace([root], reader);
  expect([...result.files.keys()]).toEqual([path.join(root, 'code.ts')]);
  expect(reader).toHaveBeenCalledTimes(1);
});

it('bounds directory traversal, depth and elapsed time', async () => {
  await fs.mkdir(path.join(root, 'nested'));
  await fs.writeFile(path.join(root, 'nested', 'code.ts'), 'source');
  for (const limit of [{ entries: 1 }, { depth: 0 }, { durationMs: 0 }]) {
    const reader = vi.fn(read);
    const result = await snapshotWorkspace([root], reader, undefined, {
      ...SNAPSHOT_LIMITS,
      ...limit,
    });
    expect(result.complete).toBe(false);
    expect(reader).not.toHaveBeenCalled();
  }
});

it('does not rescan duplicate or overlapping roots', async () => {
  const nested = path.join(root, 'nested');
  await fs.mkdir(nested);
  await fs.writeFile(path.join(nested, 'code.ts'), 'source');
  const reader = vi.fn(read);
  const result = await snapshotWorkspace([root, nested, root], reader);
  expect(result.files.size).toBe(1);
  expect(reader).toHaveBeenCalledTimes(1);
});

it('stops an in-flight scan at cancellation and closes its directory iterator', async () => {
  await fs.writeFile(path.join(root, 'a.txt'), 'a');
  await fs.writeFile(path.join(root, 'b.txt'), 'b');
  const controller = new AbortController();
  const reader = vi.fn(async () => {
    controller.abort(new Error('tool timed out'));
    return 'content';
  });
  await expect(snapshotWorkspace([root], reader, controller.signal)).rejects.toThrow(
    'tool timed out',
  );
  expect(reader).toHaveBeenCalledTimes(1);
  await fs.rm(root, { recursive: true, force: true });
});

it('marks inaccessible inventory incomplete but remembers unreadable files', async () => {
  const target = path.join(root, 'binary.dat');
  await fs.writeFile(target, Buffer.from([0]));
  const result = await snapshotWorkspace([root, path.join(root, 'missing')], async () => {
    throw new Error('not text');
  });
  expect(result.complete).toBe(false);
  expect(result.seen.has(target)).toBe(true);
  expect(result.files.size).toBe(0);
});

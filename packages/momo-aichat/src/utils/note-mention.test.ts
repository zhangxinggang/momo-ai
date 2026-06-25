import { describe, expect, it, vi } from 'vitest';

import type { INoteSnapshot } from '../types/chat';

import {
  NOTE_SNAPSHOT_MAX_CHARS,
  NOTE_SNAPSHOT_TRUNCATED_SUFFIX,
  buildNoteMentionToken,
  ensureNoteSnapshots,
  expandNoteMentionsWithSnapshots,
  truncateNoteContent,
} from './note-mention';

describe('truncateNoteContent', () => {
  it('短内容不截断', () => {
    const raw = 'hello world';
    const result = truncateNoteContent(raw);

    expect(result).toEqual({
      content: raw,
      isTruncated: false,
      originalLength: raw.length,
    });
  });

  it('超长内容截断并附加已截断提示', () => {
    const raw = 'x'.repeat(NOTE_SNAPSHOT_MAX_CHARS + 100);
    const result = truncateNoteContent(raw);

    expect(result.isTruncated).toBe(true);
    expect(result.originalLength).toBe(raw.length);
    expect(result.content).toBe('x'.repeat(NOTE_SNAPSHOT_MAX_CHARS) + NOTE_SNAPSHOT_TRUNCATED_SUFFIX);
    expect(result.content).toContain('已截断');
  });
});

describe('expandNoteMentionsWithSnapshots', () => {
  it('用快照块替换 token', () => {
    const path = 'notes/a.md';
    const token = buildNoteMentionToken(path);
    const content = `请查看 ${token} 内容`;
    const snapshots: Record<string, INoteSnapshot> = {
      [path]: {
        path,
        content: '笔记正文',
        snapshotAt: 1,
        isTruncated: false,
        originalLength: 4,
      },
    };

    const result = expandNoteMentionsWithSnapshots(content, snapshots);

    const block = [
      `--- 笔记: ${path} START ---`,
      '笔记正文',
      `--- 笔记: ${path} END ---`,
    ].join('\n');
    expect(result).toBe(`请查看 ${block} 内容`);
  });

  it('缺少快照时使用占位符', () => {
    const path = 'missing/b.md';
    const token = buildNoteMentionToken(path);
    const content = `引用 ${token}`;

    const result = expandNoteMentionsWithSnapshots(content, {});

    expect(result).toBe(`引用 [笔记 ${path} 未找到快照]`);
  });
});

describe('ensureNoteSnapshots', () => {
  it('仅读取尚未存在快照的路径', async () => {
    const existingPath = 'existing/a.md';
    const newPath = 'new/b.md';
    const existingSnapshot: INoteSnapshot = {
      path: existingPath,
      content: '已有快照',
      snapshotAt: 100,
      isTruncated: false,
      originalLength: 4,
    };
    const readContent = vi.fn(async (path: string) => {
      if (path === newPath) {
        return '新笔记内容';
      }
      throw new Error('不应读取已有快照路径');
    });

    const result = await ensureNoteSnapshots(
      [existingPath, newPath],
      { [existingPath]: existingSnapshot },
      readContent,
    );

    expect(readContent).toHaveBeenCalledTimes(1);
    expect(readContent).toHaveBeenCalledWith(newPath);
    expect(result[existingPath]).toEqual(existingSnapshot);
    expect(result[newPath]).toMatchObject({
      path: newPath,
      content: '新笔记内容',
      isTruncated: false,
      originalLength: 5,
    });
    expect(result[newPath]?.snapshotAt).toEqual(expect.any(Number));
  });

  it('读取失败时不写入快照', async () => {
    const failPath = 'fail/c.md';
    const readContent = vi.fn(async () => {
      throw new Error('读取失败');
    });

    const result = await ensureNoteSnapshots([failPath], {}, readContent);

    expect(readContent).toHaveBeenCalledWith(failPath);
    expect(result[failPath]).toBeUndefined();
    expect(Object.keys(result)).toHaveLength(0);
  });
});

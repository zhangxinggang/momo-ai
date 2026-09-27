import {
  lineChanges,
  mapProtectedRanges,
  textEdits,
  undoUntouched,
  type TextRange,
} from '@/shared/file-change-diff';
import type {
  WorkspaceChangeSet,
  WorkspaceFileReview,
  WorkspaceUndoResult,
} from '@momo/agent-contracts';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AgentStore } from '../persistence/store';
import { safeExistingPath } from '../supervisor/bundles';
import { resolveWorkspaceWriteTarget, writeWorkspaceFile } from './workspace-files';
import { snapshotWorkspace } from './workspace-snapshot';

interface FileRecord {
  root: string;
  path: string;
  relativePath: string;
  before: string | null;
  after: string | null;
  operations: Array<{ before: string | null; after: string | null }>;
  status: 'pending' | 'accepted' | 'undone';
  protectedContent?: string;
  protectedRanges?: TextRange[];
}
const revision = (content: string | null) =>
  createHash('sha256')
    .update(content === null ? 'missing' : 'file\0' + content)
    .digest('hex');

export class WorkspaceFileChanges {
  private locks = new Map<string, Promise<unknown>>();
  constructor(
    private store: AgentStore,
    private onChanged?: (runId: string, changes: WorkspaceChangeSet) => void,
  ) {}
  private async exclusive<T>(target: string, action: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(target) ?? Promise.resolve();
    const work = previous.catch(() => {}).then(action);
    this.locks.set(target, work);
    try {
      return await work;
    } finally {
      if (this.locks.get(target) === work) this.locks.delete(target);
    }
  }
  private records(runId: string): FileRecord[] {
    return (
      this.store.db
        .prepare('SELECT record FROM agent_file_changes WHERE run_id=? ORDER BY path')
        .all(runId) as Array<{ record: string }>
    ).map((row) => JSON.parse(row.record));
  }
  private save(runId: string, record: FileRecord) {
    this.store.db
      .prepare('INSERT OR REPLACE INTO agent_file_changes(run_id,path,record) VALUES (?,?,?)')
      .run(runId, record.path, JSON.stringify(record));
  }
  private changed(runId: string) {
    this.onChanged?.(runId, this.list(runId));
  }
  list(runId: string): WorkspaceChangeSet {
    return {
      runId,
      files: this.records(runId)
        .filter((record) => record.before !== record.after)
        .map((record) => {
          const { added, removed } = lineChanges(record.before ?? '', record.after ?? '');
          return {
            path: record.path,
            root: record.root,
            relativePath: record.relativePath,
            added,
            removed,
            kind:
              record.before === null ? 'created' : record.after === null ? 'deleted' : 'modified',
            status: record.status,
          };
        }),
    };
  }
  acceptSession(sessionId: string) {
    const rows = this.store.db
      .prepare('SELECT id FROM agent_runs WHERE session_id=?')
      .all(sessionId) as Array<{ id: string }>;
    for (const { id } of rows)
      for (const record of this.records(id)) {
        if (record.status !== 'pending') continue;
        record.status = 'accepted';
        this.save(id, record);
      }
  }
  private record(
    runId: string,
    root: string,
    filename: string,
    before: string | null,
    after: string | null,
  ) {
    if (before === after) return;
    const run = this.store.run(runId);
    if (!run) return;
    const prior = this.records(runId).find((record) => record.path === filename);
    const record: FileRecord = prior ?? {
      root,
      path: filename,
      relativePath: path.relative(root, filename).split(path.sep).join('/'),
      before,
      after,
      operations: [],
      status: 'pending',
    };
    const last = record.operations.at(-1);
    if (last && last.after === before) last.after = after;
    else record.operations.push({ before, after });
    record.after = after;
    const latest = this.store.db
      .prepare('SELECT id FROM agent_runs WHERE session_id=? ORDER BY rowid DESC LIMIT 1')
      .get(run.session_id) as { id: string } | undefined;
    if (latest && latest.id !== runId) record.status = 'accepted';
    this.save(runId, record);
    this.changed(runId);
  }
  /** Execution tools can also modify workspace text files, so compare around their invocation. */
  async observeExecution<T>(
    runId: string,
    roots: string[],
    execute: () => Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    const snapshot = () => snapshotWorkspace(roots, (root, file) => this.read(root, file), signal);
    const before = await snapshot();
    const release = () => {
      before.files.clear();
      before.seen.clear();
    };
    // Release retained text even if a cancelled RPC takes time to settle.
    signal?.addEventListener('abort', release, { once: true });
    try {
      signal?.throwIfAborted();
      try {
        return await execute();
      } finally {
        signal?.throwIfAborted();
        const after = await snapshot();
        if (!before.complete || !after.complete)
          console.warn('[workspace-review] 扫描达到预算或存在不可读目录，仅审阅已捕获的文本文件');
        for (const target of new Set([...before.files.keys(), ...after.files.keys()])) {
          signal?.throwIfAborted();
          const previous = before.files.get(target),
            next = after.files.get(target);
          // An incomplete baseline cannot prove that an untracked file is new.
          if (!previous && (!before.complete || before.seen.has(target))) continue;
          if (previous && !next) {
            const missing = await fs.lstat(target).then(
              () => false,
              (error: NodeJS.ErrnoException) => ['ENOENT', 'ENOTDIR'].includes(error.code ?? ''),
            );
            if (!missing) continue;
          }
          signal?.throwIfAborted();
          this.record(
            runId,
            (next ?? previous)!.root,
            target,
            previous?.content ?? null,
            next?.content ?? null,
          );
        }
      }
    } finally {
      signal?.removeEventListener('abort', release);
      release();
    }
  }
  async write(runId: string, roots: string[], filename: string, content: string) {
    const { target, root } = await resolveWorkspaceWriteTarget(roots, filename);
    return this.exclusive(target, async () => {
      const before = await this.read(root, target);
      const result = await writeWorkspaceFile(roots, filename, content);
      this.record(runId, root, target, before, content);
      return result;
    });
  }
  private async read(root: string, filename: string): Promise<string | null> {
    let target: string;
    try {
      target = (await resolveWorkspaceWriteTarget([root], filename)).target;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      // A deleted parent directory is also a missing file, not an unreadable review.
      return null;
    }
    const file = await fs.open(target, 'r').catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (file === null) return null;
    let buffer: Buffer;
    try {
      const size = (await file.stat()).size;
      if (size > 1024 * 1024) throw new Error('文件超过 1 MB，无法作为文本审阅');
      // One extra byte detects growth; never read an unbounded file before checking its size.
      buffer = Buffer.alloc(Math.min(size + 1, 1024 * 1024 + 1));
      let length = 0;
      while (length < buffer.length) {
        const { bytesRead } = await file.read(buffer, length, buffer.length - length, null);
        if (!bytesRead) break;
        length += bytesRead;
      }
      if (length > size) throw new Error('文件在读取期间发生修改，请重试');
      buffer = buffer.subarray(0, length);
    } finally {
      await file.close();
    }
    if (
      buffer.length > 1024 * 1024 ||
      buffer.includes(0) ||
      !Buffer.from(buffer.toString('utf8')).equals(buffer)
    )
      throw new Error('文件无法作为 UTF-8 文本审阅（超过 1 MB 或为二进制）');
    return buffer.toString('utf8');
  }
  private async restore(root: string, filename: string, content: string) {
    const relative = path.relative(root, filename);
    if (relative.split(/[\\/]/).includes('..') || path.isAbsolute(relative))
      throw new Error('路径不属于当前项目');
    let directory = root;
    for (const segment of path
      .dirname(relative)
      .split(/[\\/]/)
      .filter((part) => part && part !== '.')) {
      const next = path.join(directory, segment);
      await fs.mkdir(next).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'EEXIST') throw error;
      });
      directory = await safeExistingPath(root, path.relative(root, next));
    }
    return writeWorkspaceFile([root], filename, content);
  }
  private target(runId: string, filename: string) {
    const record = this.records(runId).find((record) => record.path === filename);
    if (!record) throw new Error('文件不属于本轮修改');
    return record;
  }
  async review(runId: string, filename: string): Promise<WorkspaceFileReview> {
    const record = this.target(runId, filename);
    const content = await this.read(record.root, record.path);
    return {
      path: record.path,
      before: record.before ?? '',
      current: content ?? '',
      currentExists: content !== null,
      revision: revision(content),
    };
  }
  async correct(
    runId: string,
    filename: string,
    content: string,
    expectedRevision: string,
  ): Promise<WorkspaceFileReview> {
    return this.exclusive(filename, async () => {
      const record = this.target(runId, filename);
      const before = await this.read(record.root, record.path);
      if (revision(before) !== expectedRevision)
        throw new Error('文件已在其他地方修改，请刷新后重新编辑');
      const previousRanges = mapProtectedRanges(
        record.protectedRanges ?? [],
        record.protectedContent ?? before ?? '',
        before ?? '',
      );
      const ranges = mapProtectedRanges(previousRanges, before ?? '', content);
      let shift = 0;
      for (const edit of textEdits(before ?? '', content)) {
        const from = edit.from + shift;
        ranges.push({ from, to: from + edit.insert.length });
        shift += edit.insert.length - (edit.to - edit.from);
      }
      await this.restore(record.root, record.path, content);
      record.protectedContent = content;
      record.protectedRanges = ranges;
      this.save(runId, record);
      this.changed(runId);
      return this.review(runId, filename);
    });
  }
  async undo(runId: string): Promise<WorkspaceUndoResult> {
    let reverted = 0,
      preserved = 0;
    for (const file of this.records(runId)) {
      if (file.status !== 'pending') continue;
      await this.exclusive(file.path, async () => {
        // Re-read inside the lock: a new turn or another undo may have accepted/settled it.
        const record = this.target(runId, file.path);
        if (record.status !== 'pending') return;
        const initial = await this.read(record.root, record.path);
        let current = initial;
        let ranges = mapProtectedRanges(
          record.protectedRanges ?? [],
          record.protectedContent ?? current ?? '',
          current ?? '',
        );
        for (const operation of [...record.operations].reverse()) {
          if (current === null) {
            if (operation.after === null) {
              current = operation.before;
              reverted++;
            } else preserved++;
            continue;
          }
          if (operation.before === null && current === operation.after && ranges.length === 0) {
            current = null;
            reverted++;
            continue;
          }
          const result = undoUntouched(
            operation.before ?? '',
            operation.after ?? '',
            current,
            ranges,
          );
          current = result.content;
          ranges = result.protectedRanges;
          reverted += result.reverted;
          preserved += result.skipped;
        }
        // Reject a concurrent external write instead of overwriting its content.
        if (revision(await this.read(record.root, record.path)) !== revision(initial))
          throw new Error('文件在撤销期间发生修改，请重试');
        if (current !== initial) {
          if (current === null)
            await fs.unlink(await safeExistingPath(record.root, record.relativePath));
          else await this.restore(record.root, record.path, current);
        }
        record.status = 'undone';
        this.save(runId, record);
      });
      this.changed(runId);
    }
    this.changed(runId);
    return { reverted, preserved, changes: this.list(runId) };
  }
}

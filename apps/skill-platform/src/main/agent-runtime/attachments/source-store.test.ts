import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AgentStore } from '../persistence/store';
import { testStore } from '../persistence/test-store';
import { ArtifactStore } from './artifact-store';
import { AgentSourceStore } from './source-store';
describe('host facts and original sources', () => {
  it('stores original bytes separately from derived text and trusts canonical encoding', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-sources-')),
      store = testStore();
    try {
      const sources = new AgentSourceStore(store, root),
        bytes = Buffer.from([0, 255, 128, 42]);
      const ref = await sources.save({
        name: 'test.bin',
        mimeType: 'application/octet-stream',
        encoding: 'base64',
        content: bytes.toString('base64'),
        derivedText: 'parsed',
      });
      const [loaded] = await sources.load([{ ...ref, encoding: 'utf8' }]);
      expect(Buffer.from(loaded.content, 'base64')).toEqual(bytes);
      expect(loaded.derivedText).toBe('parsed');
      expect(loaded.encoding).toBe('base64');
      await expect(sources.load([{ ...ref, revision: '0'.repeat(64) }])).rejects.toThrow('快照');
    } finally {
      store.db.close();
      await fs.rm(root, { recursive: true, force: true });
    }
  });
  it('preserves a 720 KiB original file through base64 storage', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-large-source-'));
    const store = testStore();
    try {
      const sources = new AgentSourceStore(store, root);
      const bytes = Buffer.alloc(720 * 1024, 0x5a);
      const ref = await sources.save({
        name: '招标文件.docx',
        mimeType: 'application/octet-stream',
        encoding: 'base64',
        content: bytes.toString('base64'),
      });
      const [loaded] = await sources.load([ref]);
      expect(ref.size).toBe(bytes.length);
      expect(Buffer.from(loaded.content, 'base64').equals(bytes)).toBe(true);
    } finally {
      store.db.close();
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it.each(['eA', 'eA=', 'eA===', 'eB==', 'eA==\n', 'e@A=='])(
    'rejects noncanonical base64 %j',
    async (content) => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-invalid-source-'));
      const store = testStore();
      try {
        const sources = new AgentSourceStore(store, root);
        await expect(
          sources.save({
            name: 'file.bin',
            mimeType: 'application/octet-stream',
            encoding: 'base64',
            content,
          }),
        ).rejects.toThrow('INVALID_BASE64');
      } finally {
        store.db.close();
        await fs.rm(root, { recursive: true, force: true });
      }
    },
  );

  it('offers a durable artifact without executing or opening an external program', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-artifact-')),
      store = testStore();
    try {
      const artifacts = new ArtifactStore(store, root);
      const result = await artifacts.create('run', {
        name: 'answer.md',
        mimeType: 'text/markdown',
        encoding: 'utf8',
        content: '# Answer',
      });
      expect((await artifacts.load(result.id)).bytes.toString()).toBe('# Answer');
      expect(result.runId).toBe('run');
    } finally {
      store.db.close();
      await fs.rm(root, { recursive: true, force: true });
    }
  });
  it('marks a crashed active run interrupted and appends a replayable failure', () => {
    const store = testStore();
    new AgentStore(store.db);
    expect(store.run('run').status).toBe('interrupted');
    expect(store.events('run')[0].type).toBe('run.failed');
    store.db.close();
  });
  it('replays a strict monotonically increasing cursor', () => {
    const store = testStore();
    store.append('run', 'run.started', {});
    store.append('run', 'assistant.delta', { text: 'a' });
    expect(store.events('run', 1).map((e) => e.seq)).toEqual([2]);
    store.db.close();
  });
});

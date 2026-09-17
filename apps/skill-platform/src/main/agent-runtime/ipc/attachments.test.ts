import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentSourceStore } from '../attachments/source-store';
import { testStore } from '../persistence/test-store';

const mocks = vi.hoisted(() => ({
  handler: undefined as any,
  root: '',
  sources: undefined as any,
  nativePrepare: vi.fn(),
  parse: vi.fn(),
}));
vi.mock('electron', () => ({
  app: { isPackaged: false },
  BrowserWindow: { fromWebContents: () => ({}), getAllWindows: () => [] },
  dialog: {},
  ipcMain: {
    removeHandler: vi.fn(),
    handle: (_channel: string, handler: any) => {
      mocks.handler = handler;
    },
  },
}));
vi.mock('../../runtime-paths', () => ({
  getUserDataPath: () => mocks.root,
  getProjectRoot: () => mocks.root,
}));
vi.mock('../../services/knowledge-v2/worker-client', () => ({
  knowledgeWorkerClient: { call: mocks.parse },
}));
vi.mock('../supervisor/bundles', () => ({ RuntimeBundles: class {} }));
vi.mock('../application/service', () => ({
  ChatApplicationService: class {
    readonly sources;
    readonly prepareNativeAttachment = mocks.nativePrepare;
    constructor(store: any, _bundles: any, root: string) {
      this.sources = mocks.sources = new AgentSourceStore(store, path.join(root, 'blobs'));
    }
    async dispose() {}
  },
}));

import { disposeAgentRuntime, registerAgentRuntimeIPC } from './index';

let store: ReturnType<typeof testStore>;
const frame = { url: 'file:///chat.html' };
const event = { sender: { id: 1, mainFrame: frame }, senderFrame: frame };

beforeEach(async () => {
  mocks.root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-raw-upload-'));
  mocks.nativePrepare.mockReset().mockResolvedValue({ type: 'file', attachment: {} });
  mocks.parse.mockReset().mockRejectedValue(new Error('Host parsing must not run'));
  store = testStore();
  registerAgentRuntimeIPC(store.db);
});

afterEach(async () => {
  await disposeAgentRuntime();
  store.db.close();
  await fs.rm(mocks.root, { recursive: true, force: true });
});

describe('durable raw uploads over IPC', () => {
  it.each([
    ['需求.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['报告.pdf', 'application/pdf'],
    ['data.bin', 'application/octet-stream'],
    ['notes.txt', 'text/plain'],
  ])('stores %s with its original bytes without waiting for Harness', async (name, mimeType) => {
    // These bytes cannot be parsed as DOCX or PDF. Admission must still preserve them verbatim.
    const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0xff, 0x80, 42]);
    const result = await mocks.handler(event, 'prepareAttachment', {
      name,
      mimeType,
      data: bytes.toString('base64'),
    });
    expect(result.state).toBe('ready');
    expect(result).not.toHaveProperty('text');
    expect(result).not.toHaveProperty('snippet');
    expect(mocks.nativePrepare).not.toHaveBeenCalled();
    expect(mocks.parse).not.toHaveBeenCalled();
    const [source] = await mocks.sources.load([result.ref]);
    expect(Buffer.from(source.content, 'base64')).toEqual(bytes);
    expect(source.name).toBe(name);
    expect(source.mimeType).toBe(mimeType);
    expect(source.originalAvailable).toBe(true);
    expect(source.derivedText).toBe('');
  });

  it('preserves a prepared file reference when sending instead of replacing it with empty text', async () => {
    const result = await mocks.handler(event, 'prepareAttachment', {
      name: '需求.docx',
      mimeType: 'application/octet-stream',
      data: Buffer.from('original bytes').toString('base64'),
    });
    const refs = await mocks.handler(event, 'saveSources', [
      { sourceRef: result.ref, content: '', encoding: 'utf8' },
    ]);
    expect(refs).toEqual([result.ref]);
    const [source] = await mocks.sources.load(refs);
    expect(Buffer.from(source.content, 'base64').toString()).toBe('original bytes');
  });

  it('keeps non-image base64 sources eligible for native admission', async () => {
    const refs = await mocks.handler(event, 'saveSources', [
      {
        name: '需求.docx',
        mimeType: 'application/octet-stream',
        encoding: 'base64',
        content: Buffer.from('original bytes').toString('base64'),
      },
    ]);
    expect(refs[0].originalAvailable).toBe(true);
  });

  it('returns a ready upload even when Harness preparation cannot complete yet', async () => {
    mocks.nativePrepare.mockReturnValue(new Promise(() => {}));
    const result = await mocks.handler(event, 'prepareAttachment', {
      name: '需求.docx',
      mimeType: 'application/octet-stream',
      data: Buffer.from('original bytes').toString('base64'),
    });
    expect(result.state).toBe('ready');
    expect(result.ref.originalAvailable).toBe(true);
    expect(mocks.nativePrepare).not.toHaveBeenCalled();
    expect(mocks.parse).not.toHaveBeenCalled();
  }, 1_000);

  it('reports persistence failures instead of marking an unsaved upload ready', async () => {
    vi.spyOn(mocks.sources, 'save').mockRejectedValue(new Error('文件保存失败'));
    await expect(
      mocks.handler(event, 'prepareAttachment', {
        name: '需求.docx',
        mimeType: 'application/octet-stream',
        data: Buffer.from('original bytes').toString('base64'),
      }),
    ).rejects.toThrow('文件保存失败');
    expect(mocks.nativePrepare).not.toHaveBeenCalled();
  });
});

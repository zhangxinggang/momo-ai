import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testStore } from '../persistence/test-store';
import { ToolBroker, type BrokerContext } from './broker';
import { uploadedFileTools } from './uploaded-files';

let root: string, store: ReturnType<typeof testStore>, broker: ToolBroker, context: BrokerContext;
let runCode: ReturnType<typeof vi.fn>;
let file: {
  sourceId: string;
  revision: string;
  name: string;
  mimeType: string;
  size: number;
  path: string;
};
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-upload-read-'));
  const text = '来自工作区之外的用户上传原文件';
  const filename = path.join(root, 'original.txt');
  await fs.writeFile(filename, text);
  file = {
    sourceId: 'source:uploaded',
    revision: 'revision',
    name: 'original.txt',
    mimeType: 'text/plain',
    size: Buffer.byteLength(text),
    path: filename,
  };
  store = testStore();
  broker = new ToolBroker(store, root, root, process.execPath);
  runCode = vi.fn().mockResolvedValue({ exitCode: 0, stdout: 'read', stderr: '' });
  broker.register('run', uploadedFileTools([file], runCode));
  context = {
    runId: 'run',
    projectId: 'project',
    modeId: 'ask',
    roots: [],
    signal: new AbortController().signal,
    emit: () => {},
    askApproval: vi.fn().mockResolvedValue({ decision: 'allowed-once' }),
  };
});
afterEach(async () => {
  store.db.close();
  await fs.rm(root, { recursive: true, force: true });
});

describe('uploaded originals independent of workspace roots', () => {
  it('lists and reads uploaded text with no workspace', async () => {
    expect(await broker.execute('attachments_list', {}, 'list', context)).toEqual({
      files: [file],
    });
    expect(
      await broker.execute('attachments_readFile', { path: file.path }, 'read', context),
    ).toMatchObject({ text: '来自工作区之外的用户上传原文件', path: file.path });
    expect(context.askApproval).not.toHaveBeenCalled();
  });
  it('does not grant access to an unreferenced file or conflicting reference', async () => {
    const other = path.join(root, 'not-uploaded.txt');
    await fs.writeFile(other, 'private');
    await expect(
      broker.execute('attachments_readFile', { path: other }, 'other', context),
    ).rejects.toThrow('未绑定');
    await expect(
      broker.execute(
        'attachments_readFile',
        { sourceId: 'different', path: file.path },
        'conflict',
        context,
      ),
    ).rejects.toThrow('未绑定');
  });
  it('passes a binary original to model-authored execution instead of parsing it', async () => {
    file.name = '需求.docx';
    await fs.writeFile(file.path, Buffer.from([0x50, 0x4b, 0, 255]));
    await expect(
      broker.execute('attachments_readFile', { sourceId: file.sourceId }, 'binary', context),
    ).rejects.toThrow('execution_run');
    const input = { runtime: 'python', code: 'print("read original bytes on demand")' };
    await expect(broker.execute('execution_run', input, 'exec', context)).resolves.toMatchObject({
      exitCode: 0,
    });
    expect(runCode).toHaveBeenCalledWith(
      input,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(context.askApproval).toHaveBeenCalledOnce();
  });
  it.each([{ permissionMode: 'read-only' }, { modeId: 'plan' }] as const)(
    'enforces live policy %j before execution',
    async (policy) => {
      await expect(
        broker.execute('execution_run', { runtime: 'node', code: 'console.log(1)' }, 'denied', {
          ...context,
          ...policy,
        }),
      ).rejects.toThrow();
      expect(runCode).not.toHaveBeenCalled();
      expect(context.askApproval).not.toHaveBeenCalled();
    },
  );
  it('does not execute a command rejected by the user', async () => {
    context.askApproval = vi.fn().mockResolvedValue({ decision: 'rejected' });
    await expect(
      broker.execute(
        'execution_run',
        { runtime: 'node', code: 'console.log(1)' },
        'rejected',
        context,
      ),
    ).rejects.toThrow('拒绝');
    expect(runCode).not.toHaveBeenCalled();
  });
});

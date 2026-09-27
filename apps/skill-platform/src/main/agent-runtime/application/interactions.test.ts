import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { testStore } from '../persistence/test-store';
import { ChatApplicationService } from './service';

vi.mock('../../runtime-paths', () => ({
  getNotesDir: () => 'unused',
  getSkillSessionWorkspaceDir: (id: string) => process.cwd() + '/../../temp/runtime-tests/' + id,
}));
vi.mock('../../services/knowledge-v2/worker-client', () => ({ knowledgeWorkerClient: {} }));
vi.mock('../../services/mcp/hub', () => ({ getMcpHub: () => ({ listTools: () => [] }) }));
vi.mock('../../services/agent-app', () => ({
  listAgentAppSlash: async () => ({ items: [] }),
  prepareAgentAppSubmit: async (input: any) => ({ action: 'allow', content: input.content }),
  resolveAgentAppContext: async () => null,
}));
let store: ReturnType<typeof testStore>,
  service: ChatApplicationService,
  request: ReturnType<typeof vi.fn>;
let runId: string, active: any, root: string;
beforeEach(async () => {
  root = path.resolve('../../temp/interaction-test-' + randomUUID());
  await fs.mkdir(root, { recursive: true });
  store = testStore();
  store.set('project:p', JSON.stringify({ folderPaths: [await fs.realpath(root)] }));
  service = new ChatApplicationService(store, {} as never, root);
  request = vi.fn(async (method: string, input: any) => {
    if (method === 'listAgents') return [{ id: 'momo-default' }];
    if (method === 'prepareAttachment') return { type: 'file', attachment: { name: input.name } };
    if (method === 'attachmentPaths') return [path.join(root, 'original.txt')];
    if (method === 'respond')
      (service as any).emit(input.runId, 'interaction.resolved', { requestId: input.requestId });
  });
  vi.spyOn(service as any, 'settings').mockReturnValue([{ id: 'model', type: 'chat' }]);
  vi.spyOn(service as any, 'runtime').mockResolvedValue({
    manifest: { bundleId: 'bundle' },
    runtime: { request },
  });
  const turn: RuntimeTurnInput = {
    sessionId: 'chat',
    projectId: 'p',
    turnId: 'turn',
    idempotencyKey: 'turn',
    modelProfileId: 'model',
    agentId: 'momo-default',
    modeId: 'ask',
    rawIntent: '继续',
    displayInput: '继续',
    invocations: [],
    sourceRefs: [],
    folderPaths: [await fs.realpath(root)],
  };
  ({ runId } = await service.start(turn));
  active = (service as any).active.get(runId);
});
afterEach(async () => {
  await service.dispose();
  store.db.close();
  vi.restoreAllMocks();
});
function question() {
  (service as any).emit(runId, 'interaction.requested', {
    requestId: 'files',
    kind: 'question',
    questions: [{ id: 'original', header: '[file] 原文件', question: '请上传文件' }],
  });
}
it('uses a stable session temp cwd even with a registered project and exposes generated Word bytes for preview', async () => {
  const start = request.mock.calls.find(([method]) => method === 'start')![1];
  expect(start.cwd.replaceAll('\\', '/')).toContain('/temp/runtime-tests/chat');
  expect(start.cwd).not.toBe(root);
  expect(start.instructions).toContain(start.cwd);
  const bytes = Buffer.from([0x50, 0x4b, 3, 4, 255, 0]);
  await fs.writeFile(path.join(start.cwd, 'template.docx'), bytes);
  const create = active.tools.find((tool: any) => tool.id === 'artifact.create').execute;
  const artifact = await create({
    name: 'template.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    path: 'template.docx',
  });
  const [loaded] = await service.sources.load([artifact.sourceRef]);
  expect(Buffer.from(loaded.content, 'base64')).toEqual(bytes);
  expect((await service.artifacts.load(artifact.id)).bytes).toEqual(bytes);
  expect(
    store.events(runId, 0).find((event) => event.type === 'artifact.created')?.payload.sourceRef,
  ).toEqual(artifact.sourceRef);
  await expect(
    create({
      name: 'escape.docx',
      mimeType: 'application/octet-stream',
      path: path.join(root, 'outside.docx'),
    }),
  ).rejects.toThrow();
  await expect(
    create({
      name: 'ambiguous.docx',
      mimeType: 'application/octet-stream',
      path: 'template.docx',
      encoding: 'utf8',
      content: 'different',
    }),
  ).rejects.toThrow('AMBIGUOUS_ARTIFACT_INPUT');
});
it('does not send runProcess when cancellation happens during the workspace snapshot', async () => {
  await fs.writeFile(path.join(root, 'source.txt'), 'source');
  const controller = new AbortController();
  const open = fs.open.bind(fs);
  vi.spyOn(fs, 'open').mockImplementationOnce(async (...args) => {
    const file = await open(...args);
    controller.abort(new Error('tool timeout during snapshot'));
    return file;
  });
  const context = { ...(service as any).brokerContext(runId, active), signal: controller.signal };
  const execute = active.tools.find((tool: any) => tool.id === 'execution.run').execute;
  await expect(execute({ runtime: 'node', code: 'console.log(1)' }, context)).rejects.toThrow(
    'tool timeout during snapshot',
  );
  expect(request.mock.calls.some(([method]) => method === 'runProcess')).toBe(false);
  expect(request.mock.calls.some(([method]) => method === 'cancelProcess')).toBe(true);
});
it('binds a first upload to the waiting run and persists it for subsequent turns', async () => {
  question();
  const ref = await service.sources.save({
    name: 'original.txt',
    mimeType: 'text/plain',
    encoding: 'utf8',
    content: '原文件内容',
  });
  await service.respond({
    runId,
    requestId: 'files',
    answers: [{ id: 'original', selected: [], sourceRefs: [ref] }],
  });
  const files = await active.tools.find((tool: any) => tool.id === 'attachments.list').execute({});
  expect(files.files).toMatchObject([
    { name: 'original.txt', path: path.join(root, 'original.txt') },
  ]);
  expect(JSON.parse(store.get('uploaded-files:chat')!)).toEqual(files.files);
  expect(JSON.parse(store.run(runId).input).sourceRefs).toEqual([ref]);
  const response = request.mock.calls.find(([method]) => method === 'respond')![1];
  expect(response.answers[0].custom).toContain('attachments_list');
  expect(response.answers[0].custom).toContain('original.txt');
  expect(response.answers[0]).not.toHaveProperty('sourceRefs');
  await expect(service.respond({ runId, requestId: 'files', answers: [] })).rejects.toThrow(
    '追问已结束',
  );
});
it('rejects invalid question IDs, missing snapshots and excessive attachment counts before resuming', async () => {
  question();
  await expect(
    service.respond({
      runId,
      requestId: 'files',
      answers: [{ id: 'wrong', selected: [], custom: 'yes' }],
    }),
  ).rejects.toThrow('INVALID_ANSWER');
  const ref = {
    sourceId: 'missing',
    revision: 'a'.repeat(64),
    name: 'missing.pdf',
    mimeType: 'application/pdf',
    encoding: 'base64' as const,
    size: 3,
  };
  await expect(
    service.respond({
      runId,
      requestId: 'files',
      answers: [{ id: 'original', selected: [], sourceRefs: [ref] }],
    }),
  ).rejects.toThrow('附件快照不可用');
  await expect(
    service.respond({
      runId,
      requestId: 'files',
      answers: [
        {
          id: 'original',
          selected: [],
          sourceRefs: Array.from({ length: 11 }, (_, i) => ({ ...ref, sourceId: `file:${i}` })),
        },
      ],
    }),
  ).rejects.toThrow('最多上传 10');
  expect(request.mock.calls.some(([method]) => method === 'respond')).toBe(false);
  expect(active.uploadedFiles).toEqual([]);
});

it('does not bind or answer files if the run is cancelled during native admission', async () => {
  question();
  const ref = await service.sources.save({
    name: 'picture.png',
    mimeType: 'image/png',
    encoding: 'base64',
    content: 'AQID',
  });
  let release!: (value: unknown) => void;
  let admitted!: () => void;
  const waiting = new Promise<void>((resolve) => {
    admitted = resolve;
  });
  const originalRequest = request.getMockImplementation()!;
  request.mockImplementation(async (method: string, input: any) => {
    if (method === 'prepareAttachment') {
      expect(input.asFile).toBe(true);
      admitted();
      return new Promise((resolve) => {
        release = resolve;
      });
    }
    return originalRequest(method, input);
  });
  const response = service.respond({
    runId,
    requestId: 'files',
    answers: [{ id: 'original', selected: [], sourceRefs: [ref] }],
  });
  const failed = expect(response).rejects.toThrow('用户停止生成');
  await waiting;
  await service.cancel(runId);
  release({ type: 'file', attachment: {} });
  await failed;
  expect(active.uploadedFiles).toEqual([]);
  expect(request.mock.calls.some(([method]) => method === 'respond')).toBe(false);
});
it('upgrades host and native pending approvals without answering file questions or another session', async () => {
  const context = (service as any).brokerContext(runId, active);
  const hostWait = context.askApproval({
    toolId: 'execution.run',
    callId: 'code',
    reason: '运行代码',
    arguments: {},
  });
  (service as any).emit(runId, 'interaction.requested', {
    requestId: 'native',
    kind: 'approval',
    toolId: 'native-tool',
  });
  question();
  await service.setPermission('different-session', 'danger-full-access');
  expect(active.requests.size).toBe(3);
  await service.setPermission('chat', 'danger-full-access');
  await expect(hostWait).resolves.toMatchObject({ decision: 'allowed-once' });
  expect(request).toHaveBeenCalledWith('respond', {
    runId,
    requestId: 'native',
    decision: 'allowed-once',
  });
  expect([...active.requests.keys()]).toEqual(['files']);
  expect(context.getPermissionMode()).toBe('danger-full-access');
  await expect(
    active.broker.authorize(
      'execution_run',
      { runtime: 'node', code: 'console.log(1)' },
      'next',
      context,
    ),
  ).resolves.toEqual({ allowed: true });
  expect(active.requests.size).toBe(1);
});
it('preserves plan restrictions and serializes concurrent replies to the same question', async () => {
  active.input.modeId = 'plan';
  (service as any).emit(runId, 'interaction.requested', { requestId: 'native', kind: 'approval' });
  await service.setPermission('chat', 'danger-full-access');
  expect(active.requests.has('native')).toBe(true);
  question();
  const response = {
    runId,
    requestId: 'files',
    answers: [{ id: 'original', selected: [], custom: '稍后上传' }],
  };
  await Promise.all([service.respond(response), service.respond(response)]);
  expect(request.mock.calls.filter(([method]) => method === 'respond')).toHaveLength(1);
});

import { beforeEach, expect, it, vi } from 'vitest';
import { executeFileTask, executeToolTask, projectToolDefinition, taskSources } from './tool-task';

const mocks = vi.hoisted(() => ({ execute: vi.fn(), list: vi.fn() }));
vi.mock('@momo/aichat', () => ({
  executeRuntimeTurn: mocks.execute,
  emptyProjection: () => ({ content: '', events: [], status: 'running' }),
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessPort: {},
  resourceContext: (id: string) => ({
    projectId: id,
    folderPaths: ['D:/project'],
    resourceAgentAppIds: ['cursor'],
  }),
}));
vi.mock('@renderer/services/agent-app/api', () => ({ listAgentAppSlashCommands: mocks.list }));
vi.mock('@renderer/services/aichat/runtime-view', () => ({
  getRuntimeViewPrompt: () => 'view rules',
  projectRuntimeView: (content: string) =>
    content.includes('root =') ? { content, status: 'complete' } : undefined,
}));

const source = {
  sourceId: 'original',
  revision: 'revision',
  name: '真实文件.docx',
  size: 12,
  mimeType: 'application/octet-stream',
  encoding: 'base64' as const,
};
const projection = { status: 'completed', content: 'root = TextContent("真实结果")', events: [] };
beforeEach(() => {
  mocks.execute.mockReset().mockResolvedValue(projection);
  mocks.list.mockReset().mockResolvedValue({
    items: [
      {
        command: '/tender-document-parser',
        resourceId: 'skill:123',
        resourceRevision: 'verified',
        kind: 'skill',
        scope: 'application',
        label: '标书解析',
      },
    ],
  });
});
const input = () => ({
  sessionId: 'task-independent',
  projectId: 'chosen-project',
  modelId: 'model',
  source,
  instruction: '分析本次文件',
  skill: 'tender-document-parser',
  signal: new AbortController().signal,
  onUpdate: vi.fn(),
});

it('runs the selected original in an independent Harness session with the verified skill revision', async () => {
  await expect(executeFileTask(input())).resolves.toEqual(projection);
  const request = mocks.execute.mock.calls[0][1];
  expect(request).toMatchObject({
    sessionId: 'task-independent',
    projectId: 'chosen-project',
    sourceRefs: [source],
    invocations: [{ resourceRevision: 'verified' }],
    modelProfileId: 'model',
    modeId: 'ask',
  });
  expect(request.systemPrompt).toContain('结果阶段');
});
it('refuses a missing skill instead of silently producing a generic analysis', async () => {
  mocks.list.mockResolvedValue({ items: [] });
  await expect(executeFileTask(input())).rejects.toThrow('未找到技能');
  expect(mocks.execute).not.toHaveBeenCalled();
});
it('supports unrelated tasks with arbitrary fields and no file or skill requirement', async () => {
  const { source: _source, skill: _skill, ...task } = input();
  await executeToolTask({
    ...task,
    instruction: '根据用户要求生成活动方案',
    submission: { message: '创建方案', formState: { theme: '社区读书会', audience: 30 } },
  });
  const request = mocks.execute.mock.calls[0][1];
  expect(request.sourceRefs).toEqual([]);
  expect(request.invocations).toEqual([]);
  expect(request.rawIntent).toContain('社区读书会');
  expect(request.rawIntent).toContain('30');
  expect(request.rawIntent).not.toContain('标书');
  expect(mocks.list).not.toHaveBeenCalled();
});
it('rejects a recursively generated input task instead of presenting it as completed output', async () => {
  mocks.execute.mockResolvedValue({
    ...projection,
    content: 'root = AgentTask("重新输入", "做任务", [])',
  });
  await expect(executeFileTask(input())).rejects.toThrow('返回了输入页');
});
it('allows reusable task definitions only in the tool builder execution phase', async () => {
  mocks.execute.mockResolvedValue({
    ...projection,
    content: 'root = AgentTask("创建方案", "编写方案", [])',
  });
  await expect(
    executeToolTask({ ...input(), purpose: 'definition', invocations: [] }),
  ).resolves.toMatchObject({ status: 'completed' });
  expect(mocks.execute.mock.calls[0][1].systemPrompt).toContain('创建可复用工具定义');
});
it('does not accept a successful runtime completion without a result interface', async () => {
  mocks.execute.mockResolvedValue({ ...projection, content: '已完成' });
  await expect(executeFileTask(input())).rejects.toThrow('未返回可展示');
});
it('admits generated artifact previews together with the uploaded original', () => {
  const generated = { ...source, sourceId: 'template', name: '投标模板.docx' };
  expect(
    taskSources({
      sessionId: 'task',
      source,
      projection: {
        ...projection,
        events: [{ type: 'artifact.created', payload: { sourceRef: generated } }],
      } as never,
    }),
  ).toEqual([source, generated]);
});
it('validates explicit HTML definitions without accepting an unrelated narrative as a completed page', async () => {
  const html = '<!doctype html><html><body>真实网页</body></html>';
  mocks.execute.mockResolvedValue({ ...projection, content: '```html\n' + html + '\n```' });
  await expect(
    executeToolTask({ ...input(), purpose: 'definition', definitionKind: 'html' }),
  ).resolves.toMatchObject({ status: 'completed' });
  expect(projectToolDefinition('```html\n' + html + '\n```', false, 'html')).toMatchObject({
    kind: 'html',
    content: html,
    status: 'complete',
  });
  mocks.execute.mockResolvedValue({ ...projection, content: '页面已经生成' });
  await expect(
    executeToolTask({ ...input(), purpose: 'definition', definitionKind: 'html' }),
  ).rejects.toThrow('未返回可展示');
});

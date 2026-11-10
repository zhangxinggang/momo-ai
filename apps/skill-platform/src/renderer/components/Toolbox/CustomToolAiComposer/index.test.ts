// @vitest-environment jsdom
import { buildSlashInvocationToken } from '@momo/aichat';
import { useCustomToolStore } from '@renderer/store';
import { useToolTaskStore } from '@renderer/store/tool-task';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CustomToolAiComposer } from './index';

const mocks = vi.hoisted(() => ({
  panel: {} as any,
  execute: vi.fn(),
  save: vi.fn(),
  switchView: vi.fn(),
  toast: vi.fn(),
  sendMessage: vi.fn(),
}));
const definition = {
  id: 'tool',
  name: '工具',
  kind: 'openui',
  content: 'root = PlainText("原工具")',
  components: {},
};
const output = '<!doctype html><html><body>活动方案工具</body></html>';
vi.mock('@momo/aichat', async () => ({
  ...(await import('../../../../../../../packages/momo-aichat/src/utils/slash-token')),
  emptyProjection: () => ({ status: 'running', events: [], content: '' }),
  ChatInputPanel: (props: any) => {
    mocks.panel = props;
    return null;
  },
  RunTimeline: () => null,
  useAiChatConfig: () => ({ uploadFiles: vi.fn(), validateLocalFiles: () => ({ ok: true }) }),
  useChatContext: () => ({
    currentModel: 'model',
    currentProjectId: 'project',
    sendMessage: mocks.sendMessage,
  }),
}));
vi.mock('@renderer/components/ui/Toast', () => ({ useToast: () => ({ showToast: mocks.toast }) }));
vi.mock('@renderer/hooks/useAiChatGenerationActivity', () => ({
  useTrackAiChatGeneration: () => {},
}));
vi.mock('@renderer/services/ai/defaults', () => ({
  getModelsByType: (models: any) => models,
  toAIConfig: () => ({}),
}));
vi.mock('@renderer/services/custom-tool/api', () => ({ saveCustomTool: mocks.save }));
vi.mock('@renderer/services/custom-tool/generation', () => ({
  generateCustomToolView: vi.fn(),
  resolveCustomToolGenerationKind: (text: string, fallback: string) =>
    text.includes('OpenUI') ? 'openui' : fallback,
}));
vi.mock('@renderer/services/custom-tool/plugin-generation', () => ({
  generateCustomToolPlugin: vi.fn(),
}));
vi.mock('@renderer/services/custom-tool/tool-task', () => ({
  executeToolTask: mocks.execute,
  projectToolDefinition: (content: string, _streaming: boolean, kind: string) =>
    content ? { content, kind, status: 'complete' } : undefined,
  newToolTask: () => ({
    sessionId: 'definition-session',
    projection: { events: [], content: '', status: 'running' },
  }),
}));
vi.mock('@renderer/services/aichat/runtime-view', () => ({
  projectRuntimeView: (content: string) => (content ? { content, status: 'complete' } : undefined),
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessPort: {},
  uploadHarnessAttachments: vi.fn(),
}));
vi.mock('@renderer/store', async () => {
  const { create } = await import('zustand');
  const store = create<any>((set) => ({
    selectedId: 'tool',
    document: null,
    generationTasks: {},
    setGenerationTask: (id: string, task: any) =>
      set((state: any) => ({ generationTasks: { ...state.generationTasks, [id]: task } })),
    setDocumentContent: (content: string, kind: string) =>
      set((state: any) => ({ document: { ...state.document, content, kind } })),
    acceptSavedDocument: (_id: string, document: any) => set({ document }),
  }));
  return {
    useCustomToolStore: store,
    useSettingsStore: (select: any) => select({ aiModels: [{ id: 'model', type: 'chat' }] }),
    useUIStore: (select: any) => select({ setViewMode: mocks.switchView }),
  };
});
let root: Root, host: HTMLDivElement;
const builderToken = buildSlashInvocationToken({
  command: '/interactive-tool-builder',
  resourceId: 'verified-resource',
  resourceRevision: 'revision',
  kind: 'skill',
  scope: 'application',
});
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.clearAllMocks();
  useCustomToolStore.setState({ document: definition, generationTasks: {} } as any);
  useToolTaskStore.setState({ tasks: {} });
  mocks.execute.mockImplementation(async (input) => {
    const projection = { status: 'completed', content: output, events: [] };
    input.onUpdate(projection);
    return projection;
  });
  mocks.save.mockImplementation(async (_id, document) => document);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(createElement(CustomToolAiComposer, { toolKey: 'tool', hasContent: true })),
  );
  await act(async () => mocks.panel.onChange(`${builderToken} 创建活动方案工具`));
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it('executes a selected builder skill in the tool page and saves the validated definition once', async () => {
  await act(async () => {
    await Promise.all([mocks.panel.onSend(), mocks.panel.onSend()]);
  });
  expect(mocks.execute).toHaveBeenCalledTimes(1);
  expect(mocks.execute.mock.calls[0][0]).toMatchObject({
    purpose: 'definition',
    projectId: 'project',
    invocations: [{ resourceId: 'verified-resource' }],
  });
  expect(mocks.execute.mock.calls[0][0].instruction).toContain(builderToken);
  expect(mocks.execute.mock.calls[0][0].invocations[0].token).toBe(builderToken);
  expect(mocks.save).toHaveBeenCalledWith(
    'tool',
    expect.objectContaining({ content: output, kind: 'html', components: {} }),
  );
  expect(useCustomToolStore.getState().generationTasks.tool.status).toBe('done');
  expect(mocks.switchView).not.toHaveBeenCalled();
  expect(mocks.sendMessage).not.toHaveBeenCalled();
});
it('restores the prior tool and preserves a retryable error when the skill run fails', async () => {
  mocks.execute.mockRejectedValueOnce(new Error('采集未完成'));
  await act(async () => mocks.panel.onSend());
  expect(mocks.save).not.toHaveBeenCalled();
  expect(useCustomToolStore.getState().document?.content).toBe(definition.content);
  expect(useCustomToolStore.getState().generationTasks.tool.status).toBe('error');
  expect(useToolTaskStore.getState().tasks['tool-definition:tool'].projection.status).toBe(
    'failed',
  );
});
it('preserves an explicitly requested HTML definition through the same skill execution and save path', async () => {
  const html = '<!doctype html><html><body>网页工具</body></html>';
  mocks.execute.mockResolvedValueOnce({ status: 'completed', content: html, events: [] });
  await act(async () => mocks.panel.onChange(`${builderToken} 创建 HTML 页面`));
  await act(async () => mocks.panel.onSend());
  expect(mocks.execute.mock.calls[0][0].definitionKind).toBe('html');
  expect(mocks.save).toHaveBeenCalledWith(
    'tool',
    expect.objectContaining({ kind: 'html', content: html }),
  );
});

// @vitest-environment jsdom
import { useToolTaskStore } from '@renderer/store/tool-task';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FileTaskScope, FileTaskView } from './FileTaskView';

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  execute: vi.fn(),
  run: undefined as undefined | (() => void),
}));
vi.mock('@momo/aichat', () => ({
  emptyProjection: () => ({ status: 'running', events: [], content: '' }),
  useChatContext: () => ({ currentModel: 'model', currentProjectId: 'project' }),
  RunTimeline: () => null,
}));
vi.mock('@openuidev/react-lang', () => ({ useIsStreaming: () => false }));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  resourceContext: (id: string) => ({ projectId: id || 'uncategorized' }),
  uploadHarnessAttachments: mocks.upload,
  harnessPort: { respond: vi.fn() },
}));
vi.mock('@renderer/services/custom-tool/tool-task', () => ({
  newToolTask: () => ({
    sessionId: crypto.randomUUID(),
    projection: { status: 'running', events: [], content: '' },
  }),
  executeFileTask: mocks.execute,
  taskSources: (task: any) => [task.source],
}));
vi.mock('@renderer/services/aichat/runtime-view', () => ({
  projectRuntimeView: (content: string) => (content ? { status: 'complete', content } : undefined),
}));
vi.mock('@renderer/store/settings', () => ({
  useSettingsStore: (select: any) => select({ aiModels: [{ id: 'model', type: 'chat' }] }),
}));
vi.mock('@renderer/hooks/useAiChatGenerationActivity', () => ({
  useTrackAiChatGeneration: () => {},
}));
vi.mock('./WorkspaceComponents', async () => ({
  ViewSourcesContext: (await import('react')).createContext([]),
  FilePreviewView: () => createElement('div', { 'data-original': true }, '原文件预览'),
}));
vi.mock('./index', () => ({
  CustomToolOpenUIPreview: ({ content }: any) =>
    createElement('div', { 'data-result': true }, content),
}));
vi.mock('antd', () => ({
  Button: ({ children, icon, type, loading, ...props }: any) =>
    createElement('button', props, children || icon),
  Alert: ({ message }: any) => createElement('div', { role: 'alert' }, message),
}));
let host: HTMLDivElement, root: Root;
const source = {
  sourceId: 'source:one',
  revision: '1',
  name: '原文件.docx',
  size: 6,
  mimeType: 'application/octet-stream',
  encoding: 'base64' as const,
};
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  useToolTaskStore.setState({ tasks: {} });
  mocks.upload.mockReset().mockResolvedValue([{ sourceRef: source }]);
  mocks.execute
    .mockReset()
    .mockResolvedValue({ status: 'completed', content: '基础信息：本次文件结果', events: [] });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      createElement(
        FileTaskScope.Provider,
        { value: { key: 'tool:one', disabled: false } },
        createElement(FileTaskView, {
          props: {
            title: '告别繁琐投标，稳握胜券在手',
            instruction: '完整解析',
            skill: 'tender-document-parser',
            steps: ['上传文件', '开始解析', '解析结果'],
          },
        } as never),
      ),
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
async function choose(files = [new File(['source'], '原文件.docx')]) {
  const input = host.querySelector('input')!;
  await act(async () => {
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
function start() {
  return [...host.querySelectorAll('button')].find((button) =>
    /开始解析|重新处理/.test(button.textContent || ''),
  )!;
}

it('opens a cached completed analysis after its layout-only validation error is repaired', async () => {
  await act(async () => {
    useToolTaskStore.getState().setTask('tool:one:file-task', {
      sessionId: 'cached-analysis',
      source,
      error:
        'field "/align" expects one of ["start", "center", "end", "stretch", "baseline"] but got true',
      projection: {
        status: 'failed',
        content: '已修复布局的原分析结果',
        events: [{ type: 'run.completed' }],
      } as any,
    });
  });
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain('解析结果');
  expect(host.querySelector('[data-result]')?.textContent).toContain('原分析结果');
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(mocks.execute).not.toHaveBeenCalled();
});

it('shows single-file upload first, then runs Harness once and displays result with original preview', async () => {
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain('上传文件');
  expect(start().disabled).toBe(true);
  expect(host.querySelector('[data-result]')).toBeNull();
  await choose();
  await act(async () => {
    start().click();
    start().click();
  });
  expect(mocks.execute).toHaveBeenCalledTimes(1);
  expect(mocks.execute.mock.calls[0][0]).toMatchObject({
    source,
    skill: 'tender-document-parser',
    modelId: 'model',
  });
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain('解析结果');
  expect(host.querySelector('[data-result]')?.textContent).toContain('本次文件结果');
  expect(host.querySelector('[data-original]')).not.toBeNull();
});
it('rejects multiple files and retains the original on execution failure for retry', async () => {
  await choose([new File(['1'], 'one.docx'), new File(['2'], 'two.docx')]);
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(host.textContent).toContain('仅支持上传一个');
  await choose();
  mocks.execute.mockRejectedValueOnce(new Error('服务暂时不可用'));
  await act(async () => start().click());
  expect(host.textContent).toContain('服务暂时不可用');
  expect(host.textContent).toContain('原文件.docx');
  await act(async () => start().click());
  expect(host.querySelector('[data-result]')).not.toBeNull();
});

it('shows a dedicated processing page, preserves progress across remounts, and then reveals results', async () => {
  await choose();
  let finish!: (value: unknown) => void;
  mocks.execute.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => start().click());
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain('开始解析');
  expect(host.querySelector('[aria-label="选择或拖拽上传文件"]')).toBeNull();
  expect(host.querySelector('[aria-label="正在处理文件"]')?.textContent).toContain('原文件.docx');
  expect(host.querySelector('[role="status"]')?.textContent).toContain('正在读取文件并分析');
  await act(async () => root.unmount());
  root = createRoot(host);
  await act(async () =>
    root.render(
      createElement(
        FileTaskScope.Provider,
        { value: { key: 'tool:one', disabled: false } },
        createElement(FileTaskView, {
          props: { title: '标书解析', steps: ['上传文件', '开始解析', '解析结果'] },
        } as never),
      ),
    ),
  );
  expect(host.querySelector('[aria-label="正在处理文件"]')).not.toBeNull();
  await act(async () => finish({ status: 'completed', content: '本次标书解析结果', events: [] }));
  expect(host.querySelector('[data-result]')?.textContent).toContain('本次标书解析结果');
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain('解析结果');
});

it('removes the IPC wrapper from errors while keeping the original file available for retry', async () => {
  await choose();
  mocks.execute.mockRejectedValueOnce(
    new Error("Error invoking remote method 'agent-runtime': Error: 技能版本已变化，请重新选择"),
  );
  await act(async () => start().click());
  expect(host.querySelector('[role="alert"]')?.textContent).toBe('技能版本已变化，请重新选择');
  expect(host.textContent).not.toContain('Error invoking remote method');
  expect(host.textContent).toContain('原文件.docx');
  expect(start().textContent).toBe('重新处理');
});

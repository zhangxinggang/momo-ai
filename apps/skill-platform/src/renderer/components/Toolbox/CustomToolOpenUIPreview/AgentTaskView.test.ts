// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CustomToolOpenUIPreview } from './index';
import { useToolTaskStore } from '@renderer/store/tool-task';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  upload: vi.fn(),
  respond: vi.fn(),
  project: 'project',
}));
vi.mock('@momo/aichat', () => ({
  emptyProjection: () => ({ status: 'running', events: [], content: '' }),
  useChatContext: () => ({ currentModel: 'model', currentProjectId: mocks.project }),
  RunTimeline: () => null,
}));
vi.mock('@momo/file-editor', () => ({ BinaryFilePreview: () => null }));
vi.mock('@renderer/services/system', () => ({ fetchFilePreviewBaseUrl: vi.fn() }));
vi.mock('@renderer/components/ui/MarkdownPreview', () => ({ MarkdownPreview: () => null }));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  resourceContext: (id: string) => ({ projectId: id || 'uncategorized' }),
  uploadHarnessAttachments: mocks.upload,
  harnessPort: { respond: mocks.respond },
  harnessSourceStore: { load: vi.fn() },
}));
vi.mock('@renderer/services/custom-tool/tool-task', async () => ({
  ...(await vi.importActual('@renderer/services/custom-tool/tool-task')),
  executeToolTask: mocks.execute,
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

let host: HTMLDivElement, root: Root;
const source = {
  sourceId: 'file:real',
  revision: '1',
  name: '参考.txt',
  size: 6,
  mimeType: 'text/plain',
  encoding: 'base64',
};
const content = `root = AgentTask("活动策划", "根据主题创建活动方案", [form], null, ["填写主题", "创建方案", "活动方案"])
form = Form("plan", actions, [theme, file])
theme = Input("theme", "输入活动主题")
file = FileInput("reference", "可选参考资料", ".txt")
actions = Buttons([start])
start = Button("创建方案")`;
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  useToolTaskStore.setState({ tasks: {} });
  mocks.project = 'project';
  mocks.execute.mockReset().mockResolvedValue({
    status: 'completed',
    content: 'root = PlainText("本次活动方案")',
    events: [],
  });
  mocks.upload.mockReset().mockResolvedValue([{ sourceRef: source }]);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await mount();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
async function mount(key = 'plan-tool') {
  await act(async () =>
    root.render(
      createElement(CustomToolOpenUIPreview, {
        runtimeKey: key,
        content,
        title: '活动工具',
        components: {},
      }),
    ),
  );
}
async function submit() {
  const button = [...host.querySelectorAll('button')].find(
    (item) => item.textContent === '创建方案',
  )!;
  expect(button).toBeTruthy();
  await act(async () => button.click());
}
it('routes a generated form to Harness without a composer callback and retains its result across remounts', async () => {
  const input = host.querySelector('input[type="text"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      '社区读书会',
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await submit();
  expect(mocks.execute).toHaveBeenCalledTimes(1);
  expect(mocks.execute.mock.calls[0][0]).toMatchObject({
    instruction: '根据主题创建活动方案',
    sources: [],
    submission: { formState: { plan: { theme: { value: '社区读书会' } } } },
  });
  expect(host.textContent).toContain('本次活动方案');
  await act(async () => root.unmount());
  root = createRoot(host);
  await mount();
  expect(host.textContent).toContain('本次活动方案');
  await mount('other-tool');
  expect(host.textContent).not.toContain('本次活动方案');
});
it('sends original optional attachments to the same task and supports retry after failure', async () => {
  const input = host.querySelector('input[type="file"]')!;
  await act(async () => {
    Object.defineProperty(input, 'files', {
      value: [new File(['source'], '参考.txt')],
      configurable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  mocks.execute.mockRejectedValueOnce(new Error('连接暂时中断'));
  await submit();
  expect(host.textContent).toContain('连接暂时中断');
  expect(mocks.execute.mock.calls[0][0].sources).toEqual([source]);
  mocks.project = 'another-project';
  await mount();
  await submit();
  expect(mocks.execute.mock.calls[1][0].projectId).toBe('project');
  expect(host.textContent).toContain('本次活动方案');
});

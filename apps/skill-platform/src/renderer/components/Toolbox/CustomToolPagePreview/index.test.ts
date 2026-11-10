// @vitest-environment jsdom
import { useToolTaskStore } from '@renderer/store/tool-task';
import { act, createContext, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { CustomToolPagePreview } from './index';
const mocks = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('@momo/aichat', () => ({
  emptyProjection: () => ({ status: 'running', content: '', events: [] }),
  useChatContext: () => ({ currentModel: 'model', currentProjectId: 'project' }),
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  uploadHarnessAttachments: async () => [],
  harnessSourceStore: { load: vi.fn() },
}));
vi.mock('@renderer/services/custom-tool/tool-task', () => ({
  newToolTask: () => ({
    sessionId: 'task',
    projection: { status: 'running', content: '', events: [] },
  }),
  executeToolTask: mocks.execute,
  taskSources: () => [],
}));
vi.mock('@renderer/store/settings', () => ({
  useSettingsStore: (selector: any) => selector({ aiModels: [{ id: 'model', type: 'chat' }] }),
}));
vi.mock('@renderer/hooks/useAiChatGenerationActivity', () => ({
  useTrackAiChatGeneration: () => {},
}));
vi.mock('../CustomToolOpenUIPreview/WorkspaceComponents', () => ({
  ViewSourcesContext: createContext([]),
  FilePreviewView: () => null,
}));
it('runs a declared page operation, continues through unmount, restores the complete report and keeps export outside it', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  useToolTaskStore.setState({ tasks: {} });
  const host = document.createElement('div');
  document.body.append(host);
  let root = createRoot(host),
    finish!: (result: any) => void;
  mocks.execute.mockImplementation(async (args) => {
    args.onUpdate({ status: 'running', content: '', events: [{ type: 'tool.call' }] });
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const props = {
    toolId: 'example',
    title: '采购分析',
    content: '<html><body>文件上传</body></html>',
    actions: {
      analyze: {
        capability: 'model.generate' as const,
        title: '分析',
        instruction: '真实分析',
        result: 'report' as const,
      },
    },
  };
  try {
    await act(async () => root.render(createElement(CustomToolPagePreview, props)));
    const frame = host.querySelector('iframe')!;
    const token = /const token=("[^"]+")/.exec(frame.srcdoc)![1];
    await act(async () =>
      window.dispatchEvent(
        new MessageEvent('message', {
          source: frame.contentWindow,
          data: {
            channel: 'momo-page',
            token: JSON.parse(token),
            id: 'one',
            method: 'run',
            payload: { action: 'analyze', fields: {} },
          },
        }),
      ),
    );
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('正在读取');
    await act(async () => root.unmount());
    const result = {
      title: '完整采购结果',
      summary: '已核对',
      sections: [
        {
          id: 'a',
          title: '基础信息',
          emptyMessage: '',
          groups: [{ id: 'a', title: '项目', blocks: [{ type: 'text', text: '原文件中的内容' }] }],
        },
      ],
    };
    await act(async () =>
      finish({
        status: 'completed',
        content: JSON.stringify(result),
        events: [{ type: 'run.completed' }],
      }),
    );
    root = createRoot(host);
    await act(async () => root.render(createElement(CustomToolPagePreview, props)));
    expect(host.textContent).toContain('原文件中的内容');
    const download = [...host.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('导出完整报告'),
    )!;
    expect(download.closest('article')).toBeNull();
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(host.textContent).not.toMatch(/openui|schema/i);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});

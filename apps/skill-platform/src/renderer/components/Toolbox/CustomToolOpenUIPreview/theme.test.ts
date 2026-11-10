// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { CustomToolOpenUIPreview } from './index';

vi.mock('@momo/file-editor', () => ({ BinaryFilePreview: () => null }));
vi.mock('@renderer/services/agent-runtime/client', () => ({ harnessSourceStore: {} }));
vi.mock('./AgentTaskView', () => ({ AgentTaskView: () => null }));
vi.mock('./FileTaskView', async () => ({
  FileTaskView: () => null,
  FileTaskScope: (await import('react')).createContext({}),
}));
vi.mock('./GeneratedMarkdown', () => ({ GeneratedMarkdown: () => null }));
vi.mock('@renderer/services/system', () => ({ fetchFilePreviewBaseUrl: vi.fn() }));
vi.mock('./export-docx', () => ({ exportInterfaceToDocx: vi.fn() }));
vi.mock('@renderer/services/custom-tool/api', () => ({ executeConfiguredApiRequest: vi.fn() }));

it('isolates light report tokens from simultaneously mounted dark tool previews and portals export to the host', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const host = document.createElement('div');
  const toolbar = document.createElement('div');
  document.body.append(toolbar, host);
  const root = createRoot(host);
  const content =
    'root = Stack([export, table])\nexport = ExportDocx("报告.docx", "导出 DOCX")\ntable = Table([column])\ncolumn = Col("项目名称", ["采购项目"])';
  const preview = (presentation: 'chat' | 'toolbox') =>
    createElement(CustomToolOpenUIPreview, {
      key: presentation,
      presentation,
      content,
      components: {},
      title: presentation,
      ...(presentation === 'chat' ? { exportToolbar: toolbar } : {}),
    });
  try {
    await act(async () =>
      root.render(createElement('div', {}, preview('chat'), preview('toolbox'))),
    );
    const rules = Array.from(
      document.querySelectorAll<HTMLStyleElement>('style[data-openui-theme]'),
    ).map((style) => style.textContent!);
    const light = rules.find((rule) => !rule.includes('#e8f8ff'))!;
    const dark = rules.find((rule) => rule.includes('#e8f8ff'))!;
    expect(light).toBeTruthy();
    expect(dark).toBeTruthy();
    const selector = (rule: string) => rule.split(',')[0];
    expect(selector(light)).not.toBe(selector(dark));
    const chat = host.querySelector('[aria-label="chat"]')!;
    const toolbox = host.querySelector('[aria-label="toolbox"]')!;
    expect(chat.querySelector(selector(light))).not.toBeNull();
    expect(chat.querySelector(selector(dark))).toBeNull();
    expect(toolbox.querySelector(selector(dark))).not.toBeNull();
    expect(chat.querySelector('td')?.textContent).toContain('采购项目');
    expect(chat.querySelector('[aria-label="报告操作"]')).toBeNull();
    expect(toolbar.textContent).toContain('导出 DOCX');
    expect(toolbox.querySelector('[aria-label="报告操作"]')?.textContent).toContain('导出 DOCX');
    await act(async () => root.render(createElement('div', {}, preview('chat'))));
    expect(toolbar.textContent).toContain('导出 DOCX');
  } finally {
    await act(async () => root.unmount());
    expect(document.querySelectorAll('style[data-openui-theme]')).toHaveLength(0);
    host.remove();
    toolbar.remove();
    vi.unstubAllGlobals();
  }
});

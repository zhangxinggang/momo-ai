// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CustomToolWorkspace } from './index';

const mocks = vi.hoisted(() => ({
  state: {} as any,
  change: undefined as ((value: boolean) => void) | undefined,
  fullscreen: vi.fn(),
  error: vi.fn(),
}));
vi.mock('@renderer/store/custom-tool', () => ({
  useCustomToolStore: (selector: any) => selector(mocks.state),
  getCustomToolDisplayName: () => '大屏',
  isCustomToolDirty: () => false,
}));
vi.mock('@renderer/services/desktop', () => ({
  isWindowFullscreen: async () => false,
  setWindowFullscreen: mocks.fullscreen,
  subscribeFullscreenChanged: (listener: any) => {
    mocks.change = listener;
    return () => {};
  },
}));
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { error: mocks.error } }) },
  Button: ({ children, icon, onClick, ...props }: any) =>
    React.createElement('button', { onClick, 'aria-label': props['aria-label'] }, icon, children),
  Tooltip: ({ children }: any) => children,
  Tabs: () => React.createElement('div', { 'data-editor': true }, '编辑画布'),
}));
vi.mock('@momo/markdown', () => ({ ViewportPortal: ({ children }: any) => children }));
vi.mock('@momo/file-editor', () => ({ CodeFileEditor: () => null }));
vi.mock('@renderer/components/CustomTool/SnapEditFrame', () => ({ SnapEditFrame: () => null }));
vi.mock('../CustomToolAiComposer', () => ({
  CustomToolAiComposer: () => React.createElement('div', { 'data-composer': true }),
}));
vi.mock('../CustomToolDataPanel', () => ({ CustomToolDataPanel: () => null }));
vi.mock('../CustomToolOpenUIPreview', () => ({
  CustomToolOpenUIPreview: () => React.createElement('div', { 'data-preview': true }),
}));
vi.mock('../ToolWebview', () => ({ ToolWebview: () => null }));
vi.mock('@renderer/components/ui/ModuleEmptyState', () => ({ ModuleEmptyState: () => null }));

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  mocks.fullscreen.mockReset().mockImplementation(async (value) => mocks.change?.(value));
  mocks.state = {
    selectedId: 'tool',
    document: { name: '大屏', kind: 'html', content: '<h1>展示内容</h1>', components: {} },
    generationTasks: {},
    isEditing: false,
  };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it.each([false, true])(
  'puts fullscreen in the content and shows only the page until exit (editing=%s)',
  async (editing) => {
    mocks.state.isEditing = editing;
    await act(async () => root.render(React.createElement(CustomToolWorkspace)));
    const button = host.querySelector<HTMLButtonElement>('button[aria-label="系统全屏展示"]')!;
    expect(button).not.toBeNull();
    expect(button.closest('header')).toBeNull();
    await act(async () => button.click());
    expect(mocks.fullscreen).toHaveBeenLastCalledWith(true);
    expect(host.querySelector('header')).toBeNull();
    expect(host.querySelector('[data-editor]')).toBeNull();
    expect(host.querySelector('[data-composer]')).toBeNull();
    expect(host.querySelector('iframe')?.getAttribute('srcdoc')).toContain('展示内容');
    await act(async () =>
      host.querySelector<HTMLButtonElement>('button[aria-label="退出系统全屏"]')!.click(),
    );
    expect(mocks.fullscreen).toHaveBeenLastCalledWith(false);
    expect(host.querySelector('header')).not.toBeNull();
    expect(Boolean(host.querySelector('[data-editor]'))).toBe(editing);
  },
);

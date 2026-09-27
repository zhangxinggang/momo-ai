// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import MarkdownRenderer from './index';
const mocks = vi.hoisted(() => ({
  openPath: vi.fn(),
  openUrl: vi.fn(),
  resolve: vi.fn(async (path: string) => '/work/' + path),
  warning: vi.fn(),
}));
vi.mock('antd', () => ({ App: { useApp: () => ({ message: { warning: mocks.warning } }) } }));
vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({
    localPath: {
      allowRelativePaths: true,
      onOpenLocalPath: mocks.openPath,
      resolveLocalPathForOpen: mocks.resolve,
    },
    onOpenExternalUrl: mocks.openUrl,
  }),
}));
vi.mock('@momo/markdown', () => ({
  MdPreview: ({ onHtmlChanged }: any) => {
    React.useEffect(() => {
      onHtmlChanged?.();
    }, [onHtmlChanged]);
    return React.createElement(
      'div',
      null,
      React.createElement('a', { href: 'src/a.ts:12' }, '文件'),
      React.createElement('code', null, 'src/长 文件名.ts'),
      React.createElement('a', { href: 'https://example.com' }, '链接'),
    );
  },
}));
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
it('opens a relative Markdown file link and a long filename through the workspace handler', async () => {
  await act(async () =>
    root.render(React.createElement(MarkdownRenderer, { content: '[文件](src/a.ts)' })),
  );
  await act(async () => host.querySelector('a')!.click());
  expect(mocks.openPath).toHaveBeenCalledWith('/work/src/a.ts');
  await act(async () => host.querySelector('code')!.click());
  expect(mocks.openPath).toHaveBeenCalledWith('/work/src/长 文件名.ts');
});
it('routes HTTP links through the embedded browser handler', async () => {
  await act(async () =>
    root.render(React.createElement(MarkdownRenderer, { content: '[链接](https://example.com)' })),
  );
  await act(async () => host.querySelector('a[href^="https"]')!.click());
  expect(mocks.openUrl).toHaveBeenCalledWith('https://example.com');
});

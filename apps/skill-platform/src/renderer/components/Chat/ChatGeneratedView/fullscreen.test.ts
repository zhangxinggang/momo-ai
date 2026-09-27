// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ChatGeneratedView } from './index';
const mocks = vi.hoisted(() => ({
  setFullscreen: vi.fn(),
  listeners: new Set<(active: boolean) => void>(),
}));
vi.mock('@momo/aichat', () => ({ MarkdownRenderer: () => null }));
vi.mock('@momo/markdown', async () => ({
  ViewportPortal: (
    await import('../../../../../../../packages/momo-markdown/src/components/ViewportPortal')
  ).ViewportPortal,
}));
vi.mock('@renderer/services/desktop/window', () => ({ setWindowFullscreen: mocks.setFullscreen }));
vi.mock('@renderer/services/desktop/ipc-events', () => ({
  subscribeFullscreenChanged: (callback: any) => {
    mocks.listeners.add(callback);
    return () => mocks.listeners.delete(callback);
  },
}));
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { error: vi.fn() } }) },
  Alert: () => null,
  Tooltip: ({ children }: any) => children,
  Button: ({ icon, type, ...props }: any) => React.createElement('button', props, icon),
}));
vi.mock('../../Toolbox/CustomToolOpenUIPreview', () => ({
  CustomToolOpenUIPreview: () => {
    const [value, setValue] = useState('初始');
    return React.createElement(
      'button',
      { 'data-form': true, onClick: () => setValue('已填写') },
      value,
    );
  },
}));

it('only expands the selected message, retains form state, and exits on Escape or unmount', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  mocks.setFullscreen
    .mockReset()
    .mockImplementation(async (active) => mocks.listeners.forEach((listener) => listener(active)));
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        React.createElement(
          React.Fragment,
          {},
          ...['a', 'b'].map((id) =>
            React.createElement(ChatGeneratedView, {
              key: id,
              message: {
                id,
                generatedView: { kind: 'openui', content: '', status: 'ready' },
              } as any,
            }),
          ),
        ),
      ),
    );
    const form = host.querySelector<HTMLButtonElement>('[data-form]')!;
    await act(async () => form.click());
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="全屏展示界面"]')!.click(),
    );
    expect(mocks.setFullscreen).toHaveBeenLastCalledWith(true);
    expect(host.querySelectorAll('section')).toHaveLength(1);
    expect(
      document
        .querySelector('[aria-label="退出界面全屏"]')!
        .closest('section')!
        .querySelector('[data-form]'),
    ).toBe(form);
    expect(form.textContent).toBe('已填写');
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(host.querySelectorAll('section')).toHaveLength(2);
    expect(host.querySelector('[data-form]')).toBe(form);
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="全屏展示界面"]')!.click(),
    );
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
  expect(mocks.setFullscreen).toHaveBeenLastCalledWith(false);
  expect(mocks.listeners.size).toBe(0);
});

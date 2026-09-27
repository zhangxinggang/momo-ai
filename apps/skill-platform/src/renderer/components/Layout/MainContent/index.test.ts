// @vitest-environment jsdom
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { MainContent } from './index';

const state = vi.hoisted(() => ({ mode: 'chat' }));
vi.mock('@renderer/store', () => ({
  useUIStore: (select: any) => select({ viewMode: state.mode }),
}));
vi.mock('@renderer/components/Chat', () => ({
  ChatManager: () => {
    const [draft, setDraft] = useState('问题');
    return createElement(
      'button',
      { 'data-chat': true, onClick: () => setDraft('已回答和未发送草稿') },
      draft,
    );
  },
}));
vi.mock('@renderer/components/Toolbox', () => ({
  ToolboxManager: () => createElement('div', {}, '工具箱'),
}));
vi.mock('@renderer/components/ui/CenteredLoading', () => ({ CenteredLoading: () => null }));

it('keeps chat state and DOM when navigating away and back', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(MainContent)));
    const chat = host.querySelector('[data-chat]')!;
    await act(async () => chat.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    state.mode = 'toolbox';
    await act(async () => root.render(createElement(MainContent)));
    expect(chat.closest('[aria-hidden]')?.getAttribute('aria-hidden')).toBe('true');
    state.mode = 'chat';
    await act(async () => root.render(createElement(MainContent)));
    expect(host.querySelector('[data-chat]')).toBe(chat);
    expect(chat.textContent).toBe('已回答和未发送草稿');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    state.mode = 'chat';
    vi.unstubAllGlobals();
  }
});

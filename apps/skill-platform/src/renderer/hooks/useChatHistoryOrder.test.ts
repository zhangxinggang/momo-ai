// @vitest-environment jsdom
import type { IChatSession } from '@momo/aichat';
import { orderChatHistory } from '@renderer/services/aichat/history-order';
import { SIDEBAR_ORDER_STORAGE_KEY, useSidebarOrderStore } from '@renderer/store/sidebar-order';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useChatHistoryOrder } from './useChatHistoryOrder';

vi.mock('antd', () => ({ App: { useApp: () => ({ message: { error: vi.fn() } }) } }));

it('drags history, toggles pinning, and persists preferences across remounts', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  useSidebarOrderStore.setState({ orders: {} });
  const sessions = ['a', 'b', 'c'].map((id, index) => ({
    id,
    projectId: 'p',
    updatedAt: 3 - index,
  })) as IChatSession[];
  function List() {
    const history = useChatHistoryOrder(sessions);
    return createElement(
      'div',
      {},
      ...orderChatHistory(sessions, history.orders.p, history.pinnedIds).map((session) =>
        createElement(
          'div',
          { key: session.id, 'data-id': session.id, ...history.dragProps(session.id) },
          createElement('button', { onClick: () => history.togglePin(session.id) }, session.id),
        ),
      ),
    );
  }
  const host = document.createElement('div');
  document.body.append(host);
  let root = createRoot(host);
  const ids = () =>
    Array.from(host.querySelectorAll('[data-id]')).map((row) => row.getAttribute('data-id'));
  try {
    await act(async () => root.render(createElement(List)));
    const transfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    const drag = (id: string, type: string) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { dataTransfer: transfer, clientY: -1 });
      host.querySelector(`[data-id="${id}"]`)!.dispatchEvent(event);
    };
    await act(async () => drag('c', 'dragstart'));
    await act(async () => drag('a', 'dragover'));
    expect(host.querySelector('[data-id="a"]')?.getAttribute('data-drop-position')).toBe('before');
    await act(async () => drag('a', 'drop'));
    expect(ids()).toEqual(['c', 'a', 'b']);
    await act(async () => host.querySelector<HTMLButtonElement>('[data-id="b"] button')!.click());
    expect(ids()).toEqual(['b', 'c', 'a']);
    const stored = JSON.parse(localStorage.getItem(SIDEBAR_ORDER_STORAGE_KEY)!);
    expect(stored['chat-sessions'].p).toEqual(['c', 'a', 'b']);
    expect(stored['chat-pinned-sessions'].__root__).toEqual(['b']);
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(createElement(List)));
    expect(ids()).toEqual(['b', 'c', 'a']);
    await act(async () => host.querySelector<HTMLButtonElement>('[data-id="b"] button')!.click());
    expect(ids()).toEqual(['c', 'a', 'b']);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});

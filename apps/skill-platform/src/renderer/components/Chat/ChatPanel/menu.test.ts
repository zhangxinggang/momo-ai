// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ChatPanel } from './index';

const mocks = vi.hoisted(() => ({ togglePin: vi.fn(), switchToSession: vi.fn() }));

vi.mock('@momo/aichat', () => ({
  formatRelativeCompact: () => '1d',
  getChatProjectDisplayName: (project: { name: string }) => project.name,
  useChatContext: () => ({
    sessions: ['第一条', '第二条'].map((title, index) => ({
      id: String(index),
      title,
      projectId: 'p',
      updatedAt: 2 - index,
      messages: [{ role: 'user' }],
    })),
    isSessionGenerating: () => false,
    refreshSessionsFromStorage: () => {},
    switchToSession: mocks.switchToSession,
  }),
}));

vi.mock('@renderer/store', () => {
  const projects = [{ id: 'p', name: '示例项目' }];
  return {
    useChatProjectStore: (select: (state: { projects: typeof projects }) => unknown) =>
      select({ projects }),
    useUIStore: (select: (state: { viewMode: string }) => unknown) => select({ viewMode: 'chat' }),
  };
});
vi.mock('@renderer/hooks/useChatHistoryOrder', () => ({
  useChatHistoryOrder: () => ({
    orders: {},
    pinnedIds: [],
    togglePin: mocks.togglePin,
    dragProps: () => ({}),
  }),
}));
vi.mock('@renderer/hooks/useConfirmLeaveAiChat', () => ({
  useConfirmLeaveAiChat: () => async () => true,
}));
vi.mock('../ChatProjectModal', () => ({ ChatProjectModal: () => null }));

it('opens menus only on click and sends actions to the selected session', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.useFakeTimers();
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);

  const button = (label: string) =>
    host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const hover = async (label: string) => {
    await act(async () => {
      button(label).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(250);
    });
  };
  const click = async (label: string) => act(async () => button(label).click());
  const menus = () => [...document.querySelectorAll('[role="menu"]')];
  const first = '对话操作：第一条';
  const second = '对话操作：第二条';
  const project = '项目操作：示例项目';

  try {
    await act(async () => root.render(createElement(ChatPanel)));
    await hover(project);
    await hover(first);
    expect(menus()).toHaveLength(0);

    await click(first);
    await hover(second);
    expect(menus()).toHaveLength(1);
    expect(button(first).getAttribute('aria-expanded')).toBe('true');
    expect(button(second).getAttribute('aria-expanded')).toBe('false');

    await click(second);
    expect(menus()).toHaveLength(1);
    expect(button(second).getAttribute('aria-expanded')).toBe('true');

    const pin = [...menus()[0].querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
      (item) => item.textContent === '置顶',
    );
    await act(async () => pin!.click());
    expect(mocks.togglePin).toHaveBeenCalledExactlyOnceWith('1');
    expect(mocks.switchToSession).not.toHaveBeenCalled();
    expect(menus()).toHaveLength(0);

    await click(second);
    await click(project);
    expect(menus()).toHaveLength(1);
    expect(menus()[0].textContent).toContain('编辑项目');
    await click(project);
    expect(menus()).toHaveLength(0);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

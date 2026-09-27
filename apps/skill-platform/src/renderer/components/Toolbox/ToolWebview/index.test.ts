// @vitest-environment jsdom
import { WEB_PAGE_SUMMARY_PROMPT, webPageChatIdentity } from '@renderer/services/webpage-chat';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { executeRuntimeTurn } from '../../../../../../../packages/momo-aichat/src/runtime/execute';
import { emptyProjection } from '../../../../../../../packages/momo-aichat/src/runtime/projection';

const mocks = vi.hoisted(() => ({ readWebPage: vi.fn(), cancel: vi.fn(), notify: vi.fn() }));
vi.mock('../../../../../../../packages/momo-aichat/src/runtime/execute', () => ({
  executeRuntimeTurn: vi.fn(),
}));
vi.mock('@renderer/services/ipc', () => ({
  getCustomToolIpc: () => ({ readWebPage: mocks.readWebPage }),
}));
vi.mock('@renderer/store', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) =>
    selector({ aiModels: [], isDarkMode: false }),
}));
vi.mock('@renderer/hooks/useAiChatGenerationActivity', () => ({
  useAiChatGenerationReporter: () => mocks.notify,
}));
vi.mock('antd', () => ({
  Alert: (props: { title: string }) => React.createElement('div', { role: 'alert' }, props.title),
  Button: (props: {
    onClick?: React.MouseEventHandler;
    'aria-label'?: string;
    'aria-pressed'?: boolean;
    icon?: React.ReactNode;
  }) =>
    React.createElement(
      'button',
      {
        onClick: props.onClick,
        'aria-label': props['aria-label'],
        'aria-pressed': props['aria-pressed'],
      },
      props.icon,
    ),
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  createHarnessChatOverrides: () => ({
    callAIChatStream: vi.fn(),
    runtime: {
      port: { events: vi.fn().mockResolvedValue([]), cancel: mocks.cancel },
      getAgentId: () => 'momo-default',
      getResourceContext: () => ({ projectId: 'test', folderPaths: [] }),
    },
  }),
}));
vi.mock('@renderer/services/aichat', () => ({
  buildSharedAiChatServices: (options: any) => ({
    ...options.overrides,
    defaultModel: 'test-model',
    storageKeyPrefix: options.storageKeyPrefix,
    chatStorage: {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    },
    uploadFiles: vi.fn(),
    validateLocalFiles: () => ({ ok: true }),
    saveChatSources: vi.fn(),
    loadChatSources: vi.fn().mockResolvedValue([]),
  }),
}));
vi.mock('@momo/aichat', async () => {
  const { ChatProvider, useChatContext } =
    await import('../../../../../../../packages/momo-aichat/src/contexts/ChatContext');
  const { useAiChatConfig } =
    await import('../../../../../../../packages/momo-aichat/src/contexts/AiChatConfigContext');
  return {
    ChatProvider,
    useChatContext,
    useAiChatConfig,
    AiChatView: (props: any) => {
      const chat = useChatContext();
      return React.createElement(
        'div',
        {},
        React.createElement('textarea', {
          value: props.inputValue,
          onChange: (event: any) => props.onInputChange(event.target.value),
        }),
        React.createElement(
          'button',
          {
            'data-send': true,
            onClick: async () => {
              if (await chat.sendMessage(props.inputValue)) props.onInputChange('');
            },
          },
          '发送',
        ),
        React.createElement(
          'div',
          { 'data-history': true },
          chat.currentSession?.messages.map((message) => message.content).join('\n'),
        ),
      );
    },
  };
});

import { ToolWebview } from '.';

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  mocks.readWebPage.mockResolvedValue({
    url: 'https://example.com/a',
    title: '文章 A',
    content: '文章 A 的实际正文',
    truncated: false,
  });
  vi.mocked(executeRuntimeTurn).mockResolvedValue({
    ...emptyProjection(),
    status: 'completed',
    content: '文章 A 的简明总结',
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
async function show(url = 'https://example.com/a') {
  await act(async () =>
    root.render(React.createElement(ToolWebview, { href: url, title: '文章' })),
  );
}
async function click(selector: string) {
  await act(async () => (container.querySelector(selector) as HTMLElement).click());
}

it('opens with webpage context and summary text, retains history on close and restores it after remount', async () => {
  await show();
  await click('[aria-label="打开网页 AI 对话"]');
  expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe(
    WEB_PAGE_SUMMARY_PROMPT,
  );
  expect(mocks.readWebPage).toHaveBeenCalledWith(expect.stringMatching(/^momo-tool-web-/));
  await click('[data-send]');
  expect(vi.mocked(executeRuntimeTurn).mock.calls[0][1]).toMatchObject({
    apiInput: expect.stringContaining('文章 A 的实际正文'),
    displayInput: WEB_PAGE_SUMMARY_PROMPT,
    rawIntent: WEB_PAGE_SUMMARY_PROMPT,
  });
  expect(vi.mocked(executeRuntimeTurn).mock.calls[0][1].history).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('文章 A 的实际正文'),
      }),
    ]),
  );
  const prefix = webPageChatIdentity('https://example.com/a').storageKeyPrefix;
  expect(localStorage.getItem(`${prefix}-sessions`)).toContain('文章 A 的简明总结');
  await click('[aria-label="关闭网页 AI 对话"]');
  expect((container.querySelector('[role="dialog"]') as HTMLElement).hidden).toBe(true);
  await click('[aria-label="打开网页 AI 对话"]');
  expect(container.querySelector('[data-history]')!.textContent).toContain('文章 A 的简明总结');
  await act(async () => root.unmount());
  root = createRoot(container);
  await show();
  await click('[aria-label="打开网页 AI 对话"]');
  expect(container.querySelector('[data-history]')!.textContent).toContain('文章 A 的简明总结');
  await show('https://example.com/b');
  await click('[aria-label="打开网页 AI 对话"]');
  expect(container.querySelector('[data-history]')!.textContent).not.toContain('文章 A 的简明总结');
});

it('maximizes within the webpage, restores size, and preserves the iframe, draft and history', async () => {
  await show();
  const frame = container.querySelector('iframe');
  await click('[aria-label="打开网页 AI 对话"]');
  const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
  const chat = container.querySelector('textarea');
  const initialClass = dialog.className;
  const maximize = container.querySelector('[aria-label="放大网页 AI 对话"]')!;
  expect(maximize.nextElementSibling?.getAttribute('aria-label')).toBe('关闭网页 AI 对话');
  await click('[aria-label="放大网页 AI 对话"]');
  expect(dialog.className).not.toBe(initialClass);
  expect(
    container.querySelector('[aria-label="还原网页 AI 对话"]')?.getAttribute('aria-pressed'),
  ).toBe('true');
  expect(container.querySelector('textarea')).toBe(chat);
  expect(container.querySelector('iframe')).toBe(frame);
  await click('[data-send]');
  await click('[aria-label="还原网页 AI 对话"]');
  expect(dialog.className).toBe(initialClass);
  expect(container.querySelector('[data-history]')!.textContent).toContain('文章 A 的简明总结');
});

it('shows extraction failure and blocks the model request when current content is unavailable', async () => {
  mocks.readWebPage.mockRejectedValue(new Error('网页尚未加载完成，请稍后重试'));
  await show();
  await click('[aria-label="打开网页 AI 对话"]');
  expect(container.querySelector('[role="alert"]')!.textContent).toContain('尚未加载完成');
  await click('[data-send]');
  expect(executeRuntimeTurn).not.toHaveBeenCalled();
});

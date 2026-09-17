// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatContextUsage } from './index';
const mocks = vi.hoisted(() => ({ messages: [] as any[], models: [] as any[] }));
vi.mock('antd', () => ({
  Popover: ({ content, children }: any) => React.createElement('div', null, content, children),
}));
vi.mock('../../contexts/ChatContext', () => ({
  useChatContext: () => ({ currentSession: { messages: mocks.messages }, currentModel: 'qwen' }),
}));
vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({ chatModels: mocks.models }),
}));
let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  mocks.models = [{ id: 'qwen', label: 'qwen3.8-flash', maxOutputTokens: 2048 }];
  mocks.messages = [];
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () => root.render(React.createElement(ChatContextUsage)));
}
describe('context usage panel', () => {
  it('shows the 1M reference window before the first turn', async () => {
    await render();
    expect(container.textContent).toContain('上下文已用 0%');
    expect(container.textContent).toContain('~0 / 1M');
  });
  it('uses the 1M estimate when a legacy snapshot has no verified model capacity', async () => {
    mocks.messages = [
      {
        contextUsage: {
          usedTokens: 37200,
          contextWindow: 128000,
          systemTokens: 196,
          toolsTokens: 2400,
          messageTokens: 17000,
        },
      },
    ];
    await render();
    expect(container.textContent).toContain('37.2K / 1M');
    expect(container.textContent).toContain('上下文已用 4%');
    expect(container.textContent).not.toContain('128K');
    expect(container.querySelector('button')?.getAttribute('aria-label')).toContain(
      '上下文已用 4%',
    );
  });
  it('shows a verified context capacity and the three requested breakdown rows', async () => {
    mocks.messages = [
      {
        contextUsage: {
          usedTokens: 19200,
          contextWindow: 1000000,
          contextWindowSource: 'model',
          maxOutputTokens: 2048,
          modelProfileId: 'qwen',
          systemTokens: 1700,
          toolsTokens: 6900,
          messageTokens: 1900,
        },
      },
    ];
    await render();
    expect(container.textContent).toContain('19.2K / 1M');
    expect(container.textContent).toContain('2%');
    expect(container.textContent).toContain('系统提示词');
    expect(container.textContent).toContain('工具定义');
    expect(container.textContent).toContain('对话消息');
    expect(container.textContent).not.toContain('单次输出上限');
  });
});

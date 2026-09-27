// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  agentMode: 'ask',
  setAgentMode: vi.fn(),
  generating: false,
  currentSession: null as { id: string; messages: Array<{ content: string }> } | null,
  clearSession: vi.fn(),
  error: vi.fn(),
  viewGeneration: {} as object | undefined,
}));
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { error: mocks.error } }) },
  Alert: () => null,
  Modal: ({ open, title, children, onCancel, onOk, okText, cancelText, okButtonProps }: any) =>
    open
      ? React.createElement(
          'div',
          { role: 'dialog', 'aria-label': title },
          children,
          React.createElement('button', { onClick: onCancel }, cancelText),
          React.createElement(
            'button',
            { onClick: onOk, disabled: okButtonProps?.disabled },
            okText,
          ),
        )
      : null,
  Input: () => null,
  Select: () => null,
  Button: ({ children, icon, ...props }: any) =>
    React.createElement('button', props, icon, children),
  Popover: ({ children, content, open, onOpenChange }: any) =>
    React.createElement(
      'div',
      null,
      onOpenChange
        ? React.cloneElement(children, { onClick: () => onOpenChange(!open) })
        : children,
      open ? content : null,
    ),
}));
vi.mock('../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    currentModel: 'model',
    currentSession: mocks.currentSession,
    clearSession: mocks.clearSession,
    setCurrentModel: vi.fn(),
    agentMode: mocks.agentMode,
    setAgentMode: mocks.setAgentMode,
  }),
}));
vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({
    chatModels: [{ id: 'model', label: '模型' }],
    viewGeneration: mocks.viewGeneration,
  }),
}));
vi.mock('../../hooks/useNoteReferenceTrigger', () => ({
  useNoteReferenceTrigger: () => ({ open: false, handleKeyDown: () => false }),
}));
vi.mock('../../hooks/useSlashCommandTrigger', () => ({
  useSlashCommandTrigger: () => ({ open: false, handleKeyDown: () => false }),
}));
vi.mock('../ChatContextUsage', () => ({ ChatContextUsage: () => null }));
vi.mock('../ChatMentionTextarea', () => ({ ChatMentionTextarea: () => null }));
vi.mock('../NoteReferencePopover', () => ({ NoteReferencePopover: () => null }));
vi.mock('../SlashCommandPopover', () => ({ SlashCommandPopover: () => null }));

import ChatInputPanel from './index';

describe('input mode menu', () => {
  let container: HTMLDivElement, root: Root;
  async function render(exportSession?: any) {
    await act(async () =>
      root.render(
        React.createElement(ChatInputPanel, {
          value: '',
          onChange: vi.fn(),
          onSend: vi.fn(),
          isGenerating: mocks.generating,
          exportSession,
        }),
      ),
    );
  }
  async function click(button: Element | null) {
    expect(button).not.toBeNull();
    await act(async () => (button as HTMLButtonElement).click());
  }
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    mocks.agentMode = 'ask';
    mocks.generating = false;
    mocks.setAgentMode.mockReset();
    mocks.currentSession = null;
    mocks.clearSession.mockReset().mockResolvedValue(undefined);
    mocks.error.mockReset();
    mocks.viewGeneration = {};
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('opens mode choices from +, selects plan or UI, and provides the matching close chip', async () => {
    await render();
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    const modeButton = Array.from(container.querySelectorAll('button[role="menuitem"]')).find(
      (button) => button.textContent?.startsWith('模式'),
    )!;
    expect(modeButton).toBeDefined();
    await click(modeButton);
    const options = Array.from(container.querySelectorAll('[aria-label="选择模式"] button'));
    expect(options.map((button) => button.textContent)).toEqual(['计划', '界面']);
    await click(options[0]);
    expect(mocks.setAgentMode).toHaveBeenLastCalledWith('plan');
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    await click(
      Array.from(container.querySelectorAll('button[role="menuitem"]')).find((button) =>
        button.textContent?.startsWith('模式'),
      )!,
    );
    await click(Array.from(container.querySelectorAll('[aria-label="选择模式"] button'))[1]);
    expect(mocks.setAgentMode).toHaveBeenLastCalledWith('ui');
    mocks.agentMode = 'ui';
    await render();
    await click(container.querySelector('button[aria-label="关闭界面模式"]'));
    expect(mocks.setAgentMode).toHaveBeenLastCalledWith('ask');
  });

  it('prevents changing modes while the current session is generating', async () => {
    mocks.generating = true;
    await render();
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    const modeButton = Array.from(container.querySelectorAll('button[role="menuitem"]')).find(
      (button) => button.textContent?.startsWith('模式'),
    ) as HTMLButtonElement;
    expect(modeButton.disabled).toBe(true);
    await click(modeButton);
    expect(container.querySelector('[aria-label="选择模式"]')).toBeNull();
  });

  async function openClearContext() {
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    const commands = Array.from(container.querySelectorAll('button[role="menuitem"]'));
    const compactIndex = commands.findIndex((button) => button.textContent?.startsWith('压缩'));
    expect(commands[compactIndex + 1].textContent).toContain('清除上下文');
    await click(commands[compactIndex + 1]);
  }

  it('requires confirmation and leaves the conversation untouched when cancelled', async () => {
    mocks.currentSession = { id: 'session', messages: [{ content: '已有问答' }] };
    await render();
    await openClearContext();
    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('所有问答记录将清空');
    expect(mocks.clearSession).not.toHaveBeenCalled();
    await click(dialog.querySelector('button'));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.clearSession).not.toHaveBeenCalled();
  });

  it('clears the confirmed session and closes the dialog only after success', async () => {
    mocks.currentSession = { id: 'session', messages: [{ content: '已有问答' }] };
    await render();
    await openClearContext();
    await click(container.querySelector('[role="dialog"] button:last-child'));
    expect(mocks.clearSession).toHaveBeenCalledExactlyOnceWith('session');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('keeps the confirmation open and reports a failure without claiming success', async () => {
    mocks.currentSession = { id: 'session', messages: [{ content: '已有问答' }] };
    mocks.clearSession.mockRejectedValue(new Error('运行时清除失败'));
    await render();
    await openClearContext();
    await click(container.querySelector('[role="dialog"] button:last-child'));
    expect(mocks.error).toHaveBeenCalledWith('运行时清除失败');
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('disables clearing empty or generating sessions while keeping the command visible', async () => {
    await render();
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    const findClearButton = () =>
      Array.from(container.querySelectorAll('button[role="menuitem"]')).find((button) =>
        button.textContent?.startsWith('清除上下文'),
      ) as HTMLButtonElement;
    expect(findClearButton().disabled).toBe(true);
    mocks.currentSession = { id: 'session', messages: [{ content: '已有问答' }] };
    mocks.generating = true;
    await render();
    expect(findClearButton().disabled).toBe(true);
    await click(findClearButton());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it.each([undefined, null, { id: 'standalone', messages: [{ content: '生成结果' }] }])(
    'shows the same complete + menu with exportSession=%s',
    async (exportSession) => {
      await render(exportSession);
      await click(container.querySelector('button[aria-label="添加与指令"]'));
      const commands = Array.from(container.querySelectorAll('button[role="menuitem"]'));
      expect(
        commands.map(
          (button) => button.querySelector('.harness-command-menu-command')?.textContent,
        ),
      ).toEqual([
        'file',
        'knowledge',
        'goal',
        'mode',
        'compact',
        'clear',
        'permission',
        'download',
      ]);
      expect((commands[2] as HTMLButtonElement).disabled).toBe(true);
      expect((commands[4] as HTMLButtonElement).disabled).toBe(true);
      expect((commands[6] as HTMLButtonElement).disabled).toBe(true);
    },
  );

  it('keeps UI mode visible but disabled when the host has no view generator', async () => {
    mocks.viewGeneration = undefined;
    await render(null);
    await click(container.querySelector('button[aria-label="添加与指令"]'));
    await click(
      Array.from(container.querySelectorAll('button[role="menuitem"]')).find((button) =>
        button.textContent?.startsWith('模式'),
      )!,
    );
    const options = Array.from(
      container.querySelectorAll('[aria-label="选择模式"] button'),
    ) as HTMLButtonElement[];
    expect(options.map((button) => button.textContent)).toEqual(['计划', '界面']);
    expect(options[0].disabled).toBe(false);
    expect(options[1].disabled).toBe(true);
    await click(options[1]);
    expect(mocks.setAgentMode).not.toHaveBeenCalled();
  });
});

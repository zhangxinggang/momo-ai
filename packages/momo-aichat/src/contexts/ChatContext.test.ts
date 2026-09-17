// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  chatState: {
    sessions: [] as Array<{
      id: string;
      isLoading?: boolean;
      messages: Array<{ isLoading?: boolean }>;
    }>,
  },
}));

vi.mock('../hooks/useChatSessions', () => ({
  useChatSessions: () => mocks.chatState,
}));

vi.mock('./AiChatConfigContext', () => ({
  AiChatConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { ChatProvider } from './ChatContext';

describe('ChatProvider generation observer', () => {
  let container: HTMLDivElement;
  let root: Root | null;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    mocks.chatState.sessions = [];
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    vi.unstubAllGlobals();
  });

  it('reports generation in any session and clears it on unmount', async () => {
    const onGenerationStateChange = vi.fn();
    const render = async () => {
      await act(async () => {
        root!.render(
          React.createElement(ChatProvider, {
            services: {} as never,
            onGenerationStateChange,
            children: React.createElement('div'),
          }),
        );
      });
    };

    await render();
    expect(onGenerationStateChange).toHaveBeenLastCalledWith(false);

    mocks.chatState.sessions = [
      { id: 'background', messages: [{ isLoading: true }] },
      { id: 'current', messages: [] },
    ];
    await render();
    expect(onGenerationStateChange).toHaveBeenLastCalledWith(true);

    await act(async () => root?.unmount());
    root = null;
    expect(onGenerationStateChange).toHaveBeenLastCalledWith(false);
  });
});

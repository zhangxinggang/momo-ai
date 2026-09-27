// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listKbCollections: vi.fn(),
}));

vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({
    listKbCollections: mocks.listKbCollections,
    skillBanner: null,
    agentAppBanner: null,
  }),
}));

vi.mock('../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    kbEnabled: true,
    kbCollectionId: 'kb-123456',
  }),
}));

import { ChatContextBanner } from './index';

describe('ChatContextBanner knowledge label', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('waits for the collection name instead of flashing its id', async () => {
    let resolveCollections!: (items: Array<{ id: string; name: string }>) => void;
    mocks.listKbCollections.mockReturnValue(
      new Promise((resolve) => {
        resolveCollections = resolve;
      }),
    );

    await act(async () => root.render(createElement(ChatContextBanner)));

    expect(container.textContent).not.toContain('kb-123456');
    expect(container.textContent).not.toContain('知识库 #');

    await act(async () => {
      resolveCollections([{ id: 'kb-123456', name: '产品知识库' }]);
    });

    expect(container.textContent).toContain('产品知识库');
    expect(container.textContent).not.toContain('kb-123456');
  });
});

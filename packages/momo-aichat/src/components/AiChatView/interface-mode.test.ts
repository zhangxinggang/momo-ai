// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';

vi.mock('antd', () => ({ App: { useApp: () => ({ message: {}, modal: {} }) } }));
vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({
    viewGeneration: {
      render: (message: any) =>
        React.createElement(
          'div',
          {
            'data-view-id': message.id,
          },
          message.generatedView.content,
        ),
    },
  }),
}));
vi.mock('../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    agentMode: 'ui',
    currentSessionId: 'current',
    isSessionGenerating: () => false,
    currentSession: {
      messages: [
        { id: 'old-user', role: 'user', content: '原来的问题' },
        { id: 'old-answer', role: 'assistant', content: '原来的回答' },
        { id: 'ui-user', role: 'user', content: '创建界面' },
        {
          id: 'ui-answer',
          role: 'assistant',
          content: '第一版源码',
          generatedView: { content: '第一版界面' },
        },
        { id: 'update-user', role: 'user', content: '修改界面' },
        {
          id: 'update-answer',
          role: 'assistant',
          content: '第二版源码',
          generatedView: { content: '第二版界面' },
        },
      ],
    },
  }),
}));
vi.mock('../ChatInputPanel', () => ({ default: () => null }));
vi.mock('../MarkdownRenderer', () => ({
  default: ({ content }: any) => React.createElement('div', null, content),
}));
vi.mock('../ChatContextBanner', () => ({ ChatContextBanner: () => null }));
vi.mock('../CitationCard', () => ({ default: () => null }));
vi.mock('../NoteReferenceText', () => ({
  NoteReferenceText: ({ content }: any) => React.createElement('div', null, content),
}));
vi.mock('../MessageCopyAction', () => ({ MessageCopyAction: () => null }));
vi.mock('../MessageUserActions', () => ({ MessageUserActions: () => null }));
vi.mock('../CollapsibleThinking', () => ({ default: () => null }));
vi.mock('../RunTimeline', () => ({ RunTimeline: () => null }));

import { AiChatView } from './index';

it('renders all ordinary chat messages and all UI versions together in interface mode', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(React.createElement(AiChatView)));
    for (const text of [
      '原来的问题',
      '原来的回答',
      '创建界面',
      '修改界面',
      '第一版界面',
      '第二版界面',
    ]) {
      expect(container.textContent).toContain(text);
    }
    expect(container.querySelectorAll('[data-view-id]')).toHaveLength(2);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

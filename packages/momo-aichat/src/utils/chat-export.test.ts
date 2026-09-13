import { describe, expect, it } from 'vitest';

import type { IChatMessage } from '../types/chat';
import { buildChatTurnExport } from './chat-export';

describe('buildChatTurnExport', () => {
  it('exports the visible turn, expanded request and execution details', () => {
    const userMessage: IChatMessage = {
      id: 'u1',
      role: 'user',
      content: '实现登录页',
      timestamp: 1,
      invocation: {
        resourceId: 'application-skill:1',
        resourceRevision: 'r1',
        command: '/frontend',
        label: '前端开发',
        kind: 'skill',
        scope: 'application',
        category: 'dev',
      },
      requestSnapshot: {
        apiContent: '完整技能正文\n\n实现登录页',
        modelId: 'model-1',
        temperature: 0.2,
        topP: 0.9,
        systemPrompt: '',
        kbEnabled: false,
        agentMode: 'plan',
        createdAt: 1,
      },
    };
    const assistantMessage: IChatMessage = {
      id: 'a1',
      role: 'assistant',
      content: '已完成。',
      thinkingContent: '分析需求。',
      timestamp: 2,
      stats: {
        model: 'model-1',
        responseTime: '1.2s',
        totalTokens: 20,
        promptTokens: 15,
        completionTokens: 5,
      },
    };

    const result = buildChatTurnExport({
      sessionTitle: '登录功能',
      userMessage,
      assistantMessage,
      exportedAt: new Date('2026-09-13T00:00:00Z'),
    });

    expect(result).toContain('前端开发');
    expect(result).toContain('完整技能正文');
    expect(result).toContain('分析需求。');
    expect(result).toContain('Prompt Tokens | 15');
    expect(result).toContain('已完成。');
  });
});

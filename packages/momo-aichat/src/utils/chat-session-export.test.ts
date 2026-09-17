import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import type { IChatSession } from '../types/chat';
import { buildChatSessionExport } from './chat-session-export';

describe('chat session log ZIP', () => {
  it('preserves every turn, unfinished question, system message and native event', () => {
    const session = {
      id: 'session-1',
      title: '完整日志',
      createdAt: 1,
      updatedAt: 4,
      messages: [
        { id: 's', role: 'system', content: '系统规则', timestamp: 1 },
        { id: 'u1', role: 'user', content: '第一个问题', timestamp: 2 },
        {
          id: 'a1',
          role: 'assistant',
          content: '第一个回答',
          timestamp: 3,
          thinkingContent: '思考内容',
          runId: 'run-1',
          runtimeEvents: [{ type: 'context.updated', payload: { usedTokens: 20 } }],
        },
        { id: 'u2', role: 'user', content: '待回答的问题', timestamp: 4 },
      ],
    } as IChatSession;
    const before = JSON.stringify(session);
    const exportedAt = new Date('2026-09-18T00:00:00Z');
    const files = unzipSync(buildChatSessionExport(session, exportedAt));
    expect(Object.keys(files)).toEqual(['conversation.md', 'session.json']);
    const markdown = strFromU8(files['conversation.md']);
    for (const text of ['系统规则', '第一个问题', '第一个回答', '思考内容', '待回答的问题'])
      expect(markdown).toContain(text);
    expect(JSON.parse(strFromU8(files['session.json']))).toEqual({
      exportedAt: exportedAt.toISOString(),
      session,
    });
    expect(JSON.stringify(session)).toBe(before);
  });
  it('includes the complete host journal, even events omitted from the UI projection', () => {
    const session = {
      id: 's',
      title: '日志',
      messages: [],
      createdAt: 1,
      updatedAt: 1,
    } as IChatSession;
    const runtimeLog = {
      runs: [
        {
          events: [
            {
              type: 'runtime.event',
              payload: { nativeType: 'compaction/summary', data: { content: 'summary' } },
            },
          ],
        },
      ],
    };
    const files = unzipSync(buildChatSessionExport(session, new Date('2026-09-18'), runtimeLog));
    expect(JSON.parse(strFromU8(files['harness-log.json']))).toEqual(runtimeLog);
  });
});

import type { RunEvent } from '@momo/agent-contracts';
import { describe, expect, it } from 'vitest';
import { formatResponseTime, normalizeChatUsage, resolveResponseTime } from './chat-stats';

function runEvent(type: RunEvent['type'], timestamp: number): RunEvent {
  return {
    eventSchemaVersion: '1',
    eventId: `${type}-${timestamp}`,
    projectId: 'project',
    sessionId: 'session',
    turnId: 'turn',
    runId: 'run',
    seq: timestamp,
    timestamp,
    type,
    payload: {},
  };
}

describe('chat stats', () => {
  it('normalizes Harness and provider usage shapes', () => {
    expect(normalizeChatUsage({ inputTokens: 12, outputTokens: 8 })).toEqual({
      promptTokens: 12,
      completionTokens: 8,
      totalTokens: 20,
    });
    expect(
      normalizeChatUsage({ prompt_tokens: 10, completion_tokens: 5, total_tokens: 16 }),
    ).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 16 });
  });

  it('formats elapsed time consistently', () => {
    expect(formatResponseTime(1234)).toBe('1.23s');
  });

  it('keeps a saved response time', () => {
    expect(
      resolveResponseTime('11.22s', [runEvent('run.started', 100), runEvent('run.completed', 200)]),
    ).toBe('11.22s');
  });

  it('recovers a missing response time from persisted Harness events', () => {
    expect(
      resolveResponseTime('', [
        runEvent('run.started', 1_000),
        runEvent('assistant.commit', 2_000),
        runEvent('run.completed', 12_220),
      ]),
    ).toBe('11.22s');
  });

  it('does not show a changing duration before the run has settled', () => {
    expect(
      resolveResponseTime('', [runEvent('run.started', 1_000), runEvent('assistant.delta', 2_000)]),
    ).toBeUndefined();
  });
});

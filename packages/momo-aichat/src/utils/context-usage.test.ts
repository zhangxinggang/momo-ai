import { describe, expect, it } from 'vitest';
import type { IChatMessage } from '../types/chat';
import {
  contextUsagePercent,
  estimateSessionContextUsage,
  estimateTextTokens,
  formatContextTokens,
  latestContextUsage,
  parseContextUsage,
} from './context-usage';

const usage = {
  usedTokens: 19200,
  contextWindow: 1_000_000,
  contextWindowSource: 'model' as const,
  systemTokens: 1700,
  toolsTokens: 6900,
  messageTokens: 1900,
};

describe('context usage', () => {
  it('uses the latest session snapshot instead of cumulative billed tokens', () => {
    const messages = [
      { contextUsage: usage },
      { contextUsage: { ...usage, usedTokens: 21000 } },
      { stats: { totalTokens: 999999 } },
    ] as IChatMessage[];
    expect(latestContextUsage(messages)?.usedTokens).toBe(21000);
    expect(latestContextUsage([])).toBeUndefined();
  });
  it('rejects invalid native snapshots without creating a percentage', () => {
    expect(parseContextUsage(usage)).toEqual(usage);
    for (const invalid of [
      { ...usage, contextWindow: 0 },
      { ...usage, usedTokens: NaN },
      { ...usage, toolsTokens: -1 },
      { usedTokens: 50 },
    ]) {
      expect(parseContextUsage(invalid)).toBeUndefined();
    }
  });
  it('does not use configured output limits or legacy capacities as context denominators', () => {
    const legacy = parseContextUsage({
      ...usage,
      usedTokens: 37200,
      contextWindow: 128000,
      contextWindowSource: undefined,
    });
    expect(legacy?.contextWindowSource).toBe('unknown');
    expect(contextUsagePercent(legacy)).toBeUndefined();
    const current = parseContextUsage({
      ...usage,
      contextWindow: undefined,
      contextWindowSource: 'unknown',
      maxOutputTokens: 2048,
    });
    expect(current?.maxOutputTokens).toBe(2048);
    expect(current?.contextWindow).toBeUndefined();
    expect(contextUsagePercent(current)).toBeUndefined();
    expect(contextUsagePercent(parseContextUsage(usage))).toBe(2);
    expect(parseContextUsage({ ...usage, maxOutputTokens: -1 })).toBeUndefined();
    const messages = [
      { contextUsage: { ...usage, modelProfileId: 'other' } },
      { contextUsage: { ...usage, modelProfileId: 'qwen', maxOutputTokens: 2048 } },
    ] as IChatMessage[];
    expect(latestContextUsage(messages, 'qwen')?.maxOutputTokens).toBe(2048);
    expect(latestContextUsage(messages, 'absent')).toBeUndefined();
  });
  it('formats small, thousand and million token counts', () => {
    expect([0, 950, 19200, 1_000_000].map(formatContextTokens)).toEqual([
      '0',
      '950',
      '19.2K',
      '1M',
    ]);
  });
  it('estimates mixed UTF-8 text using the documented Chinese and English byte ranges', () => {
    expect(estimateTextTokens('中'.repeat(750))).toBe(1000);
    expect(estimateTextTokens('a'.repeat(4500))).toBe(1000);
    const estimated = estimateSessionContextUsage([
      { id: 's', role: 'system', content: '中'.repeat(75), timestamp: 1 },
      { id: 'u', role: 'user', content: 'a'.repeat(450), timestamp: 2 },
    ]);
    expect(estimated).toMatchObject({
      usedTokens: 200,
      systemTokens: 100,
      toolsTokens: 0,
      messageTokens: 100,
      contextWindow: 1_000_000,
      contextWindowSource: 'estimate',
    });
  });
});

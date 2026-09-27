import { describe, expect, it } from 'vitest';

import {
  MAX_CHAT_OUTPUT_TOKENS,
  MIN_CHAT_OUTPUT_TOKENS,
  normalizeChatMaxTokens,
} from './token-limits';

describe('normalizeChatMaxTokens', () => {
  it('keeps valid integer values', () => {
    expect(normalizeChatMaxTokens(32_768)).toBe(32_768);
  });

  it('clamps persisted values to the API-supported range', () => {
    expect(normalizeChatMaxTokens(0)).toBe(MIN_CHAT_OUTPUT_TOKENS);
    expect(normalizeChatMaxTokens(1_000_000)).toBe(MAX_CHAT_OUTPUT_TOKENS);
  });

  it('uses a safe fallback for invalid values and removes decimals', () => {
    expect(normalizeChatMaxTokens(undefined, 4096)).toBe(4096);
    expect(normalizeChatMaxTokens(Number.NaN, 4096)).toBe(4096);
    expect(normalizeChatMaxTokens(2048.9)).toBe(2048);
  });
});

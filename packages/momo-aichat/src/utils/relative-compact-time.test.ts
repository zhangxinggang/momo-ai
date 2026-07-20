import { describe, expect, it } from 'vitest';

import { formatRelativeCompact } from './relative-compact-time';

const now = Date.parse('2026-08-29T12:00:00.000Z');

describe('formatRelativeCompact', () => {
  it('2h30m → 2h', () => {
    expect(formatRelativeCompact(now - (2 * 3600 + 30 * 60) * 1000, now)).toBe('2h');
  });
  it('天', () => {
    expect(formatRelativeCompact(now - 3 * 24 * 3600 * 1000, now)).toBe('3d');
  });
  it('月（按 30 天）', () => {
    expect(formatRelativeCompact(now - 60 * 24 * 3600 * 1000, now)).toBe('2mo');
  });
  it('年（按 365 天）', () => {
    expect(formatRelativeCompact(now - 400 * 24 * 3600 * 1000, now)).toBe('1ye');
  });
});

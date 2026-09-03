import { describe, expect, it } from 'vitest';

import { extractSlashTrigger } from './useSlashCommandTrigger';

describe('extractSlashTrigger', () => {
  it('recognizes a command at the beginning of input', () => {
    expect(extractSlashTrigger('/review', 7)).toEqual({
      query: 'review',
      start: 0,
      end: 7,
    });
  });

  it('recognizes the command at the current caret boundary', () => {
    const value = '请检查 /rev 后面的文字';
    expect(extractSlashTrigger(value, 8)).toEqual({
      query: 'rev',
      start: 4,
      end: 8,
    });
  });

  it('does not treat a path or inline slash as a command', () => {
    expect(extractSlashTrigger('src/components/', 15)).toBeNull();
    expect(extractSlashTrigger('https://example.com/', 20)).toBeNull();
  });

  it('uses the supplied caret instead of the end of the input', () => {
    expect(extractSlashTrigger('/code more text', 5)).toEqual({
      query: 'code',
      start: 0,
      end: 5,
    });
  });
});

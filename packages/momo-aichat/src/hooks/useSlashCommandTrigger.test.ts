import { describe, expect, it } from 'vitest';

import { findSlashInvocationTokens, slashTokensToPlainText } from '../utils/slash-token';
import { extractSlashTrigger, insertSlashSelection } from './useSlashCommandTrigger';

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

  it('supports localized momo-ai skill names', () => {
    expect(extractSlashTrigger('/前端开发', 5)).toEqual({
      query: '前端开发',
      start: 0,
      end: 5,
    });
  });
});

describe('insertSlashSelection', () => {
  const skill = {
    resourceId: 'application-skill:review',
    resourceRevision: 'rev-1',
    command: '/review',
    label: '代码审查',
    kind: 'skill' as const,
    scope: 'application' as const,
  };

  it('inserts at the trigger position without moving the resource to the beginning', () => {
    const value = '请先 /rev 再修复';
    const match = extractSlashTrigger(value, 7);
    expect(match).not.toBeNull();

    const result = insertSlashSelection(value, match!, skill);

    expect(result.value.startsWith('请先 ')).toBe(true);
    expect(result.value.endsWith(' 再修复')).toBe(true);
    expect(slashTokensToPlainText(result.value)).toBe('请先 /代码审查 再修复');
    expect(result.cursor).toBe(result.value.indexOf(' 再修复'));
  });

  it('keeps multiple independently selected resources in one message', () => {
    const firstMatch = extractSlashTrigger('/rev 第一段', 4)!;
    const first = insertSlashSelection('/rev 第一段', firstMatch, skill);
    const withSecondTrigger = `${first.value}，再用 /test`;
    const secondMatch = extractSlashTrigger(withSecondTrigger, withSecondTrigger.length)!;
    const second = insertSlashSelection(withSecondTrigger, secondMatch, {
      ...skill,
      resourceId: 'agent-command:test',
      command: '/test',
      label: '运行测试',
      kind: 'command',
      scope: 'project',
    });

    expect(findSlashInvocationTokens(second.value)).toHaveLength(2);
    expect(slashTokensToPlainText(second.value)).toContain('/代码审查 第一段，再用 /运行测试');
  });
});

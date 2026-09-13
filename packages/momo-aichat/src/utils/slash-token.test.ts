import { describe, expect, it } from 'vitest';

import type { ISlashInvocation } from '../types/slash-command';
import {
  extractAtQuery,
  parseNoteReferenceContent,
  surfaceToValue,
  valueIndexToSurfaceIndex,
  valueToSurface,
} from './note-mention';
import {
  buildSlashInvocationToken,
  findSlashInvocationTokens,
  removeSlashInvocationTokenAt,
  slashTokensToPlainText,
} from './slash-token';

const skill: ISlashInvocation = {
  resourceId: 'application-skill:frontend',
  resourceRevision: 'rev-1',
  command: '/frontend',
  label: '前端开发',
  kind: 'skill',
  scope: 'application',
};

describe('inline slash tokens', () => {
  it('round-trips multiple tokens through the textarea surface', () => {
    const first = buildSlashInvocationToken(skill);
    const second = buildSlashInvocationToken({
      ...skill,
      resourceId: 'command:test',
      command: '/test',
      label: '运行测试',
      kind: 'command',
      scope: 'project',
    });
    const value = `先分析 ${first}，然后 ${second} 并总结`;
    const surface = valueToSurface(value);

    expect(surface).toContain('前端开发');
    expect(surface).toContain('运行测试');
    expect(surfaceToValue(surface, value)).toBe(value);
    expect(findSlashInvocationTokens(value)).toHaveLength(2);
    expect(slashTokensToPlainText(value)).toBe('先分析 /前端开发，然后 /运行测试 并总结');
    expect(valueIndexToSurfaceIndex(value, value.length)).toBe(surface.length);
  });

  it('removes only the token at the caret', () => {
    const first = buildSlashInvocationToken(skill);
    const second = buildSlashInvocationToken({ ...skill, resourceId: 'application-skill:docs' });
    const value = `A${first}B${second}C`;

    expect(removeSlashInvocationTokenAt(value, first.length + 1)).toBe(`AB${second}C`);
  });

  it('parses text, note mentions and slash resources in document order', () => {
    const token = buildSlashInvocationToken(skill);
    const segments = parseNoteReferenceContent(`开头 ${token} 再看 @[note:docs/a.md]`);

    expect(segments.map((segment) => segment.type)).toEqual(['text', 'slash', 'text', 'mention']);
  });

  it('does not reopen the note selector from the @ inside a slash token', () => {
    const token = buildSlashInvocationToken(skill);
    expect(extractAtQuery(token, token.length)).toBeNull();
  });
});

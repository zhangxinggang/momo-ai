import { describe, expect, it } from 'vitest';

import { buildNoteMentionToken } from '../../../utils/note-mention';
import {
  editorSegmentsToValue,
  findSegmentAtValueIndex,
  getSegmentCursorIndex,
  valueToEditorSegments,
} from './editor-value';

describe('valueToEditorSegments / editorSegmentsToValue', () => {
  it('纯文本往返', () => {
    const value = 'hello\nworld';
    expect(editorSegmentsToValue(valueToEditorSegments(value))).toBe(value);
  });

  it('文本 + mention + 换行往返', () => {
    const token = buildNoteMentionToken('a/b.md');
    const value = `看 ${token}\n继续`;
    const segments = valueToEditorSegments(value);
    expect(segments).toEqual([
      { type: 'text', text: '看 ' },
      { type: 'mention', path: 'a/b.md' },
      { type: 'linebreak' },
      { type: 'text', text: '继续' },
    ]);
    expect(editorSegmentsToValue(segments)).toBe(value);
  });

  it('半截非法 token 当普通文本', () => {
    const value = 'x @[note:incomplete';
    expect(editorSegmentsToValue(valueToEditorSegments(value))).toBe(value);
    expect(valueToEditorSegments(value).every((s) => s.type !== 'mention')).toBe(true);
  });
});

describe('选区索引映射', () => {
  it('光标在 mention 后映射到 token 结束', () => {
    const token = buildNoteMentionToken('n.md');
    const value = `前${token}后`;
    const segments = valueToEditorSegments(value);
    // mention 段 index=1，offset 视为整块（用 1 表示块后）
    const idx = getSegmentCursorIndex(segments, 1, 1);
    expect(idx).toBe('前'.length + token.length);
    const located = findSegmentAtValueIndex(segments, idx);
    expect(located.segmentIndex).toBe(2);
    expect(located.offset).toBe(0);
  });
});

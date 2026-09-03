import { describe, expect, it } from 'vitest';
import { buildNoteRewriteMessages, unwrapFullDocumentFence } from './rewrite';

describe('unwrapFullDocumentFence', () => {
  it('unwraps a full-document markdown fence', () => {
    expect(unwrapFullDocumentFence('```markdown\n# 标题\n正文\n```')).toBe('# 标题\n正文');
  });

  it('keeps unfenced text', () => {
    expect(unwrapFullDocumentFence('# 标题\n正文')).toBe('# 标题\n正文');
  });
});

describe('buildNoteRewriteMessages', () => {
  it('marks empty notes in the system prompt', () => {
    const messages = buildNoteRewriteMessages('   ', '缩短');
    expect(messages[0]?.content).toContain('（当前笔记为空）');
    expect(messages[1]).toEqual({ role: 'user', content: '缩短' });
  });
});

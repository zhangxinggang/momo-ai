import { describe, expect, it } from 'vitest';

import { asksForWorkspaceTree, extractGrepKeywords } from './keyword-extract';

describe('workspace query parsing', () => {
  it('extracts explicit paths and identifiers without a product keyword table', () => {
    const keywords = extractGrepKeywords('检查 `ChatInputPanel` 和 src/chat/index.ts');
    expect(keywords).toContain('ChatInputPanel');
    expect(keywords).toContain('src/chat/index.ts');
  });

  it('requests a tree only for an explicit structure question', () => {
    expect(asksForWorkspaceTree('请展示项目目录结构')).toBe(true);
    expect(asksForWorkspaceTree('修复 ChatInputPanel')).toBe(false);
  });
});

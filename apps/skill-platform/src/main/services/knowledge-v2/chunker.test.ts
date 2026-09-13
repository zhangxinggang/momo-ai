import { describe, expect, it } from 'vitest';

import { createChunks, estimateTokens } from './chunker';
import { KnowledgeError } from './error';
import type { ICanonicalDocument } from './parser';

const document: ICanonicalDocument = {
  parserId: 'momo-text-v2',
  parserVersion: '2',
  mime: 'text/markdown',
  title: '产品手册',
  content: '# 安装\n\n第一步。\n\n第二步。\n\n# 卸载\n\n删除程序。',
  contentHash: 'hash',
  qualityScore: 1,
  notices: [],
  counts: { pages: 0, tables: 0, images: 0, elements: 4 },
  elements: [
    { id: 'h1', type: 'heading', text: '安装', headingPath: ['安装'] },
    { id: 'p1', type: 'paragraph', text: '第一步。\n\n第二步。', headingPath: ['安装'] },
    { id: 'h2', type: 'heading', text: '卸载', headingPath: ['卸载'] },
    { id: 'p2', type: 'paragraph', text: '删除程序。', headingPath: ['卸载'] },
  ],
};

describe('knowledge v2 chunker', () => {
  it('creates traceable parent-child chunks and deterministic stable keys', () => {
    const first = createChunks(document, {
      separator: '\n\n',
      maxChunkLength: 80,
      chunkOverlap: 10,
      preprocess: { normalizeWhitespace: true, removeUrlsAndEmails: false },
      splitMode: 'code',
    });
    const second = createChunks(document, {
      separator: '\n\n',
      maxChunkLength: 80,
      chunkOverlap: 10,
      preprocess: { normalizeWhitespace: true, removeUrlsAndEmails: false },
      splitMode: 'code',
    });

    const parents = first.filter((chunk) => chunk.kind === 'parent');
    const children = first.filter((chunk) => chunk.kind === 'child');
    expect(parents).toHaveLength(2);
    expect(
      children.every((chunk) => parents.some((parent) => parent.id === chunk.parentChunkId)),
    ).toBe(true);
    expect(first.map((chunk) => chunk.stableKey)).toEqual(second.map((chunk) => chunk.stableKey));
    expect(children.every((chunk) => chunk.tokenCount === estimateTokens(chunk.content))).toBe(
      true,
    );
  });

  it('fails explicitly when an unsupported LLM split is requested', () => {
    expect(() =>
      createChunks(document, {
        separator: '\n\n',
        maxChunkLength: 320,
        chunkOverlap: 40,
        preprocess: { normalizeWhitespace: true, removeUrlsAndEmails: false },
        splitMode: 'llm',
      }),
    ).toThrowError(KnowledgeError);
  });
});

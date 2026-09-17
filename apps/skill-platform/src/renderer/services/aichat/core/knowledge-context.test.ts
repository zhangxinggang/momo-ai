import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listCollections: vi.fn(),
  retrieveForChat: vi.fn(),
}));

vi.mock('@renderer/services/kb', () => ({
  kbListCollections: mocks.listCollections,
  kbRetrieveForChat: mocks.retrieveForChat,
}));

import { retrieveKnowledgeContext } from './knowledge-context';

describe('retrieveKnowledgeContext', () => {
  beforeEach(() => {
    mocks.listCollections.mockReset();
    mocks.retrieveForChat.mockReset();
  });

  it('passes an empty knowledge base reason to the model instead of failing the turn', async () => {
    mocks.retrieveForChat.mockResolvedValue({
      status: 'no_match',
      query: '问题',
      evidence: [],
      citations: [],
      context: '所选知识库暂无可检索内容或尚未完成首次索引。',
    });

    const result = await retrieveKnowledgeContext([{ role: 'user', content: '问题' }], {
      kb_enabled: true,
      kb_collection_id: 'empty-collection',
    });

    expect(result.citations).toEqual([]);
    expect(result.knowledgeSystemPrompt).toContain('尚未完成首次索引');
    expect(result.knowledgeSystemPrompt).toContain('不要依据常识猜测或编造答案');
  });
});

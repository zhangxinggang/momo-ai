import type { IKbRetrievalRequest } from '@/types/modules/kb';
import { describe, expect, it, vi } from 'vitest';

import { KnowledgeError } from './error';
import { KnowledgeV2Service } from './service';

const request: IKbRetrievalRequest = {
  query: '空知识库还能问答吗？',
  collectionIds: ['empty-collection'],
  topK: 6,
  contextTokenBudget: 6_000,
  mode: 'balanced',
  rerank: 'off',
  embedding: {
    apiKey: 'test-key',
    baseUrl: 'https://example.com/v1',
    model: 'test-embedding',
  },
  trace: true,
};

function serviceWithRetrieval(retrieve: () => Promise<never>): KnowledgeV2Service {
  return Object.assign(Object.create(KnowledgeV2Service.prototype), {
    retrieval: { retrieve: vi.fn(retrieve) },
  }) as KnowledgeV2Service;
}

describe('KnowledgeV2Service chat retrieval', () => {
  it('treats a knowledge base without a ready index as no matching evidence', async () => {
    const service = serviceWithRetrieval(async () => {
      throw new KnowledgeError({
        code: 'INDEX_NOT_READY',
        stage: 'retrieve',
        message: '所选知识库尚未完成首次索引',
        allowedManualActions: ['reimport'],
      });
    });

    await expect(service.retrieveForChat(request)).resolves.toEqual({
      status: 'no_match',
      query: request.query,
      evidence: [],
      citations: [],
      context: '所选知识库暂无可检索内容或尚未完成首次索引。',
    });
  });

  it('keeps real retrieval failures visible to the chat caller', async () => {
    const error = new KnowledgeError({
      code: 'EMBEDDING_PROFILE_MISMATCH',
      stage: 'embedding',
      message: '嵌入配置不一致',
      allowedManualActions: ['reconfigure'],
    });
    const service = serviceWithRetrieval(async () => {
      throw error;
    });

    await expect(service.retrieveForChat(request)).rejects.toBe(error);
  });

  it('keeps index readiness strict for non-chat retrieval', async () => {
    const error = new KnowledgeError({
      code: 'INDEX_NOT_READY',
      stage: 'retrieve',
      message: '所选知识库尚未完成首次索引',
      allowedManualActions: ['reimport'],
    });
    const service = serviceWithRetrieval(async () => {
      throw error;
    });

    await expect(service.retrieve(request)).rejects.toBe(error);
  });
});

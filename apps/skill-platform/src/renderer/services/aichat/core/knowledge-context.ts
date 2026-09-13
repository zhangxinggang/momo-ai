import type { IChatStreamMessage } from '@momo/aichat';

import { kbListCollections, kbRetrieveForChat } from '@renderer/services/kb';
import type { IAIModelConfig } from '@renderer/types/settings';

const DEFAULT_TOP_K = 6;
const DEFAULT_CONTEXT_TOKEN_BUDGET = 6_000;

export interface IKnowledgeCitation {
  title?: string;
  preview?: string;
  collectionId?: string;
  collectionName?: string;
  revisionId?: string;
  docId: string;
  chunkId: string;
  score?: number;
  idx?: number;
}

export interface IKnowledgeStreamOptions {
  kb_enabled?: boolean;
  kb_collection_id?: string;
  kb_top_k?: number;
  kb_ai_models?: IAIModelConfig[];
  raw_user_query?: string;
}

/** Executes one retrieval request for the entire selected scope before the model starts. */
export async function retrieveKnowledgeContext(
  messages: IChatStreamMessage[],
  streamOptions?: IKnowledgeStreamOptions,
): Promise<{ knowledgeSystemPrompt: string; citations: IKnowledgeCitation[] }> {
  if (!streamOptions?.kb_enabled) {
    return { knowledgeSystemPrompt: '', citations: [] };
  }

  const query =
    streamOptions.raw_user_query?.trim() ||
    [...messages]
      .reverse()
      .find((message) => message.role === 'user')
      ?.content.trim() ||
    '';
  if (!query) throw new Error('知识库检索问题不能为空');

  const collectionIds = streamOptions.kb_collection_id
    ? [streamOptions.kb_collection_id]
    : (await kbListCollections()).map((collection) => collection.id);
  if (!collectionIds.length) throw new Error('没有可用于对话检索的知识库');

  const result = await kbRetrieveForChat(
    {
      query,
      conversation: messages
        .filter(
          (message): message is IChatStreamMessage & { role: 'user' | 'assistant' } =>
            message.role === 'user' || message.role === 'assistant',
        )
        .slice(-8)
        .map((message) => ({ role: message.role, content: message.content })),
      collectionIds,
      topK: Math.max(1, Math.min(streamOptions.kb_top_k ?? DEFAULT_TOP_K, 20)),
      contextTokenBudget: DEFAULT_CONTEXT_TOKEN_BUDGET,
      mode: 'balanced',
      rerank: 'off',
      trace: true,
    },
    streamOptions.kb_ai_models ? { aiModels: streamOptions.kb_ai_models } : undefined,
  );

  if (result.status === 'no_match') {
    return {
      knowledgeSystemPrompt:
        '知识库检索已成功完成，但当前知识库中没有达到相关性要求的证据。请明确告诉用户知识库中没有足够信息，不要依据常识猜测或编造答案。',
      citations: [],
    };
  }

  return {
    knowledgeSystemPrompt: result.context,
    citations: result.citations.map((citation, index) => ({
      title: citation.title,
      preview: citation.preview,
      collectionId: citation.collectionId,
      collectionName: citation.collectionName,
      revisionId: citation.revisionId,
      docId: citation.documentId,
      chunkId: citation.chunkId,
      score: citation.finalScore,
      idx: result.evidence[index]?.idx,
    })),
  };
}

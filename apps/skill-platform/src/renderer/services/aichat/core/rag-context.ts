import type { IKbSearchItem } from '@/types/modules/kb';
import type { IChatStreamMessage, IKbChunk } from '@momo/aichat';

import { kbListCollections, kbSearch } from '@renderer/services/kb';
import type { IAIModelConfig } from '@renderer/types/settings';

import { generateOptimizedRagPrompt } from './rag-prompt-optimizer';
import type { IRagContextItem } from './rag-prompts';

export interface IRagCitation {
  title?: string;
  preview?: string;
  docId: number;
  chunkId: number;
  score?: number;
  idx?: number;
}

export interface IRagStreamOptions {
  kb_enabled?: boolean;
  kb_collection_id?: number;
  kb_top_k?: number;
  /** 可选：注入嵌入模型列表，供知识库检索使用 */
  kb_ai_models?: IAIModelConfig[];
}

/** RAG 检索结果缓存，供引用卡片查看原文 */
export const kbChunkCache = new Map<number, IKbChunk>();

function toRagContextItems(items: IKbSearchItem[]): IRagContextItem[] {
  return items.map((item) => {
    kbChunkCache.set(item.chunkId, {
      docName: item.docName,
      idx: item.idx,
      tokens: Math.ceil(item.content.length / 4),
      content: item.content,
    });
    return {
      text: item.content,
      file_name: item.docName,
      score: item.rerankScore ?? item.score,
    };
  });
}

async function searchAllCollections(
  query: string,
  topK: number,
  aiModels?: IAIModelConfig[],
): Promise<IKbSearchItem[]> {
  const collections = await kbListCollections();
  if (!collections.length) {
    return [];
  }
  const merged: IKbSearchItem[] = [];
  const embeddingOptions = aiModels ? { aiModels } : undefined;
  for (const col of collections) {
    try {
      const items = await kbSearch(col.id, query, topK, embeddingOptions);
      merged.push(...items);
    } catch {
      // 单个知识库检索失败时跳过
    }
  }
  merged.sort((a, b) => (b.rerankScore ?? b.score ?? 0) - (a.rerankScore ?? a.score ?? 0));
  return merged.slice(0, topK);
}

async function searchSingleCollection(
  collectionId: number,
  query: string,
  topK: number,
  aiModels?: IAIModelConfig[],
): Promise<IKbSearchItem[]> {
  try {
    return await kbSearch(collectionId, query, topK, aiModels ? { aiModels } : undefined);
  } catch {
    return [];
  }
}

/** 根据 RAG 配置检索知识库并生成系统提示词与引用列表 */
export async function buildRagContext(
  messages: IChatStreamMessage[],
  streamOptions?: IRagStreamOptions,
): Promise<{ ragSystemPrompt: string; citations: IRagCitation[] }> {
  const kbEnabled = !!streamOptions?.kb_enabled;
  const topK = streamOptions?.kb_top_k ?? 10;
  const userQuery =
    [...messages]
      .reverse()
      .find((m) => m.role === 'user' && m.content.trim())
      ?.content.trim() || '';

  if (!kbEnabled || !userQuery) {
    return { ragSystemPrompt: '', citations: [] };
  }

  const aiModels = streamOptions?.kb_ai_models;
  let ragItems: IKbSearchItem[] = [];
  if (streamOptions?.kb_collection_id) {
    ragItems = await searchSingleCollection(
      streamOptions.kb_collection_id,
      userQuery,
      topK,
      aiModels,
    );
  } else {
    ragItems = await searchAllCollections(userQuery, topK, aiModels);
  }

  if (!ragItems.length) {
    return { ragSystemPrompt: '', citations: [] };
  }

  const citations: IRagCitation[] = ragItems.map((item) => ({
    title: item.docName,
    preview: item.content.slice(0, 120),
    docId: item.docId,
    chunkId: item.chunkId,
    score: item.rerankScore ?? item.score,
    idx: item.idx,
  }));

  const contextItems = toRagContextItems(ragItems);
  const ragSystemPrompt = generateOptimizedRagPrompt(messages, contextItems);

  return {
    ragSystemPrompt,
    citations,
  };
}

/**
 * 重排：DashScope rerank API，失败时回退向量余弦
 */

import type { IKbEmbeddingConfig } from '@/types/modules/kb';

import { cosine, embedBatch } from './embedding';

const DEFAULT_RERANK_MODEL = 'qwen3-rerank';

function getRerankEndpoint(baseUrl: string): string {
  const intl = /dashscope-intl/.test(baseUrl);
  const host = intl ? 'https://dashscope-intl.aliyuncs.com' : 'https://dashscope.aliyuncs.com';
  return `${host}/api/v1/services/rerank/text-rerank/text-rerank`;
}

function toStringArray(arr: unknown[]): string[] {
  const out: string[] = [];
  for (const x of arr) {
    if (typeof x === 'string') {
      out.push(x);
    } else if (x != null) {
      out.push(String(x));
    }
  }
  return out;
}

async function tryDashscopeRerank(options: {
  url: string;
  headers: Record<string, string>;
  model: string;
  query: string;
  documents: string[];
  topN: number;
}): Promise<{ index: number; score: number }[]> {
  const { url, headers, model, query, documents, topN } = options;
  const body1 = {
    model,
    input: { query, documents },
    parameters: { top_n: topN, return_documents: true },
  };

  const post = async (body: object) => {
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `重排失败: HTTP ${resp.status}`);
    }
    return resp.json() as Promise<{
      output?: { results?: Array<Record<string, unknown>> };
      data?: Array<Record<string, unknown>>;
    }>;
  };

  try {
    const resp = await post(body1);
    const items = resp.output?.results || resp.data || [];
    return items.map((it) => ({
      index: (it.index as number) ?? (it.document_index as number) ?? 0,
      score: (it.score as number) ?? (it.relevance_score as number) ?? 0,
    }));
  } catch (e1) {
    const msg = e1 instanceof Error ? e1.message : String(e1);
    const needContents = /contents is neither str|expect.*contents/i.test(msg);
    const needObjectDocs = /documents.*(object|map)/i.test(msg);

    if (needContents) {
      const resp2 = await post({
        model,
        input: { query, contents: documents },
        parameters: { top_n: topN, return_documents: true },
      });
      const items2 = resp2.output?.results || resp2.data || [];
      return items2.map((it) => ({
        index: (it.index as number) ?? (it.document_index as number) ?? 0,
        score: (it.score as number) ?? (it.relevance_score as number) ?? 0,
      }));
    }

    if (needObjectDocs) {
      const docObjs = documents.map((t) => ({ text: t }));
      const resp3 = await post({
        model,
        input: { query, documents: docObjs },
        parameters: { top_n: topN, return_documents: true },
      });
      const items3 = resp3.output?.results || resp3.data || [];
      return items3.map((it) => ({
        index: (it.index as number) ?? (it.document_index as number) ?? 0,
        score: (it.score as number) ?? (it.relevance_score as number) ?? 0,
      }));
    }

    throw e1;
  }
}

async function fallbackRerank(
  query: string,
  documents: string[],
  config: IKbEmbeddingConfig,
  topN: number,
): Promise<{ index: number; score: number }[]> {
  const docs = toStringArray(documents).slice(0, Math.max(1, topN));
  const [qv] = await embedBatch([query], config);
  const dv = await embedBatch(docs, config);
  const scored = docs.map((_, i) => ({ index: i, score: cosine(qv, dv[i]) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

export async function rerank(
  query: string,
  documents: string[],
  config: IKbEmbeddingConfig,
  topN = 10,
): Promise<{ index: number; score: number }[]> {
  const docs = toStringArray(documents).slice(0, Math.min(10, documents.length));
  const top = Math.min(topN, docs.length);
  if (!docs.length) {
    return [];
  }

  try {
    const url = getRerankEndpoint(config.baseUrl);
    const model = config.rerankModel ?? DEFAULT_RERANK_MODEL;
    return await tryDashscopeRerank({
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      model,
      query,
      documents: docs,
      topN: top,
    });
  } catch (e) {
    console.warn('DashScope 重排失败，使用向量回退:', e instanceof Error ? e.message : e);
    return fallbackRerank(query, docs, config, top);
  }
}

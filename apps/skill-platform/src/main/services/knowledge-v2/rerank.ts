import type { IKbRerankConfig } from '@/types/modules/kb';

import { KnowledgeError } from './error';

export async function rerankCandidates(
  query: string,
  documents: string[],
  config: IKbRerankConfig | undefined,
): Promise<Array<{ index: number; score: number }>> {
  if (!config?.enabled || !config.endpoint || !config.apiKey || !config.model) {
    throw new KnowledgeError({
      code: 'RERANK_CONFIG_INVALID',
      stage: 'rerank',
      message: '已启用 rerank，但 endpoint、model 或 API Key 配置不完整',
      allowedManualActions: ['reconfigure', 'open_logs'],
    });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs || 800);
  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        input: { query, documents },
        parameters: { top_n: documents.length, return_documents: false },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    throw new KnowledgeError({
      code:
        error instanceof Error && error.name === 'AbortError'
          ? 'RERANK_TIMEOUT'
          : 'RERANK_UNAVAILABLE',
      stage: 'rerank',
      message:
        error instanceof Error && error.name === 'AbortError'
          ? 'Rerank 超时，本次知识库检索已终止'
          : `Rerank 请求失败，本次知识库检索已终止：${error instanceof Error ? error.message : String(error)}`,
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
      cause: error,
    });
  } finally {
    clearTimeout(timer);
  }
  const providerRequestId = response.headers.get('x-request-id') || undefined;
  if (!response.ok) {
    throw new KnowledgeError({
      code: `RERANK_HTTP_${response.status}`,
      stage: 'rerank',
      message: `Rerank 请求失败（HTTP ${response.status}），本次知识库检索已终止`,
      providerRequestId,
      details: { response: (await response.text()).slice(0, 2_000) },
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }
  const body = (await response.json()) as {
    output?: { results?: Array<Record<string, unknown>> };
    data?: Array<Record<string, unknown>>;
  };
  const rows = body.output?.results || body.data;
  if (!Array.isArray(rows) || !rows.length) {
    throw new KnowledgeError({
      code: 'RERANK_RESPONSE_INVALID',
      stage: 'rerank',
      message: 'Rerank 响应格式无效，本次知识库检索已终止',
      providerRequestId,
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }
  const result = rows.map((row) => ({
    index: Number(row.index ?? row.document_index),
    score: Number(row.score ?? row.relevance_score),
  }));
  if (result.some((item) => !Number.isInteger(item.index) || !Number.isFinite(item.score))) {
    throw new KnowledgeError({
      code: 'RERANK_RESPONSE_INVALID',
      stage: 'rerank',
      message: 'Rerank 响应包含无效排名，本次知识库检索已终止',
      providerRequestId,
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }
  return result;
}

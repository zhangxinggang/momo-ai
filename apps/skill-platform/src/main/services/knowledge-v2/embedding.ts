import { createHash } from 'node:crypto';

import type { IKbEmbeddingConfig } from '@/types/modules/kb';

import { KnowledgeError } from './error';

const MAX_BATCH_ITEMS = 32;
const MAX_CONCURRENT_REQUESTS = 2;
const REQUEST_TIMEOUT_MS = 20_000;

export interface IEmbeddingCache {
  getEmbedding(
    profileKey: string,
    contentHash: string,
  ): { vector: number[]; dimension: number } | undefined;
  putEmbedding(profileKey: string, contentHash: string, vector: number[], dimension: number): void;
}

let activeRequests = 0;
const waiters: Array<() => void> = [];

async function acquireRequestSlot(): Promise<() => void> {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  activeRequests += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeRequests -= 1;
    waiters.shift()?.();
  };
}

function normalizeEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  const explicit = trimmed.endsWith('#');
  const value = (explicit ? trimmed.slice(0, -1) : trimmed)
    .replace(/\/+$/, '')
    .replace(/\/(?:chat\/completions|responses)$/i, '');
  if (!value) return '';
  if (explicit) return value;
  if (/\/embeddings$/i.test(value)) return value;
  return /\/v\d+$/i.test(value) ? `${value}/embeddings` : `${value}/v1/embeddings`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function embeddingProfileKey(config: IKbEmbeddingConfig): string {
  return sha256(
    JSON.stringify({
      endpoint: normalizeEndpoint(config.baseUrl),
      model: config.model,
      normalize: config.normalize !== false,
      distance: config.distance || 'cosine',
    }),
  );
}

export function embeddingFingerprint(config: IKbEmbeddingConfig, dimension: number): string {
  return sha256(`${embeddingProfileKey(config)}:${dimension}`);
}

function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(norm) || norm <= 0) {
    throw new KnowledgeError({
      code: 'EMBEDDING_INVALID_VECTOR',
      stage: 'embedding',
      message: '嵌入模型返回了无效向量，请检查模型配置后手动重试',
      allowedManualActions: ['reconfigure', 'retry', 'open_logs'],
    });
  }
  return vector.map((value) => value / norm);
}

async function requestBatch(
  batch: string[],
  offset: number,
  endpoint: string,
  config: IKbEmbeddingConfig,
  signal?: AbortSignal,
): Promise<number[][]> {
  const release = await acquireRequestSlot();
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    if (signal?.aborted) controller.abort();
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, input: batch }),
      signal: controller.signal,
    });
  } catch (error) {
    const cancelled = signal?.aborted === true;
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new KnowledgeError({
      code: cancelled ? 'JOB_CANCELLED' : timedOut ? 'EMBEDDING_TIMEOUT' : 'EMBEDDING_UNAVAILABLE',
      stage: 'embedding',
      message: cancelled
        ? '嵌入任务已由客户取消'
        : timedOut
          ? '嵌入请求超时，请检查服务后手动重试'
          : `嵌入请求失败：${error instanceof Error ? error.message : String(error)}`,
      details: { endpoint, offset, batchSize: batch.length },
      allowedManualActions: cancelled
        ? ['retry', 'open_logs']
        : ['retry', 'reconfigure', 'open_logs'],
      cause: error,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
    release();
  }

  const providerRequestId =
    response.headers.get('x-request-id') || response.headers.get('request-id') || undefined;
  if (!response.ok) {
    throw new KnowledgeError({
      code: `EMBEDDING_HTTP_${response.status}`,
      stage: 'embedding',
      message: `嵌入请求失败（HTTP ${response.status}），请由客户检查服务后手动重试`,
      providerRequestId,
      details: {
        endpoint,
        response: (await response.text()).slice(0, 2_000),
        retryAfter: response.headers.get('retry-after') || undefined,
      },
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }

  const body = (await response.json()) as {
    data?: Array<{ index?: number; embedding?: number[] }>;
  };
  const rows = [...(body.data || [])].sort((a, b) => (a.index || 0) - (b.index || 0));
  if (rows.length !== batch.length) {
    throw new KnowledgeError({
      code: 'EMBEDDING_COUNT_MISMATCH',
      stage: 'embedding',
      message: '嵌入响应数量与请求不一致，请检查 provider 后手动重试',
      providerRequestId,
      details: { expected: batch.length, actual: rows.length },
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }
  return rows.map((row) => {
    if (!Array.isArray(row.embedding) || !row.embedding.length) {
      throw new KnowledgeError({
        code: 'EMBEDDING_RESPONSE_INVALID',
        stage: 'embedding',
        message: '嵌入响应缺少向量，请检查 provider 后手动重试',
        providerRequestId,
        allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
      });
    }
    if (row.embedding.some((value) => !Number.isFinite(value))) {
      throw new KnowledgeError({
        code: 'EMBEDDING_NON_FINITE',
        stage: 'embedding',
        message: '嵌入向量包含 NaN 或 Infinity，请检查模型后手动重试',
        providerRequestId,
        allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
      });
    }
    return config.normalize === false ? row.embedding : normalizeVector(row.embedding);
  });
}

export async function embedTexts(
  inputs: string[],
  config: IKbEmbeddingConfig,
  options: { cache?: IEmbeddingCache; signal?: AbortSignal } = {},
): Promise<{ vectors: number[][]; dimension: number; fingerprint: string }> {
  if (!inputs.length) {
    throw new KnowledgeError({
      code: 'EMBEDDING_EMPTY_INPUT',
      stage: 'embedding',
      message: '没有可嵌入的文本',
      allowedManualActions: ['reimport', 'open_logs'],
    });
  }
  const endpoint = normalizeEndpoint(config.baseUrl);
  if (!endpoint || !config.apiKey?.trim() || !config.model?.trim()) {
    throw new KnowledgeError({
      code: 'EMBEDDING_CONFIG_INVALID',
      stage: 'embedding',
      message: '嵌入模型 endpoint、model 或 API Key 未配置完整',
      allowedManualActions: ['reconfigure', 'open_logs'],
    });
  }

  const profileKey = embeddingProfileKey(config);
  const hashes = inputs.map(sha256);
  const output: Array<number[] | undefined> = inputs.map(
    (_, index) => options.cache?.getEmbedding(profileKey, hashes[index])?.vector,
  );
  const missing = output.flatMap((vector, index) => (vector ? [] : [index]));
  for (let offset = 0; offset < missing.length; offset += MAX_BATCH_ITEMS) {
    const indices = missing.slice(offset, offset + MAX_BATCH_ITEMS);
    const vectors = await requestBatch(
      indices.map((index) => inputs[index]),
      offset,
      endpoint,
      config,
      options.signal,
    );
    vectors.forEach((vector, batchIndex) => {
      const inputIndex = indices[batchIndex];
      output[inputIndex] = vector;
      options.cache?.putEmbedding(profileKey, hashes[inputIndex], vector, vector.length);
    });
  }

  const vectors = output.filter((vector): vector is number[] => Boolean(vector));
  if (vectors.length !== inputs.length) {
    throw new KnowledgeError({
      code: 'EMBEDDING_COUNT_MISMATCH',
      stage: 'embedding',
      message: '嵌入缓存和 provider 返回数量不完整，请由客户手动处理',
      allowedManualActions: ['rebuild_index', 'retry', 'open_logs'],
    });
  }
  const dimension = vectors[0].length;
  if (vectors.some((vector) => vector.length !== dimension)) {
    throw new KnowledgeError({
      code: 'EMBEDDING_DIMENSION_MISMATCH',
      stage: 'embedding',
      message: '嵌入响应维度不一致，请修复模型配置后手动重试',
      allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
    });
  }
  if (config.dimension && config.dimension !== dimension) {
    throw new KnowledgeError({
      code: 'EMBEDDING_CONFIG_DIMENSION_MISMATCH',
      stage: 'embedding',
      message: `嵌入模型返回 ${dimension} 维，但配置要求 ${config.dimension} 维`,
      details: { configured: config.dimension, actual: dimension },
      allowedManualActions: ['reconfigure', 'open_logs'],
    });
  }
  return { vectors, dimension, fingerprint: embeddingFingerprint(config, dimension) };
}

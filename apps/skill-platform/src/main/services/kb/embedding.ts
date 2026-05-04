/**
 * 嵌入向量：OpenAI 兼容 /embeddings 接口
 */

import type { IKbEmbeddingConfig } from '@/types/modules/kb';

const DEFAULT_EMBEDDING_MODEL = 'text-embedding-v4';
const MAX_BATCH_SIZE = 10;

function l2norm(vec: number[]): number {
  let s = 0;
  for (const v of vec) {
    s += v * v;
  }
  return Math.sqrt(Math.max(s, 1e-12));
}

function normalize(vec: number[]): number[] {
  const n = l2norm(vec);
  return vec.map((v) => v / n);
}

function resolveEmbeddingsUrl(baseUrl: string): string {
  let url = baseUrl.trim().replace(/\/$/, '');
  if (url.endsWith('#')) {
    url = url.slice(0, -1);
  }
  for (const suffix of ['/embeddings', '/chat/completions', '/completions', '/models']) {
    if (url.endsWith(suffix)) {
      url = url.slice(0, -suffix.length);
      break;
    }
  }
  if (url.match(/\/v\d+$/)) {
    return `${url}/embeddings`;
  }
  return `${url}/v1/embeddings`;
}

export function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += a[i] * b[i];
  }
  return s;
}

export async function embedBatch(
  inputs: string[],
  config: IKbEmbeddingConfig,
  options: { batchSize?: number; model?: string } = {},
): Promise<number[][]> {
  if (!inputs.length) {
    return [];
  }
  if (!config.apiKey?.trim() || !config.baseUrl?.trim()) {
    throw new Error('缺少嵌入模型 API Key 或 Base URL，请在设置中配置 DashScope 兼容端点');
  }

  const batchSize = Math.min(options.batchSize ?? MAX_BATCH_SIZE, MAX_BATCH_SIZE);
  const model = options.model ?? config.model ?? DEFAULT_EMBEDDING_MODEL;
  const endpoint = resolveEmbeddingsUrl(config.baseUrl);
  const out: number[][] = [];

  for (let i = 0; i < inputs.length; i += batchSize) {
    const slice = inputs.slice(i, i + batchSize);
    let lastError: Error | null = null;

    for (let retry = 0; retry <= 2; retry++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({ model, input: slice }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || `嵌入请求失败: HTTP ${response.status}`);
        }

        const json = (await response.json()) as {
          data?: { embedding: number[] }[];
        };
        const rows = json.data || [];
        for (const row of rows) {
          out.push(normalize(row.embedding));
        }
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (retry < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (retry + 1)));
        }
      }
    }

    if (lastError) {
      throw lastError;
    }
  }

  return out;
}

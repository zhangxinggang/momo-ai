import { afterEach, describe, expect, it, vi } from 'vitest';

import { embedTexts, type IEmbeddingCache } from './embedding';

const config = {
  apiKey: 'secret',
  baseUrl: 'https://provider.example/v1',
  model: 'text-embedding-test',
};

class MemoryCache implements IEmbeddingCache {
  values = new Map<string, { vector: number[]; dimension: number }>();

  getEmbedding(profileKey: string, contentHash: string) {
    return this.values.get(`${profileKey}:${contentHash}`);
  }

  putEmbedding(profileKey: string, contentHash: string, vector: number[], dimension: number) {
    this.values.set(`${profileKey}:${contentHash}`, { vector, dimension });
  }
}

describe('knowledge v2 embeddings', () => {
  it('honors an explicitly configured embeddings endpoint', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await embedTexts(['hello'], { ...config, baseUrl: 'https://example.com/custom/embed#' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/custom/embed',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('does not automatically retry provider errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('rate limited', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(embedTexts(['hello'], config)).rejects.toMatchObject({
      code: 'EMBEDDING_HTTP_429',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses the content-addressed cache without another provider call', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ index: 0, embedding: [3, 4] }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const cache = new MemoryCache();
    const first = await embedTexts(['hello'], config, { cache });
    const second = await embedTexts(['hello'], config, { cache });
    expect(first.vectors).toEqual([[0.6, 0.8]]);
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

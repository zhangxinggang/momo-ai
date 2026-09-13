import { describe, expect, it } from 'vitest';

import type { IAIModelConfig } from '@renderer/types/settings';

import { resolveKbEmbeddingConfig, resolveKbEmbeddingModel } from './embedding-config';

function model(
  input: Partial<IAIModelConfig> & Pick<IAIModelConfig, 'id' | 'model'>,
): IAIModelConfig {
  return {
    type: 'chat',
    name: input.model,
    provider: 'openai',
    apiKey: 'test-key',
    apiUrl: 'https://api.example.com/v1',
    ...input,
  };
}

describe('knowledge embedding model resolution', () => {
  it('does not treat the text-segmentation chat model as an embedding model', () => {
    const chatModel = model({ id: 'chat', model: 'gpt-4o-mini' });

    expect(resolveKbEmbeddingConfig([chatModel], { textSegment: chatModel.id })).toBeNull();
  });

  it('uses the explicitly selected knowledge embedding model', () => {
    const first = model({ id: 'embedding-1', model: 'text-embedding-3-small', type: 'embedding' });
    const selected = model({ id: 'embedding-2', model: 'bge-m3', type: 'embedding' });

    expect(resolveKbEmbeddingModel([first, selected], { knowledgeEmbedding: selected.id })).toBe(
      selected,
    );
    expect(
      resolveKbEmbeddingConfig([first, selected], { knowledgeEmbedding: selected.id }),
    ).toEqual({
      apiKey: 'test-key',
      baseUrl: 'https://api.example.com/v1',
      model: 'bge-m3',
    });
  });

  it('keeps recognizing legacy embedding models saved as chat models', () => {
    const legacy = model({ id: 'legacy', model: 'text-embedding-ada-002' });

    expect(resolveKbEmbeddingModel([legacy])).toBe(legacy);
  });
});

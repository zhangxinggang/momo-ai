import { describe, expect, it } from 'vitest';

import { toStoredIngestPayload } from './model';

describe('knowledge v2 persisted job payload', () => {
  it('never contains an embedding API key', () => {
    const stored = toStoredIngestPayload({
      sourcePath: 'C:/docs/readme.md',
      blobPath: 'C:/data/blob.md',
      filename: 'readme.md',
      ingest: {},
      embedding: {
        apiKey: 'must-not-be-persisted',
        baseUrl: 'https://provider.example/v1',
        model: 'embedding-model',
      },
    });
    expect(JSON.stringify(stored)).not.toContain('must-not-be-persisted');
    expect(stored.embedding).toEqual({
      baseUrl: 'https://provider.example/v1',
      model: 'embedding-model',
    });
  });
});

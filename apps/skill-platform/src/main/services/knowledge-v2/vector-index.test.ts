import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { LanceVectorIndex } from './vector-index';

describe('knowledge v2 LanceDB adapter', () => {
  it('upserts, searches and deletes without a JS full scan', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aim-lance-test-'));
    const index = new LanceVectorIndex(root);
    try {
      await index.upsert(
        'profile',
        [
          {
            chunk_id: 'chunk-1',
            collection_id: 'collection-1',
            document_id: 'document-1',
            revision_id: 'revision-1',
            parent_chunk_id: '',
            enabled: true,
            content: '安装步骤',
            heading_path: '安装',
            source_path: 'manual.md',
            page: 1,
            vector: [1, 0, 0],
          },
          {
            chunk_id: 'chunk-2',
            collection_id: 'collection-1',
            document_id: 'document-1',
            revision_id: 'revision-1',
            parent_chunk_id: '',
            enabled: true,
            content: '卸载步骤',
            heading_path: '卸载',
            source_path: 'manual.md',
            page: 2,
            vector: [0, 1, 0],
          },
        ],
        'cosine',
      );
      const hits = await index.search({
        fingerprint: 'profile',
        vector: [1, 0, 0],
        collectionIds: ['collection-1'],
        revisionIds: ['revision-1'],
        limit: 2,
        distanceType: 'cosine',
      });
      expect(hits[0].chunk_id).toBe('chunk-1');
      await index.deleteChunks('profile', ['chunk-1']);
      const remaining = await index.search({
        fingerprint: 'profile',
        vector: [1, 0, 0],
        collectionIds: ['collection-1'],
        revisionIds: ['revision-1'],
        limit: 2,
        distanceType: 'cosine',
      });
      expect(remaining.map((item) => item.chunk_id)).toEqual(['chunk-2']);
    } finally {
      await index.close();
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

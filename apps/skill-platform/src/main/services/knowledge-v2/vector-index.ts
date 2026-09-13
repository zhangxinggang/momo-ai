import { createHash } from 'node:crypto';

import * as lancedb from '@lancedb/lancedb';

import { KnowledgeError, toKnowledgeError } from './error';

export interface IVectorRow {
  chunk_id: string;
  collection_id: string;
  document_id: string;
  revision_id: string;
  parent_chunk_id: string;
  enabled: boolean;
  content: string;
  heading_path: string;
  source_path: string;
  page: number;
  vector: number[];
}

export interface IVectorHit extends Omit<IVectorRow, 'vector'> {
  _distance: number;
}

export type EVectorDistance = 'cosine' | 'dot' | 'l2';

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function tableName(fingerprint: string): string {
  return `chunks_${createHash('sha256').update(fingerprint).digest('hex').slice(0, 24)}`;
}

export class LanceVectorIndex {
  private connectionPromise?: ReturnType<typeof lancedb.connect>;
  private readonly writeQueues = new Map<string, Promise<void>>();
  private readonly indexedTables = new Set<string>();

  constructor(private readonly rootPath: string) {}

  private connection() {
    this.connectionPromise ||= lancedb.connect(this.rootPath);
    return this.connectionPromise;
  }

  private async withWriteLock<T>(fingerprint: string, work: () => Promise<T>): Promise<T> {
    const previous = this.writeQueues.get(fingerprint) || Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.then(() => next);
    this.writeQueues.set(fingerprint, queued);
    await previous;
    try {
      return await work();
    } finally {
      release();
      if (this.writeQueues.get(fingerprint) === queued) this.writeQueues.delete(fingerprint);
    }
  }

  private async openTable(fingerprint: string) {
    const connection = await this.connection();
    return connection.openTable(tableName(fingerprint));
  }

  async upsert(
    fingerprint: string,
    rows: IVectorRow[],
    distanceType: EVectorDistance = 'cosine',
  ): Promise<void> {
    if (!rows.length) {
      throw new KnowledgeError({
        code: 'VECTOR_INDEX_EMPTY_BATCH',
        stage: 'vector_index',
        message: '向量索引写入批次为空',
        allowedManualActions: ['reimport', 'open_logs'],
      });
    }
    await this.withWriteLock(fingerprint, async () => {
      try {
        const connection = await this.connection();
        const name = tableName(fingerprint);
        let table: Awaited<ReturnType<typeof connection.openTable>>;
        const names = await connection.tableNames();
        if (names.includes(name)) {
          table = await connection.openTable(name);
          const ids = rows.map((row) => sqlLiteral(row.chunk_id)).join(',');
          await table.delete(`chunk_id IN (${ids})`);
          await table.add(rows as unknown as Record<string, unknown>[]);
        } else {
          table = await connection.createTable(name, rows as unknown as Record<string, unknown>[], {
            mode: 'create',
          });
        }

        const count = await table.countRows();
        if (count >= 2_048 && !this.indexedTables.has(name)) {
          await table.createIndex('vector', {
            replace: true,
            config: lancedb.Index.ivfPq({ distanceType }),
          });
          for (const column of ['collection_id', 'document_id', 'revision_id', 'chunk_id']) {
            await table.createIndex(column, { replace: true });
          }
          this.indexedTables.add(name);
        }
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_INDEX_WRITE_FAILED',
          stage: 'vector_index',
          details: { fingerprint, rowCount: rows.length },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async replaceChunk(fingerprint: string, oldChunkId: string, row: IVectorRow): Promise<void> {
    await this.withWriteLock(fingerprint, async () => {
      try {
        const table = await this.openTable(fingerprint);
        await table.delete(`chunk_id = ${sqlLiteral(row.chunk_id)}`);
        await table.add([row] as unknown as Record<string, unknown>[]);
        await table.delete(`chunk_id = ${sqlLiteral(oldChunkId)}`);
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_INDEX_REPLACE_FAILED',
          stage: 'vector_index',
          details: { fingerprint, oldChunkId, newChunkId: row.chunk_id },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async assertScopeCount(input: {
    fingerprint: string;
    collectionIds: string[];
    revisionIds: string[];
    expectedCount: number;
  }): Promise<void> {
    try {
      const table = await this.openTable(input.fingerprint);
      const predicate =
        `enabled = true AND collection_id IN (${input.collectionIds.map(sqlLiteral).join(',')}) ` +
        `AND revision_id IN (${input.revisionIds.map(sqlLiteral).join(',')})`;
      const actualCount = await table.countRows(predicate);
      if (actualCount !== input.expectedCount) {
        throw new KnowledgeError({
          code: 'INDEX_INCONSISTENT',
          stage: 'retrieve',
          message: '知识库元数据与向量索引数量不一致，请由客户手动重建索引。',
          details: { expectedCount: input.expectedCount, actualCount },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    } catch (error) {
      if (error instanceof KnowledgeError) throw error;
      throw toKnowledgeError(error, {
        code: 'INDEX_CONSISTENCY_CHECK_FAILED',
        stage: 'retrieve',
        details: { collectionIds: input.collectionIds },
        allowedManualActions: ['rebuild_index', 'open_logs'],
      });
    }
  }

  async search(input: {
    fingerprint: string;
    vector: number[];
    collectionIds: string[];
    revisionIds: string[];
    documentIds?: string[];
    limit: number;
    distanceType?: EVectorDistance;
  }): Promise<IVectorHit[]> {
    try {
      const table = await this.openTable(input.fingerprint);
      const collections = input.collectionIds.map(sqlLiteral).join(',');
      const revisions = input.revisionIds.map(sqlLiteral).join(',');
      let predicate = `enabled = true AND collection_id IN (${collections}) AND revision_id IN (${revisions})`;
      if (input.documentIds?.length) {
        predicate += ` AND document_id IN (${input.documentIds.map(sqlLiteral).join(',')})`;
      }
      const rows = await table
        .vectorSearch(input.vector)
        .distanceType(input.distanceType || 'cosine')
        .where(predicate)
        .limit(input.limit)
        .toArray();
      return rows as IVectorHit[];
    } catch (error) {
      throw toKnowledgeError(error, {
        code: 'VECTOR_SEARCH_FAILED',
        stage: 'retrieve',
        details: { collectionIds: input.collectionIds },
        allowedManualActions: ['rebuild_index', 'open_logs'],
      });
    }
  }

  async deleteRevision(fingerprint: string, revisionId: string): Promise<void> {
    await this.withWriteLock(fingerprint, async () => {
      try {
        const table = await this.openTable(fingerprint);
        await table.delete(`revision_id = ${sqlLiteral(revisionId)}`);
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_DELETE_FAILED',
          stage: 'vector_index',
          details: { revisionId },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async deleteDocument(fingerprint: string, documentId: string): Promise<void> {
    await this.withWriteLock(fingerprint, async () => {
      try {
        const table = await this.openTable(fingerprint);
        await table.delete(`document_id = ${sqlLiteral(documentId)}`);
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_DELETE_FAILED',
          stage: 'vector_index',
          details: { documentId },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async deleteCollection(fingerprint: string, collectionId: string): Promise<void> {
    await this.withWriteLock(fingerprint, async () => {
      try {
        const table = await this.openTable(fingerprint);
        await table.delete(`collection_id = ${sqlLiteral(collectionId)}`);
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_DELETE_FAILED',
          stage: 'vector_index',
          details: { collectionId },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async deleteChunks(fingerprint: string, chunkIds: string[]): Promise<void> {
    if (!chunkIds.length) return;
    await this.withWriteLock(fingerprint, async () => {
      try {
        const table = await this.openTable(fingerprint);
        await table.delete(`chunk_id IN (${chunkIds.map(sqlLiteral).join(',')})`);
      } catch (error) {
        throw toKnowledgeError(error, {
          code: 'VECTOR_DELETE_FAILED',
          stage: 'vector_index',
          details: { chunkIds },
          allowedManualActions: ['rebuild_index', 'open_logs'],
        });
      }
    });
  }

  async close(): Promise<void> {
    const connection = await this.connectionPromise;
    connection?.close();
    this.connectionPromise = undefined;
  }
}

import BetterSqlite3, { type Database } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// The knowledge worker runs in an Electron utility process, where main-process
// APIs such as `app` are unavailable. Import the side-effect-free helper directly
// instead of evaluating the @momo/electron barrel and all its exports.
import { getDbConfig } from '../../../../../electron/src/utils/database-config';

import { KnowledgeError } from './error';
import { KNOWLEDGE_V2_SCHEMA } from './schema';

export interface IKnowledgeStorage {
  rootPath: string;
  databasePath: string;
  lancePath: string;
  blobPath: string;
  artifactPath: string;
  db: Database;
}

export function openKnowledgeStorage(rootPath: string): IKnowledgeStorage {
  const databasePath = path.join(rootPath, 'knowledge-v2.db');
  const lancePath = path.join(rootPath, 'lance');
  const blobPath = path.join(rootPath, 'blobs');
  const artifactPath = path.join(rootPath, 'artifacts');

  try {
    for (const directory of [rootPath, lancePath, blobPath, artifactPath]) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const db = new BetterSqlite3(databasePath, getDbConfig());
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
    db.exec(KNOWLEDGE_V2_SCHEMA);

    const now = Date.now();
    db.prepare(
      `UPDATE kb_jobs
       SET status='interrupted', error_code='WORKER_INTERRUPTED',
           error_message='知识库工作进程在任务完成前退出，请手动重试', finished_at=?
       WHERE status IN ('queued','running')`,
    ).run(now);
    db.prepare(
      `UPDATE kb_documents
       SET status='interrupted', error_code='WORKER_INTERRUPTED',
           error_message='知识库工作进程在任务完成前退出，请手动重试', updated_at=?
       WHERE status IN ('queued', 'parsing', 'chunking', 'embedding', 'indexing')`,
    ).run(now);
    db.prepare(
      `UPDATE kb_documents
       SET status='interrupted',stage='vector_index',error_code='INDEX_WRITE_INTERRUPTED',
           error_message='向量索引写入未完成，请由客户手动重建索引或重试任务',updated_at=?
       WHERE id IN (SELECT document_id FROM kb_index_outbox WHERE status='pending')`,
    ).run(now);
    db.prepare(
      `UPDATE kb_index_outbox SET status='interrupted',error_code='INDEX_WRITE_INTERRUPTED',
       error_message='知识库工作进程在索引提交完成前退出',updated_at=? WHERE status='pending'`,
    ).run(now);

    return { rootPath, databasePath, lancePath, blobPath, artifactPath, db };
  } catch (error) {
    throw new KnowledgeError({
      code: 'KNOWLEDGE_V2_INITIALIZE_FAILED',
      stage: 'initialize',
      message: error instanceof Error ? error.message : String(error),
      details: { rootPath },
      allowedManualActions: ['open_logs', 'reconfigure'],
      cause: error,
    });
  }
}

import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentStore } from '../persistence/store';
export class ArtifactStore {
  constructor(
    private store: AgentStore,
    private root: string,
  ) {
    store.db.exec(
      'CREATE TABLE IF NOT EXISTS agent_artifacts(id TEXT PRIMARY KEY,run_id TEXT NOT NULL,metadata TEXT NOT NULL,blob_id TEXT NOT NULL)',
    );
  }
  async create(
    runId: string,
    input: { name: string; mimeType: string; encoding: 'utf8' | 'base64'; content: string },
  ) {
    if (
      !input.name ||
      input.name.length > 240 ||
      !['utf8', 'base64'].includes(input.encoding) ||
      typeof input.content !== 'string'
    )
      throw new Error('INVALID_ARTIFACT');
    if (
      input.encoding === 'base64' &&
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.content)
    )
      throw new Error('INVALID_BASE64');
    const bytes = Buffer.from(input.content, input.encoding === 'base64' ? 'base64' : 'utf8');
    if (bytes.length > 10 * 1024 * 1024) throw new Error('ARTIFACT_TOO_LARGE');
    const blobId = createHash('sha256').update(bytes).digest('hex');
    await fs.mkdir(this.root, { recursive: true });
    try {
      await fs.writeFile(path.join(this.root, blobId), bytes, { flag: 'wx' });
    } catch (e: any) {
      if (e.code !== 'EEXIST') throw e;
    }
    const metadata = {
      id: randomUUID(),
      runId,
      name: path.basename(input.name).replace(/[<>:"|?*]/g, '_'),
      mimeType: input.mimeType,
      size: bytes.length,
      createdAt: Date.now(),
    };
    this.store.db
      .prepare('INSERT INTO agent_artifacts VALUES (?,?,?,?)')
      .run(metadata.id, runId, JSON.stringify(metadata), blobId);
    return metadata;
  }
  async load(id: string) {
    const row = this.store.db.prepare('SELECT * FROM agent_artifacts WHERE id=?').get(id) as any;
    if (!row) throw new Error('UNKNOWN_ARTIFACT');
    const bytes = await fs.readFile(path.join(this.root, row.blob_id));
    if (createHash('sha256').update(bytes).digest('hex') !== row.blob_id)
      throw new Error('ARTIFACT_CORRUPT');
    return { metadata: JSON.parse(row.metadata), bytes };
  }
}

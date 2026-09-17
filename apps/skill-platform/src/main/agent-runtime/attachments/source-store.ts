import type { SourceRef } from '@momo/agent-contracts';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentStore } from '../persistence/store';
export class AgentSourceStore {
  constructor(
    private store: AgentStore,
    private root: string,
  ) {}
  async save(input: {
    name: string;
    mimeType: string;
    encoding: 'utf8' | 'base64';
    content: string;
    derivedText?: string;
    originalAvailable?: boolean;
    sourceId?: string;
    revision?: string;
  }): Promise<SourceRef> {
    if (
      !input ||
      typeof input.name !== 'string' ||
      input.name.length > 240 ||
      typeof input.mimeType !== 'string' ||
      input.mimeType.length > 120 ||
      typeof input.content !== 'string' ||
      !['base64', 'utf8'].includes(input.encoding)
    )
      throw new Error('INVALID_ATTACHMENT');
    const bytes = Buffer.from(input.content, input.encoding === 'base64' ? 'base64' : 'utf8');
    if (bytes.length > 10 * 1024 * 1024) throw new Error('每个附件不得超过 10 MiB');
    if (input.encoding === 'base64' && bytes.toString('base64') !== input.content)
      throw new Error('INVALID_BASE64');
    const blobId = createHash('sha256').update(bytes).digest('hex');
    const revision =
      input.revision ??
      createHash('sha256')
        .update(input.mimeType + '\0' + input.encoding + '\0' + input.content)
        .digest('hex');
    if (!/^[a-f0-9]{64}$/.test(revision)) throw new Error('INVALID_REVISION');
    const ref: SourceRef = {
      sourceId: input.sourceId ?? 'source:' + revision,
      revision,
      name: path.basename(input.name),
      mimeType: input.mimeType,
      encoding: input.encoding,
      size: bytes.length,
      originalAvailable: input.originalAvailable ?? true,
    };
    await fs.mkdir(this.root, { recursive: true });
    const file = path.join(this.root, blobId);
    try {
      await fs.writeFile(file, bytes, { flag: 'wx' });
    } catch (e: any) {
      if (e.code !== 'EEXIST') throw e;
    }
    const existing = this.store.db
      .prepare('SELECT revision,blob_id FROM agent_sources WHERE id=?')
      .get(ref.sourceId) as any;
    if (existing && (existing.revision !== revision || existing.blob_id !== blobId))
      throw new Error('SOURCE_ID_COLLISION');
    this.store.db
      .prepare('INSERT OR REPLACE INTO agent_sources VALUES (?,?,?,?,?)')
      .run(
        ref.sourceId,
        revision,
        JSON.stringify(ref),
        blobId,
        (input.derivedText ?? '').slice(0, 2_000_000),
      );
    return ref;
  }
  async load(refs: SourceRef[]) {
    const result = [];
    for (const ref of refs) {
      const row = this.store.db
        .prepare('SELECT * FROM agent_sources WHERE id=? AND revision=?')
        .get(ref.sourceId, ref.revision) as any;
      if (!row) throw new Error('附件快照不可用：' + ref.name);
      const bytes = await fs.readFile(path.join(this.root, row.blob_id));
      if (createHash('sha256').update(bytes).digest('hex') !== row.blob_id)
        throw new Error('附件校验失败');
      const stored = JSON.parse(row.metadata) as SourceRef;
      result.push({
        ...stored,
        content: bytes.toString(stored.encoding === 'base64' ? 'base64' : 'utf8'),
        derivedText: row.derived_text,
      });
    }
    return result;
  }
}

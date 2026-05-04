import type {
  DCreatePrompt,
  DPromptSearch,
  DUpdatePrompt,
  EResourceVisibility,
  IPrompt,
  IPromptVersion,
} from '@/types/modules';
import type { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { PromptRepository } from '../repository/prompt';
import { runQuery } from '../repository/sql-runner';

interface IPromptVersionRow {
  id: string;
  prompt_id: string;
  version: number;
  system_prompt: string | null;
  system_prompt_en: string | null;
  user_prompt: string;
  user_prompt_en: string | null;
  variables: string | null;
  note: string | null;
  ai_response: string | null;
  created_at: number;
}

/** IPrompt 业务逻辑 */
export class PromptService {
  private readonly repo = new PromptRepository();

  async create(data: DCreatePrompt): Promise<IPrompt> {
    const id = uuidv4();
    const now = Date.now();
    await this.repo.insertOnCreate({
      id,
      title: data.title,
      system_prompt: data.systemPrompt || null,
      system_prompt_en: data.systemPromptEn || null,
      user_prompt: data.userPrompt,
      user_prompt_en: data.userPromptEn || null,
      variables: JSON.stringify(data.variables || []),
      tags: JSON.stringify(data.tags || []),
      folder_id: data.folderId || null,
      source: data.source || null,
      last_ai_response: null,
      is_favorite: 0,
      current_version: 0,
      usage_count: 0,
      created_at: now,
      updated_at: now,
    });
    await this.appendPromptVersion(id, 'Initial version');
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IPrompt | null> {
    const row = await this.repo.findById(id);
    return row ? this.rowToPrompt(row) : null;
  }

  async getAll(): Promise<IPrompt[]> {
    const rows = await this.repo.findAllOrdered();
    return rows.map((r) => this.rowToPrompt(r));
  }

  async update(id: string, data: DUpdatePrompt): Promise<IPrompt | null> {
    const existingPrompt = await this.getById(id);
    if (!existingPrompt) return null;

    const now = Date.now();
    const updates: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.systemPrompt !== undefined) {
      updates.push('system_prompt = ?');
      values.push(data.systemPrompt);
    }
    if (data.systemPromptEn !== undefined) {
      updates.push('system_prompt_en = ?');
      values.push(data.systemPromptEn);
    }
    if (data.userPrompt !== undefined) {
      updates.push('user_prompt = ?');
      values.push(data.userPrompt);
    }
    if (data.userPromptEn !== undefined) {
      updates.push('user_prompt_en = ?');
      values.push(data.userPromptEn);
    }
    if (data.variables !== undefined) {
      updates.push('variables = ?');
      values.push(JSON.stringify(data.variables));
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.folderId !== undefined) {
      updates.push('folder_id = ?');
      values.push(data.folderId);
    }
    if (data.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(data.isFavorite ? 1 : 0);
    }
    if (data.isPinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(data.isPinned ? 1 : 0);
    }
    if (data.source !== undefined) {
      updates.push('source = ?');
      values.push(data.source);
    }
    if (data.usageCount !== undefined) {
      updates.push('usage_count = ?');
      values.push(data.usageCount);
    }
    if (data.lastAiResponse !== undefined) {
      updates.push('last_ai_response = ?');
      values.push(data.lastAiResponse);
    }

    values.push(id);

    const needNewVersion =
      data.systemPrompt !== undefined ||
      data.systemPromptEn !== undefined ||
      data.userPrompt !== undefined ||
      data.userPromptEn !== undefined ||
      data.variables !== undefined;

    await this.repo.runInTransaction(async (manager) => {
      await this.repo.updateDynamic(`${updates.join(', ')} WHERE id = ?`, values, manager);
      if (needNewVersion) {
        const promptAfter = await this.getByIdFromManager(id, manager);
        if (promptAfter) {
          await this.appendPromptVersion(id, undefined, manager, promptAfter);
        }
      }
    });

    const updatedPrompt: IPrompt = {
      ...existingPrompt,
      updatedAt: new Date(now).toISOString(),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.systemPrompt !== undefined && { systemPrompt: data.systemPrompt }),
      ...(data.systemPromptEn !== undefined && { systemPromptEn: data.systemPromptEn }),
      ...(data.userPrompt !== undefined && { userPrompt: data.userPrompt }),
      ...(data.userPromptEn !== undefined && { userPromptEn: data.userPromptEn }),
      ...(data.variables !== undefined && { variables: data.variables }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.folderId !== undefined && { folderId: data.folderId }),
      ...(data.isFavorite !== undefined && { isFavorite: data.isFavorite }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.usageCount !== undefined && { usageCount: data.usageCount }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.lastAiResponse !== undefined && { lastAiResponse: data.lastAiResponse }),
    };

    if (needNewVersion) {
      const nextVersion = existingPrompt.currentVersion + 1;
      updatedPrompt.currentVersion = nextVersion;
      updatedPrompt.version = nextVersion;
    }

    return updatedPrompt;
  }

  /**
   * 追加 prompt_versions 并递增 current_version（可选事务 / 可选已加载的 IPrompt）
   */
  private async appendPromptVersion(
    promptId: string,
    note?: string,
    manager?: import('typeorm').EntityManager,
    promptSnapshot?: IPrompt,
  ): Promise<IPromptVersion | null> {
    const run = async (m: import('typeorm').EntityManager) => {
      const prompt =
        promptSnapshot ??
        (await this.getByIdFromManager(promptId, m)) ??
        (await this.getById(promptId));
      if (!prompt) return null;

      const freshCv = await this.repo.findCurrentVersion(promptId, m);
      const version = freshCv + 1;
      const vid = uuidv4();
      const now = Date.now();
      await this.repo.insertPromptVersion(
        {
          id: vid,
          promptId,
          version,
          system_prompt: prompt.systemPrompt || null,
          system_prompt_en: prompt.systemPromptEn || null,
          user_prompt: prompt.userPrompt,
          user_prompt_en: prompt.userPromptEn || null,
          variables: JSON.stringify(prompt.variables),
          note: note || null,
          ai_response: prompt.lastAiResponse || null,
          created_at: now,
        },
        m,
      );
      await this.repo.setPromptCurrentVersion(promptId, version, m);
      return {
        id: vid,
        promptId,
        version,
        systemPrompt: prompt.systemPrompt,
        systemPromptEn: prompt.systemPromptEn,
        userPrompt: prompt.userPrompt,
        userPromptEn: prompt.userPromptEn,
        variables: prompt.variables,
        note,
        aiResponse: prompt.lastAiResponse,
        createdAt: new Date(now).toISOString(),
      } as IPromptVersion;
    };

    if (manager) {
      return run(manager);
    }
    return this.repo.runInTransaction(async (m) => run(m));
  }

  private async getByIdFromManager(
    id: string,
    m: import('typeorm').EntityManager,
  ): Promise<IPrompt | null> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM prompts WHERE id = ?',
      [id],
      m,
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    return row ? this.rowToPrompt(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.repo.deleteById(id);
    return true;
  }

  async search(query: DPromptSearch): Promise<IPrompt[]> {
    let sql = 'SELECT * FROM prompts WHERE 1=1';
    const params: unknown[] = [];

    if (query.keyword) {
      sql += ' AND rowid IN (SELECT rowid FROM prompts_fts WHERE prompts_fts MATCH ?)';
      params.push(`"${query.keyword.replace(/"/g, '""')}"`);
    }
    if (query.folderId) {
      sql += ' AND folder_id = ?';
      params.push(query.folderId);
    }
    if (query.isFavorite !== undefined) {
      sql += ' AND is_favorite = ?';
      params.push(query.isFavorite ? 1 : 0);
    }
    if (query.tags && query.tags.length > 0) {
      const tagConditions = query.tags.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      params.push(...query.tags.map((tag) => `%"${tag}"%`));
    }

    const sortBy = query.sortBy || 'updatedAt';
    const sortOrder = query.sortOrder || 'desc';
    const sortColumn =
      (
        {
          title: 'title',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          usageCount: 'usage_count',
        } as Record<string, string>
      )[sortBy] ?? 'updated_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortColumn} ${safeOrder}`;

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
      if (query.offset) {
        sql += ' OFFSET ?';
        params.push(query.offset);
      }
    }

    const rows = await this.repo.search(sql, params);
    return rows.map((r) => this.rowToPrompt(r));
  }

  async incrementUsage(id: string): Promise<void> {
    await this.repo.incrementUsage(id);
  }

  async createVersion(promptId: string, note?: string): Promise<IPromptVersion | null> {
    return this.appendPromptVersion(promptId, note);
  }

  async getVersions(promptId: string): Promise<IPromptVersion[]> {
    const rows = await this.repo.findVersions(promptId);
    return rows.map((r) => this.rowToVersion(r as unknown as IPromptVersionRow));
  }

  async deleteVersion(versionId: string): Promise<boolean> {
    const rows = await runQuery<unknown[]>('SELECT 1 FROM prompt_versions WHERE id = ? LIMIT 1', [
      versionId,
    ]);
    const existed = Array.isArray(rows) && rows.length > 0;
    if (!existed) return false;
    await this.repo.deleteVersionById(versionId);
    return true;
  }

  async insertVersionDirect(version: IPromptVersion, manager?: EntityManager): Promise<void> {
    await this.repo.insertVersionDirectRow(
      {
        id: version.id,
        prompt_id: version.promptId,
        version: version.version,
        system_prompt: version.systemPrompt || null,
        system_prompt_en: version.systemPromptEn || null,
        user_prompt: version.userPrompt,
        user_prompt_en: version.userPromptEn || null,
        variables: JSON.stringify(version.variables),
        note: version.note || null,
        ai_response: version.aiResponse || null,
        created_at: version.createdAt ? new Date(version.createdAt).getTime() : Date.now(),
      },
      manager,
    );
  }

  async insertPromptDirect(prompt: IPrompt, manager?: EntityManager): Promise<void> {
    await this.repo.upsertPromptDirect(
      {
        id: prompt.id,
        title: prompt.title,
        system_prompt: prompt.systemPrompt ?? null,
        system_prompt_en: prompt.systemPromptEn ?? null,
        user_prompt: prompt.userPrompt,
        user_prompt_en: prompt.userPromptEn ?? null,
        variables: JSON.stringify(prompt.variables ?? []),
        tags: JSON.stringify(prompt.tags ?? []),
        folder_id: prompt.folderId ?? null,
        is_favorite: prompt.isFavorite ? 1 : 0,
        is_pinned: prompt.isPinned ? 1 : 0,
        current_version: prompt.currentVersion ?? prompt.version ?? 1,
        usage_count: prompt.usageCount ?? 0,
        source: prompt.source ?? null,
        last_ai_response: prompt.lastAiResponse ?? null,
        created_at: prompt.createdAt ? new Date(prompt.createdAt).getTime() : Date.now(),
        updated_at: prompt.updatedAt ? new Date(prompt.updatedAt).getTime() : Date.now(),
      },
      manager,
    );
  }

  async rollback(promptId: string, version: number): Promise<IPrompt | null> {
    const row = await this.repo.findVersionRow(promptId, version);
    if (!row) return null;
    const versionData = this.rowToVersion(row as unknown as IPromptVersionRow);
    return this.update(promptId, {
      systemPrompt: versionData.systemPrompt ?? undefined,
      systemPromptEn: versionData.systemPromptEn ?? undefined,
      userPrompt: versionData.userPrompt,
      userPromptEn: versionData.userPromptEn ?? undefined,
      variables: versionData.variables,
      lastAiResponse: versionData.aiResponse ?? undefined,
    });
  }

  private rowToPrompt(row: Record<string, unknown>): IPrompt {
    return {
      id: String(row.id),
      ownerUserId: row.owner_user_id != null ? String(row.owner_user_id) : undefined,
      visibility: ((row.visibility as string) ?? 'private') as EResourceVisibility,
      title: String(row.title),
      systemPrompt: row.system_prompt != null ? String(row.system_prompt) : undefined,
      systemPromptEn: row.system_prompt_en != null ? String(row.system_prompt_en) : undefined,
      userPrompt: String(row.user_prompt),
      userPromptEn: row.user_prompt_en != null ? String(row.user_prompt_en) : undefined,
      variables: JSON.parse(String(row.variables || '[]')),
      tags: JSON.parse(String(row.tags || '[]')),
      folderId: row.folder_id != null ? String(row.folder_id) : undefined,
      isFavorite: Number(row.is_favorite) === 1,
      isPinned: Number(row.is_pinned) === 1,
      version: Number(row.current_version),
      currentVersion: Number(row.current_version),
      usageCount: Number(row.usage_count),
      source: row.source != null ? String(row.source) : undefined,
      lastAiResponse: row.last_ai_response != null ? String(row.last_ai_response) : undefined,
      createdAt: new Date(Number(row.created_at)).toISOString(),
      updatedAt: new Date(Number(row.updated_at)).toISOString(),
    };
  }

  private rowToVersion(row: IPromptVersionRow): IPromptVersion {
    return {
      id: row.id,
      promptId: row.prompt_id,
      version: row.version,
      systemPrompt: row.system_prompt,
      systemPromptEn: row.system_prompt_en,
      userPrompt: row.user_prompt,
      userPromptEn: row.user_prompt_en,
      variables: JSON.parse(row.variables || '[]'),
      note: row.note,
      aiResponse: row.ai_response,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}

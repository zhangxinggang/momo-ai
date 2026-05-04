import type { EntityManager } from 'typeorm';

import { runInTransaction, runQuery } from './sql-runner';

/** prompts / prompt_versions 表数据访问 */
export class PromptRepository {
  async insertOnCreate(
    params: {
      id: string;
      title: string;
      system_prompt: string | null;
      system_prompt_en: string | null;
      user_prompt: string;
      user_prompt_en: string | null;
      variables: string;
      tags: string;
      folder_id: string | null;
      source: string | null;
      last_ai_response: string | null;
      is_favorite: number;
      current_version: number;
      usage_count: number;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO prompts (
        id, title, system_prompt, system_prompt_en, user_prompt,
        user_prompt_en, variables, tags, folder_id, source,
        last_ai_response, is_favorite, current_version, usage_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.title,
        params.system_prompt,
        params.system_prompt_en,
        params.user_prompt,
        params.user_prompt_en,
        params.variables,
        params.tags,
        params.folder_id,
        params.source,
        params.last_ai_response,
        params.is_favorite,
        params.current_version,
        params.usage_count,
        params.created_at,
        params.updated_at,
      ],
      manager,
    );
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>('SELECT * FROM prompts WHERE id = ?', [
      id,
    ]);
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findAllOrdered(): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM prompts ORDER BY updated_at DESC',
    );
    return Array.isArray(rows) ? rows : [];
  }

  async updateDynamic(setsSql: string, values: unknown[], manager?: EntityManager): Promise<void> {
    await runQuery(`UPDATE prompts SET ${setsSql}`, values, manager);
  }

  async deleteById(id: string): Promise<void> {
    await runQuery('DELETE FROM prompts WHERE id = ?', [id]);
  }

  async search(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  async incrementUsage(id: string): Promise<void> {
    await runQuery('UPDATE prompts SET usage_count = usage_count + 1 WHERE id = ?', [id]);
  }

  async findCurrentVersion(promptId: string, manager: EntityManager): Promise<number> {
    const rows = await runQuery<{ current_version: number }[]>(
      'SELECT current_version FROM prompts WHERE id = ?',
      [promptId],
      manager,
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    return row?.current_version ?? 0;
  }

  async insertPromptVersion(
    args: {
      id: string;
      promptId: string;
      version: number;
      system_prompt: string | null;
      system_prompt_en: string | null;
      user_prompt: string;
      user_prompt_en: string | null;
      variables: string;
      note: string | null;
      ai_response: string | null;
      created_at: number;
    },
    manager: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO prompt_versions (
          id, prompt_id, version, system_prompt, system_prompt_en, user_prompt,
          user_prompt_en, variables, note, ai_response, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        args.id,
        args.promptId,
        args.version,
        args.system_prompt,
        args.system_prompt_en,
        args.user_prompt,
        args.user_prompt_en,
        args.variables,
        args.note,
        args.ai_response,
        args.created_at,
      ],
      manager,
    );
  }

  async setPromptCurrentVersion(
    promptId: string,
    version: number,
    manager: EntityManager,
  ): Promise<void> {
    await runQuery(
      'UPDATE prompts SET current_version = ? WHERE id = ?',
      [version, promptId],
      manager,
    );
  }

  async findVersions(promptId: string): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM prompt_versions WHERE prompt_id = ? ORDER BY version DESC',
      [promptId],
    );
    return Array.isArray(rows) ? rows : [];
  }

  async findVersionRow(
    promptId: string,
    version: number,
  ): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM prompt_versions WHERE prompt_id = ? AND version = ?',
      [promptId, version],
    );
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async deleteVersionById(versionId: string): Promise<void> {
    await runQuery('DELETE FROM prompt_versions WHERE id = ?', [versionId]);
  }

  async insertVersionDirectRow(
    row: {
      id: string;
      prompt_id: string;
      version: number;
      system_prompt: string | null;
      system_prompt_en: string | null;
      user_prompt: string;
      user_prompt_en: string | null;
      variables: string;
      note: string | null;
      ai_response: string | null;
      created_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT OR IGNORE INTO prompt_versions (
          id, prompt_id, version, system_prompt, system_prompt_en, user_prompt,
          user_prompt_en, variables, note, ai_response, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.prompt_id,
        row.version,
        row.system_prompt,
        row.system_prompt_en,
        row.user_prompt,
        row.user_prompt_en,
        row.variables,
        row.note,
        row.ai_response,
        row.created_at,
      ],
      manager,
    );
  }

  async upsertPromptDirect(
    row: {
      id: string;
      title: string;
      system_prompt: string | null;
      system_prompt_en: string | null;
      user_prompt: string;
      user_prompt_en: string | null;
      variables: string;
      tags: string;
      folder_id: string | null;
      is_favorite: number;
      is_pinned: number;
      current_version: number;
      usage_count: number;
      source: string | null;
      last_ai_response: string | null;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT OR REPLACE INTO prompts (
          id, title, system_prompt, system_prompt_en, user_prompt,
          user_prompt_en, variables, tags, folder_id, is_favorite, is_pinned,
          current_version, usage_count, source, last_ai_response, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.title,
        row.system_prompt,
        row.system_prompt_en,
        row.user_prompt,
        row.user_prompt_en,
        row.variables,
        row.tags,
        row.folder_id,
        row.is_favorite,
        row.is_pinned,
        row.current_version,
        row.usage_count,
        row.source,
        row.last_ai_response,
        row.created_at,
        row.updated_at,
      ],
      manager,
    );
  }

  async runInTransaction<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
    return runInTransaction(fn);
  }
}

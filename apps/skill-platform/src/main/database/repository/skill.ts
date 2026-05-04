import type { EntityManager } from 'typeorm';

import { runInTransaction, runQuery } from './sql-runner';

/** skills / skill_versions 表 SQL 访问 */
export class SkillRepository {
  async findByLowerName(name: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM skills WHERE LOWER(name) = LOWER(?)',
      [name],
    );
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>('SELECT * FROM skills WHERE id = ?', [
      id,
    ]);
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM skills ORDER BY updated_at DESC',
    );
    return Array.isArray(rows) ? rows : [];
  }

  async insertSkillFull(values: unknown[]): Promise<void> {
    const ph = new Array(34).fill('?').join(', ');
    await runQuery(
      `INSERT INTO skills (
        id, name, description, content, mcp_config,
        protocol_type, version, author, tags, original_tags, is_favorite,
        source_url, local_repo_path, icon_url, icon_emoji, icon_background, category, is_builtin,
        registry_slug, content_url, installed_content_hash, installed_version, installed_at,
        updated_from_store_at, prerequisites, compatibility, current_version,
        version_tracking_enabled, safety_level, safety_score, safety_report, safety_scanned_at,
        created_at, updated_at
      ) VALUES (${ph})`,
      values,
    );
  }

  async updateDynamic(sets: string, vals: unknown[]): Promise<void> {
    await runQuery(`UPDATE skills SET ${sets}`, vals);
  }

  async deleteSkill(id: string): Promise<void> {
    await runQuery('DELETE FROM skills WHERE id = ?', [id]);
  }

  async deleteAllSkillsAndVersions(): Promise<void> {
    await runInTransaction(async (m) => {
      await runQuery('DELETE FROM skill_versions', [], m);
      await runQuery('DELETE FROM skills', [], m);
    });
  }

  async insertSkillDirectParams(values: unknown[]): Promise<void> {
    const ph = new Array(34).fill('?').join(', ');
    await runQuery(
      `INSERT OR REPLACE INTO skills (
          id, name, description, content, mcp_config,
          protocol_type, version, author, tags, original_tags, is_favorite,
          source_url, local_repo_path, icon_url, icon_emoji, icon_background, category, is_builtin,
          registry_slug, content_url, installed_content_hash, installed_version, installed_at,
          updated_from_store_at, prerequisites, compatibility, current_version,
          version_tracking_enabled, safety_level, safety_score, safety_report, safety_scanned_at,
          created_at, updated_at
        ) VALUES (${ph})`,
      values,
    );
  }

  async insertVersionDirectParams(values: unknown[]): Promise<void> {
    await runQuery(
      `INSERT OR IGNORE INTO skill_versions (
          id, skill_id, version, content, files_snapshot, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values,
    );
  }

  async findVersions(skillId: string): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM skill_versions WHERE skill_id = ? ORDER BY version DESC',
      [skillId],
    );
    return Array.isArray(rows) ? rows : [];
  }

  async findVersion(
    skillId: string,
    version: number,
  ): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM skill_versions WHERE skill_id = ? AND version = ?',
      [skillId, version],
    );
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async deleteVersion(skillId: string, versionId: string): Promise<void> {
    await runQuery('DELETE FROM skill_versions WHERE skill_id = ? AND id = ?', [
      skillId,
      versionId,
    ]);
  }

  async findCurrentVersion(skillId: string, m: EntityManager): Promise<number> {
    const rows = await runQuery<{ current_version: number }[]>(
      'SELECT current_version FROM skills WHERE id = ?',
      [skillId],
      m,
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    return row?.current_version ?? 0;
  }

  async insertSkillVersion(
    args: {
      id: string;
      skillId: string;
      version: number;
      content: string | null;
      filesSnapshot: string | null;
      note: string | null;
      createdAt: number;
    },
    m: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO skill_versions (
          id, skill_id, version, content, files_snapshot, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        args.id,
        args.skillId,
        args.version,
        args.content,
        args.filesSnapshot,
        args.note,
        args.createdAt,
      ],
      m,
    );
  }

  async setSkillCurrentVersion(skillId: string, version: number, m: EntityManager): Promise<void> {
    await runQuery('UPDATE skills SET current_version = ? WHERE id = ?', [version, skillId], m);
  }

  async setVersionTrackingEnabled(skillId: string, m: EntityManager): Promise<void> {
    await runQuery('UPDATE skills SET version_tracking_enabled = 1 WHERE id = ?', [skillId], m);
  }

  async runInTransaction<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
    return runInTransaction(fn);
  }
}

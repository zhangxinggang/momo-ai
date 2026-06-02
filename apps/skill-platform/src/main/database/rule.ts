import type { IRuleRecord } from '@/types/modules';
import { isRuleFileId, isRulePlatformId } from '@/types/modules/rules';
import type { Database } from 'better-sqlite3';

interface IRuleRow {
  id: string;
  scope: 'global' | 'project';
  platform_id: string;
  platform_name: string;
  platform_icon: string;
  platform_description: string;
  canonical_file_name: string;
  description: string;
  managed_path: string;
  target_path: string;
  project_root_path: string | null;
  sync_status: IRuleRecord['syncStatus'];
  current_version: number;
  content_hash: string;
  created_at: number;
  updated_at: number;
}

/** Rules SQLite 访问层 */
export class RuleDB {
  constructor(private db: Database) {}

  getAll(): IRuleRecord[] {
    const rows = this.db
      .prepare('SELECT * FROM rules ORDER BY scope ASC, updated_at DESC')
      .all() as IRuleRow[];
    return rows.map((row) => this.rowToRule(row));
  }

  getById(id: string): IRuleRecord | null {
    const row = this.db.prepare('SELECT * FROM rules WHERE id = ?').get(id) as IRuleRow | undefined;
    return row ? this.rowToRule(row) : null;
  }

  upsert(rule: IRuleRecord): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO rules (
          id, scope, platform_id, platform_name, platform_icon, platform_description,
          canonical_file_name, description, managed_path, target_path, project_root_path,
          sync_status, current_version, content_hash, created_at, updated_at
        ) VALUES (
          @id, @scope, @platform_id, @platform_name, @platform_icon, @platform_description,
          @canonical_file_name, @description, @managed_path, @target_path, @project_root_path,
          @sync_status, @current_version, @content_hash, @created_at, @updated_at
        )`,
      )
      .run({
        id: rule.id,
        scope: rule.scope,
        platform_id: rule.platformId,
        platform_name: rule.platformName,
        platform_icon: rule.platformIcon,
        platform_description: rule.platformDescription,
        canonical_file_name: rule.canonicalFileName,
        description: rule.description,
        managed_path: rule.managedPath,
        target_path: rule.targetPath,
        project_root_path: rule.projectRootPath ?? null,
        sync_status: rule.syncStatus,
        current_version: rule.currentVersion,
        content_hash: rule.contentHash,
        created_at: new Date(rule.createdAt).getTime(),
        updated_at: new Date(rule.updatedAt).getTime(),
      });
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM rules WHERE id = ?').run(id);
  }

  private rowToRule(row: IRuleRow): IRuleRecord {
    if (!isRuleFileId(row.id)) {
      throw new Error(`数据库中的规则 ID 无效: ${row.id}`);
    }
    if (!isRulePlatformId(row.platform_id)) {
      throw new Error(`数据库中的规则平台 ID 无效: ${row.platform_id}`);
    }
    return {
      id: row.id,
      scope: row.scope,
      platformId: row.platform_id,
      platformName: row.platform_name,
      platformIcon: row.platform_icon,
      platformDescription: row.platform_description,
      canonicalFileName: row.canonical_file_name,
      description: row.description,
      managedPath: row.managed_path,
      targetPath: row.target_path,
      projectRootPath: row.project_root_path ?? null,
      syncStatus: row.sync_status,
      currentVersion: row.current_version,
      contentHash: row.content_hash,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}

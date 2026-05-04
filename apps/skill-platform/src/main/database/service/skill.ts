import type {
  DCreateSkill,
  DUpdateSkill,
  ISkill,
  ISkillFileSnapshot,
  ISkillSafetyReport,
  ISkillVersion,
} from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

import { SkillRepository } from '../repository/skill';
import { runQuery } from '../repository/sql-runner';

interface ISkillRow {
  id: string;
  name: string;
  description: string | null;
  content: string | null;
  mcp_config: string | null;
  protocol_type: ISkill['protocol_type'];
  version: string | null;
  author: string | null;
  tags: string | null;
  original_tags: string | null;
  is_favorite: number;
  installed_content_hash: string | null;
  installed_version: string | null;
  installed_at: number | null;
  updated_from_store_at: number | null;
  source_url: string | null;
  local_repo_path: string | null;
  icon_url: string | null;
  icon_emoji: string | null;
  icon_background: string | null;
  category: ISkill['category'] | null;
  is_builtin: number;
  registry_slug: string | null;
  content_url: string | null;
  prerequisites: string | null;
  compatibility: string | null;
  current_version: number | null;
  version_tracking_enabled: number | null;
  created_at: number;
  updated_at: number;
  safety_level: string | null;
  safety_score: number | null;
  safety_report: string | null;
  safety_scanned_at: number | null;
}

interface ISkillVersionRow {
  id: string;
  skill_id: string;
  version: number;
  content: string | null;
  files_snapshot: string | null;
  note: string | null;
  created_at: number;
}

function parseJsonArray<T>(value: string | null | undefined): T[] | undefined {
  return value ? (JSON.parse(value) as T[]) : undefined;
}

/** ISkill 业务逻辑 */
export class SkillService {
  private readonly repo = new SkillRepository();

  async getByName(name: string): Promise<ISkill | null> {
    const row = await this.repo.findByLowerName(name);
    return row ? this.rowToSkill(row as unknown as ISkillRow) : null;
  }

  async create(
    data: DCreateSkill,
    options?: { skipInitialVersion?: boolean; overwriteExisting?: boolean },
  ): Promise<ISkill> {
    const normalizedName = typeof data.name === 'string' ? data.name.trim() : data.name;
    if (!normalizedName || typeof normalizedName !== 'string') {
      throw new Error(`Cannot create skill: name is required but got "${data.name}"`);
    }

    const existing = await this.getByName(normalizedName);
    if (existing) {
      if (options?.overwriteExisting) {
        return (await this.update(existing.id, { ...data, name: normalizedName })) ?? existing;
      }
      throw new Error(`ISkill already exists: ${normalizedName}`);
    }

    const id = uuidv4();
    const now = Date.now();
    const tagsJson = JSON.stringify(data.tags || []);
    const safetyReport = data.safetyReport;

    await this.repo.insertSkillFull([
      id,
      normalizedName,
      data.description || null,
      data.content || data.instructions || null,
      data.mcp_config || null,
      data.protocol_type || 'mcp',
      data.version || '1.0.0',
      data.author || 'User',
      tagsJson,
      data.original_tags ? JSON.stringify(data.original_tags) : tagsJson,
      data.is_favorite ? 1 : 0,
      data.source_url || null,
      data.local_repo_path || null,
      data.icon_url || null,
      data.icon_emoji || null,
      data.icon_background || null,
      data.category || 'general',
      data.is_builtin ? 1 : 0,
      data.registry_slug || null,
      data.content_url || null,
      data.installed_content_hash || null,
      data.installed_version || null,
      data.installed_at ?? null,
      data.updated_from_store_at ?? null,
      data.prerequisites ? JSON.stringify(data.prerequisites) : null,
      data.compatibility ? JSON.stringify(data.compatibility) : null,
      data.currentVersion ?? 0,
      (data.versionTrackingEnabled ?? true) ? 1 : 0,
      safetyReport?.level ?? null,
      safetyReport?.score ?? null,
      safetyReport ? JSON.stringify(safetyReport) : null,
      safetyReport?.scannedAt ?? null,
      now,
      now,
    ]);

    if (!options?.skipInitialVersion) {
      await this.createVersion(id, 'Initial version');
    }
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<ISkill | null> {
    const row = await this.repo.findById(id);
    return row ? this.rowToSkill(row as unknown as ISkillRow) : null;
  }

  async getAll(): Promise<ISkill[]> {
    const rows = await this.repo.findAll();
    return rows.map((r) => this.rowToSkill(r as unknown as ISkillRow));
  }

  async update(id: string, data: DUpdateSkill): Promise<ISkill | null> {
    const existingSkill = await this.getById(id);
    if (!existingSkill) return null;

    if (data.name !== undefined) {
      const normalizedName = data.name.trim();
      if (!normalizedName) throw new Error('ISkill name cannot be empty');
      const duplicateSkill = await this.getByName(normalizedName);
      if (duplicateSkill && duplicateSkill.id !== id) {
        throw new Error(`ISkill already exists: ${normalizedName}`);
      }
    }

    const now = Date.now();
    const updates: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name.trim());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.instructions !== undefined) {
      updates.push('content = ?');
      values.push(data.instructions);
    } else if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.mcp_config !== undefined) {
      updates.push('mcp_config = ?');
      values.push(data.mcp_config);
    }
    if (data.protocol_type !== undefined) {
      updates.push('protocol_type = ?');
      values.push(data.protocol_type);
    }
    if (data.version !== undefined) {
      updates.push('version = ?');
      values.push(data.version);
    }
    if (data.author !== undefined) {
      updates.push('author = ?');
      values.push(data.author);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.is_favorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(data.is_favorite ? 1 : 0);
    }
    if (data.source_url !== undefined) {
      updates.push('source_url = ?');
      values.push(data.source_url);
    }
    if (data.local_repo_path !== undefined) {
      updates.push('local_repo_path = ?');
      values.push(data.local_repo_path);
    }
    if (data.icon_url !== undefined) {
      updates.push('icon_url = ?');
      values.push(data.icon_url);
    }
    if (data.icon_emoji !== undefined) {
      updates.push('icon_emoji = ?');
      values.push(data.icon_emoji);
    }
    if (data.icon_background !== undefined) {
      updates.push('icon_background = ?');
      values.push(data.icon_background);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.is_builtin !== undefined) {
      updates.push('is_builtin = ?');
      values.push(data.is_builtin ? 1 : 0);
    }
    if (data.registry_slug !== undefined) {
      updates.push('registry_slug = ?');
      values.push(data.registry_slug);
    }
    if (data.content_url !== undefined) {
      updates.push('content_url = ?');
      values.push(data.content_url);
    }
    if (data.installed_content_hash !== undefined) {
      updates.push('installed_content_hash = ?');
      values.push(data.installed_content_hash);
    }
    if (data.installed_version !== undefined) {
      updates.push('installed_version = ?');
      values.push(data.installed_version);
    }
    if (data.installed_at !== undefined) {
      updates.push('installed_at = ?');
      values.push(data.installed_at);
    }
    if (data.updated_from_store_at !== undefined) {
      updates.push('updated_from_store_at = ?');
      values.push(data.updated_from_store_at);
    }
    if (data.prerequisites !== undefined) {
      updates.push('prerequisites = ?');
      values.push(JSON.stringify(data.prerequisites));
    }
    if (data.compatibility !== undefined) {
      updates.push('compatibility = ?');
      values.push(JSON.stringify(data.compatibility));
    }
    if (data.currentVersion !== undefined) {
      updates.push('current_version = ?');
      values.push(data.currentVersion);
    }
    if (data.versionTrackingEnabled !== undefined) {
      updates.push('version_tracking_enabled = ?');
      values.push(data.versionTrackingEnabled ? 1 : 0);
    }
    if (data.safetyReport !== undefined) {
      const report = data.safetyReport;
      updates.push('safety_level = ?');
      values.push(report.level);
      updates.push('safety_score = ?');
      values.push(report.score ?? null);
      updates.push('safety_report = ?');
      values.push(JSON.stringify(report));
      updates.push('safety_scanned_at = ?');
      values.push(report.scannedAt);
    }

    values.push(id);
    await this.repo.updateDynamic(`${updates.join(', ')} WHERE id = ?`, values);

    const newContent = data.instructions ?? data.content ?? existingSkill.content;
    const updatedSkill: ISkill = {
      ...existingSkill,
      updated_at: now,
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...((data.content !== undefined || data.instructions !== undefined) && {
        content: newContent,
        instructions: newContent,
      }),
      ...(data.mcp_config !== undefined && { mcp_config: data.mcp_config }),
      ...(data.protocol_type !== undefined && { protocol_type: data.protocol_type }),
      ...(data.version !== undefined && { version: data.version }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.is_favorite !== undefined && { is_favorite: data.is_favorite }),
      ...(data.source_url !== undefined && { source_url: data.source_url }),
      ...(data.local_repo_path !== undefined && { local_repo_path: data.local_repo_path }),
      ...(data.icon_url !== undefined && { icon_url: data.icon_url }),
      ...(data.icon_emoji !== undefined && { icon_emoji: data.icon_emoji }),
      ...(data.icon_background !== undefined && { icon_background: data.icon_background }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.is_builtin !== undefined && { is_builtin: data.is_builtin }),
      ...(data.registry_slug !== undefined && { registry_slug: data.registry_slug }),
      ...(data.content_url !== undefined && { content_url: data.content_url }),
      ...(data.installed_content_hash !== undefined && {
        installed_content_hash: data.installed_content_hash,
      }),
      ...(data.installed_version !== undefined && { installed_version: data.installed_version }),
      ...(data.installed_at !== undefined && { installed_at: data.installed_at }),
      ...(data.updated_from_store_at !== undefined && {
        updated_from_store_at: data.updated_from_store_at,
      }),
      ...(data.prerequisites !== undefined && { prerequisites: data.prerequisites }),
      ...(data.compatibility !== undefined && { compatibility: data.compatibility }),
      ...(data.currentVersion !== undefined && { currentVersion: data.currentVersion }),
      ...(data.versionTrackingEnabled !== undefined && {
        versionTrackingEnabled: data.versionTrackingEnabled,
      }),
      ...(data.safetyReport !== undefined && { safetyReport: data.safetyReport }),
    };
    return updatedSkill;
  }

  async createVersion(
    skillId: string,
    note?: string,
    filesSnapshot?: ISkillFileSnapshot[],
    existingSkill?: ISkill,
  ): Promise<ISkillVersion | null> {
    const skill = existingSkill ?? (await this.getById(skillId));
    if (!skill) return null;

    return this.repo.runInTransaction(async (m) => {
      const cv = await this.repo.findCurrentVersion(skillId, m);
      const version = cv + 1;
      const vid = uuidv4();
      const now = Date.now();
      await this.repo.insertSkillVersion(
        {
          id: vid,
          skillId,
          version,
          content: skill.content || null,
          filesSnapshot: filesSnapshot ? JSON.stringify(filesSnapshot) : null,
          note: note || null,
          createdAt: now,
        },
        m,
      );
      await this.repo.setSkillCurrentVersion(skillId, version, m);
      await this.repo.setVersionTrackingEnabled(skillId, m);
      return {
        id: vid,
        skillId,
        version,
        content: skill.content,
        filesSnapshot,
        note,
        createdAt: new Date(now).toISOString(),
      } as ISkillVersion;
    });
  }

  async getVersions(skillId: string): Promise<ISkillVersion[]> {
    const rows = await this.repo.findVersions(skillId);
    return rows.map((r) => this.rowToSkillVersion(r as unknown as ISkillVersionRow));
  }

  async getVersion(skillId: string, version: number): Promise<ISkillVersion | null> {
    const row = await this.repo.findVersion(skillId, version);
    return row ? this.rowToSkillVersion(row as unknown as ISkillVersionRow) : null;
  }

  async deleteVersion(skillId: string, versionId: string): Promise<boolean> {
    const rows = await runQuery<unknown[]>(
      'SELECT 1 FROM skill_versions WHERE skill_id = ? AND id = ? LIMIT 1',
      [skillId, versionId],
    );
    if (!Array.isArray(rows) || rows.length === 0) return false;
    await this.repo.deleteVersion(skillId, versionId);
    return true;
  }

  async rollbackVersion(skillId: string, version: number): Promise<ISkill | null> {
    const row = await this.repo.findVersion(skillId, version);
    if (!row) return null;
    const versionData = this.rowToSkillVersion(row as unknown as ISkillVersionRow);
    return this.update(skillId, { content: versionData.content });
  }

  async delete(id: string): Promise<boolean> {
    const ex = await this.getById(id);
    if (!ex) return false;
    await this.repo.deleteSkill(id);
    return true;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAllSkillsAndVersions();
  }

  async insertSkillDirect(skill: ISkill): Promise<void> {
    const safetyReport = skill.safetyReport;
    await this.repo.insertSkillDirectParams([
      skill.id,
      skill.name,
      skill.description ?? null,
      skill.content ?? skill.instructions ?? null,
      skill.mcp_config ?? null,
      skill.protocol_type,
      skill.version ?? null,
      skill.author ?? null,
      JSON.stringify(skill.tags ?? []),
      JSON.stringify(skill.original_tags ?? skill.tags ?? []),
      skill.is_favorite ? 1 : 0,
      skill.source_url ?? null,
      skill.local_repo_path ?? null,
      skill.icon_url ?? null,
      skill.icon_emoji ?? null,
      skill.icon_background ?? null,
      skill.category ?? 'general',
      skill.is_builtin ? 1 : 0,
      skill.registry_slug ?? null,
      skill.content_url ?? null,
      skill.installed_content_hash ?? null,
      skill.installed_version ?? null,
      skill.installed_at ?? null,
      skill.updated_from_store_at ?? null,
      skill.prerequisites ? JSON.stringify(skill.prerequisites) : null,
      skill.compatibility ? JSON.stringify(skill.compatibility) : null,
      skill.currentVersion ?? 0,
      (skill.versionTrackingEnabled ?? true) ? 1 : 0,
      safetyReport?.level ?? null,
      safetyReport?.score ?? null,
      safetyReport ? JSON.stringify(safetyReport) : null,
      safetyReport?.scannedAt ?? null,
      skill.created_at || Date.now(),
      skill.updated_at || Date.now(),
    ]);
  }

  async insertVersionDirect(version: ISkillVersion): Promise<void> {
    await this.repo.insertVersionDirectParams([
      version.id,
      version.skillId,
      version.version,
      version.content || null,
      version.filesSnapshot ? JSON.stringify(version.filesSnapshot) : null,
      version.note || null,
      version.createdAt ? new Date(version.createdAt).getTime() : Date.now(),
    ]);
  }

  private rowToSkill(row: ISkillRow): ISkill {
    let safetyReport: ISkillSafetyReport | undefined;
    if (row.safety_report) {
      try {
        safetyReport = JSON.parse(row.safety_report) as ISkillSafetyReport;
      } catch {
        // ignore
      }
    }
    return {
      id: row.id,
      name: row.name,
      ...(row.description !== null && { description: row.description }),
      ...(row.content !== null && { content: row.content }),
      ...(row.content !== null && { instructions: row.content }),
      ...(row.mcp_config !== null && { mcp_config: row.mcp_config }),
      protocol_type: row.protocol_type,
      ...(row.version !== null && { version: row.version }),
      ...(row.author !== null && { author: row.author }),
      tags: parseJsonArray<string>(row.tags) ?? [],
      is_favorite: row.is_favorite === 1,
      currentVersion: row.current_version ?? 0,
      versionTrackingEnabled: row.version_tracking_enabled === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
      source_url: row.source_url || undefined,
      local_repo_path: row.local_repo_path || undefined,
      icon_url: row.icon_url || undefined,
      icon_emoji: row.icon_emoji || undefined,
      icon_background: row.icon_background || undefined,
      category: row.category || 'general',
      is_builtin: row.is_builtin === 1,
      registry_slug: row.registry_slug || undefined,
      content_url: row.content_url || undefined,
      installed_content_hash: row.installed_content_hash || undefined,
      installed_version: row.installed_version || undefined,
      installed_at: row.installed_at ?? undefined,
      updated_from_store_at: row.updated_from_store_at ?? undefined,
      prerequisites: parseJsonArray<string>(row.prerequisites),
      compatibility: parseJsonArray<string>(row.compatibility),
      original_tags: parseJsonArray<string>(row.original_tags),
      safetyReport,
    };
  }

  private rowToSkillVersion(row: ISkillVersionRow): ISkillVersion {
    return {
      id: row.id,
      skillId: row.skill_id,
      version: row.version,
      ...(row.content !== null && { content: row.content }),
      filesSnapshot: parseJsonArray<ISkillFileSnapshot>(row.files_snapshot),
      ...(row.note !== null && { note: row.note }),
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}

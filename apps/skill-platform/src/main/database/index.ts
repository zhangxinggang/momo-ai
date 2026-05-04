import { getDbConfig } from '@momo/electron';
import type { Database } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getSkillsDir, getUserDataPath } from '../runtime-paths';
import type { IInitDatabaseHooks } from './init';
import { closeDatabase, initDatabase as dbInit, getDatabase, isDatabaseEmpty } from './init';

export { destroyDataSource, getBetterSqliteFromDataSource } from '@momo/electron';
export { default as DatabaseAdapter } from 'better-sqlite3';
export { FolderController as FolderDB } from './controller/folder';
export { PromptController as PromptDB } from './controller/prompt';
export { SkillController as SkillDB } from './controller/skill';
export { WorkflowController as WorkflowDB } from './controller/workflow';
export * from './entities';
export { KB_SCHEMA_INDEXES, KB_SCHEMA_TABLES, KB_SCHEMA_TRIGGERS } from './kb';
export { SCHEMA_INDEXES, SCHEMA_TABLES } from './schema';
export { closeDatabase, getDatabase, isDatabaseEmpty };
export type { Database };

export function withBetterSqlite3NativeBinding(options: any): Database {
  return {
    ...options,
    ...getDbConfig(),
  };
}
// ── Path resolution ──────────────────────────────────────────────────────────

function getDbPath(): string {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, 'prompthub.db');
}

// ── ISkill repo path resolution hook ──────────────────────────────────────────

function resolveSkillRepoPath(skill: {
  id: string;
  name: string;
  source_url: string | null;
}): string | null {
  const skillsDir = getSkillsDir();

  // (a) Check skillsDir/skill.name
  const byName = path.join(skillsDir, skill.name);
  if (fs.existsSync(byName) && fs.statSync(byName).isDirectory()) {
    return byName;
  }

  // (b) Derive folder from GitHub source_url
  if (skill.source_url && skill.source_url.includes('github.com')) {
    const urlParts = skill.source_url.replace('https://github.com/', '').split('/');
    const userDir = urlParts[0];
    const repoName = urlParts[1];
    if (userDir && repoName) {
      const githubFolder = `${userDir}-${repoName}`;
      const byGithub = path.join(skillsDir, githubFolder);
      if (fs.existsSync(byGithub) && fs.statSync(byGithub).isDirectory()) {
        return byGithub;
      }
    }
  }

  // (c) source_url is a local filesystem path
  if (skill.source_url && !skill.source_url.includes('github.com')) {
    try {
      const stat = fs.statSync(skill.source_url);
      if (stat.isDirectory()) {
        return skill.source_url;
      }
    } catch {
      // path doesn't exist or can't be stat'd — skip
    }
  }

  return null;
}

// ── Desktop initDatabase wrapper ─────────────────────────────────────────────

const UPGRADE_BACKUP_MARKER = '.prompthub-0.5.3-backup-done';

/**
 * Make a one-time copy of prompthub.db before the first 0.5.3 boot touches it.
 * A marker file in userData prevents the backup from being repeated.
 *
 * v0.5.3: 首次启动前对 prompthub.db 做一次性备份，防止升级逻辑误伤数据。
 * 使用标记文件避免重复备份。
 */
function ensurePreUpgradeBackup(dbPath: string): void {
  try {
    if (!fs.existsSync(dbPath)) {
      return; // fresh install, nothing to back up
    }
    const markerPath = path.join(path.dirname(dbPath), UPGRADE_BACKUP_MARKER);
    if (fs.existsSync(markerPath)) {
      return; // already done on a previous 0.5.3 boot
    }

    const stats = fs.statSync(dbPath);
    if (stats.size < 4096) {
      // Trivially small DB — nothing meaningful to back up. Do NOT write the
      // marker here: if the user later imports real data and restarts, we want
      // the first "real" boot to still produce a safety backup.
      // v0.5.3 review 反馈修复：空库不写 marker，待真实数据出现时仍能触发备份。
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${dbPath}.backup-before-0.5.3.${timestamp}.db`;
    fs.copyFileSync(dbPath, backupPath);
    fs.writeFileSync(markerPath, new Date().toISOString(), 'utf8');
    console.log(`[startup] Pre-0.5.3 backup created at: ${backupPath}`);
  } catch (error) {
    // Backup is defensive — never let it crash startup.
    // 备份属于防御措施，失败不得阻断启动。
    console.warn('[startup] ensurePreUpgradeBackup failed (continuing):', error);
  }
}

/**
 * Initialize database with desktop-specific path resolution and hooks.
 */
export async function initDatabase(): Promise<Database> {
  const dbPath = getDbPath();
  ensurePreUpgradeBackup(dbPath);
  const hooks: IInitDatabaseHooks = {
    resolveSkillRepoPath,
  };
  return dbInit(dbPath, hooks);
}

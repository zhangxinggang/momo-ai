import { getDbConfig } from '@momo/electron';
import type { Database } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getSkillsDir, getUserDataPath } from '../runtime-paths';
import { resolveGitHubInstallDirName } from '../services/skill/install-path';
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
    const githubFolder = resolveGitHubInstallDirName(skill.source_url);
    if (githubFolder) {
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

/**
 * Initialize database with desktop-specific path resolution and hooks.
 */
export async function initDatabase(): Promise<Database> {
  const dbPath = getDbPath();
  const hooks: IInitDatabaseHooks = {
    resolveSkillRepoPath,
  };
  return dbInit(dbPath, hooks);
}

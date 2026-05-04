import { getDbConfig } from '@momo/electron';
import type { Database } from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { destroyDataSource, getBetterSqliteFromDataSource } from './';
import { ALL_ENTITIES } from './entities';
import { KB_SCHEMA_INDEXES, KB_SCHEMA_TABLES, KB_SCHEMA_TRIGGERS } from './kb';
import { SCHEMA_INDEXES, SCHEMA_TABLES } from './schema';

/** Column metadata returned by `PRAGMA table_info(...)`. */
interface IPragmaColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

/**
 * Hook functions that allow the host application to inject environment-specific
 * behaviour into the database initialization process.
 *
 * For example, the `resolveSkillRepoPath` hook lets the Electron desktop app
 * supply its skills directory for the `backfill_local_repo_path_v1` migration
 * without the database package needing to know about Electron APIs.
 */
export interface IInitDatabaseHooks {
  /**
   * Given a skill row (id, name, source_url), resolve the local repository
   * path by scanning the filesystem. Return `null` if no path can be found.
   *
   * If this hook is not provided, the `backfill_local_repo_path_v1` migration
   * will be skipped (and retried on next startup).
   */
  resolveSkillRepoPath?: (skill: {
    id: string;
    name: string;
    source_url: string | null;
  }) => string | null;
}

let db: Database | null = null;
let activeDbPath: string | null = null;
let appDataSource: DataSource | null = null;
/**
 * 历史版本使用 node-sqlite3-wasm 时会在 `<dbfile>.lock` 留下目录锁。
 * 若上次异常退出，锁目录可能残留；启动前主动清理以免误判锁定。
 */
function clearStaleLock(dbPath: string): void {
  const lockDir = `${dbPath}.lock`;
  try {
    fs.rmSync(lockDir, { recursive: true, force: true });
    console.log(`[DB] Cleared stale lock: ${lockDir}`);
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn(`[DB] Failed to clear stale lock (${lockDir}):`, err);
    }
  }
}

/**
 * Create a timestamped backup of the database file before running migrations.
 * Returns the backup path on success, or null if no backup was needed/possible.
 */
function backupDatabaseBeforeMigration(dbPath: string): string | null {
  try {
    if (!fs.existsSync(dbPath)) {
      return null;
    }
    const stat = fs.statSync(dbPath);
    // Only back up non-empty databases (empty = freshly created)
    if (stat.size === 0) {
      return null;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${dbPath}.backup-${timestamp}`;
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[DB] Pre-migration backup created: ${backupPath}`);
    return backupPath;
  } catch (err) {
    console.warn('[DB] Failed to create pre-migration backup:', err);
    return null;
  }
}

export function getAppDataSource(): DataSource {
  if (!appDataSource?.isInitialized) {
    throw new Error('DataSource 未初始化');
  }
  return appDataSource;
}
/**
 * 检测数据库完整性；若损坏则隔离旧文件并允许重新创建空库。
 */
function recoverCorruptedDatabaseIfNeeded(dbPath: string): void {
  if (!fs.existsSync(dbPath)) {
    return;
  }

  let probe: Database | null = null;
  let isHealthy = false;

  try {
    probe = new BetterSqlite3(dbPath, { readonly: true, ...getDbConfig() });
    const rows = probe.pragma('integrity_check') as Array<{ integrity_check: string }>;
    isHealthy = rows.length === 1 && rows[0]?.integrity_check === 'ok';
  } catch (error) {
    console.error('[DB] Failed to run integrity_check:', error);
  } finally {
    try {
      probe?.close();
    } catch {
      // 忽略关闭失败
    }
  }

  if (isHealthy) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const corruptPath = `${dbPath}.corrupt-${timestamp}`;

  try {
    fs.renameSync(dbPath, corruptPath);
    for (const suffix of ['-wal', '-shm']) {
      const sidecar = `${dbPath}${suffix}`;
      if (fs.existsSync(sidecar)) {
        fs.renameSync(sidecar, `${corruptPath}${suffix}`);
      }
    }
    console.warn(`[DB] Corrupted database quarantined to ${corruptPath}`);
  } catch (error) {
    console.error('[DB] Failed to quarantine corrupted database:', error);
    throw error;
  }
}

/**
 * Initialize database at the given path, run schema creation and migrations.
 *
 * @param dbPath  Absolute path to the SQLite database file.
 * @param hooks   Optional hooks for environment-specific behaviour (e.g. filesystem scanning).
 */
export async function initDatabase(dbPath: string, hooks?: IInitDatabaseHooks): Promise<Database> {
  if (db) return db;

  activeDbPath = dbPath;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  clearStaleLock(dbPath);
  recoverCorruptedDatabaseIfNeeded(dbPath);
  backupDatabaseBeforeMigration(dbPath);
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [...ALL_ENTITIES],
    synchronize: false,
    logging: false,
    ...getDbConfig(),
  });
  await ds.initialize();
  appDataSource = ds;
  db = getBetterSqliteFromDataSource(ds);

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');

  // Create tables only (indexes come after migrations)
  db.exec(SCHEMA_TABLES);

  // Run all migrations in a single transaction to avoid lock contention.
  // Each table's column list is fetched exactly once and reused.
  const runMigrations = db.transaction(() => {
    // ── schema_migrations table ───────────────────────────────────────────────
    db!.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL
      )
    `);

    const hasMigration = (name: string): boolean => {
      return !!db!.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(name);
    };
    const markMigration = (name: string): void => {
      db!
        .prepare('INSERT OR IGNORE INTO schema_migrations (name, applied_at) VALUES (?, ?)')
        .run(name, Date.now());
    };

    // Rules 已移除：若旧库仍存在则直接 DROP（幂等，不写 schema_migrations）
    db!.exec(`
      DROP TABLE IF EXISTS rule_versions;
      DROP TABLE IF EXISTS rules;
    `);

    // Migrations: prompts table (query column list once)
    const promptCols = (db!.pragma('table_info(prompts)') as IPragmaColumnInfo[]).map(
      (c) => c.name,
    );

    if (!promptCols.includes('images')) {
      console.log('Migrating: Adding images column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN images TEXT').run();
    }

    if (!promptCols.includes('is_pinned')) {
      console.log('Migrating: Adding is_pinned column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN is_pinned INTEGER DEFAULT 0').run();
    }

    if (!promptCols.includes('source')) {
      console.log('Migrating: Adding source column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN source TEXT').run();
    }

    if (!promptCols.includes('notes')) {
      console.log('Migrating: Adding notes column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN notes TEXT').run();
    }

    if (!promptCols.includes('prompt_type')) {
      console.log('Migrating: Adding prompt_type column to prompts table');
      db!.prepare("ALTER TABLE prompts ADD COLUMN prompt_type TEXT DEFAULT 'text'").run();
    }

    if (!promptCols.includes('system_prompt_en')) {
      console.log('Migrating: Adding system_prompt_en column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN system_prompt_en TEXT').run();
    }

    if (!promptCols.includes('user_prompt_en')) {
      console.log('Migrating: Adding user_prompt_en column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN user_prompt_en TEXT').run();
    }

    if (!promptCols.includes('videos')) {
      console.log('Migrating: Adding videos column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN videos TEXT').run();
    }

    if (!promptCols.includes('last_ai_response')) {
      console.log('Migrating: Adding last_ai_response column to prompts table');
      db!.prepare('ALTER TABLE prompts ADD COLUMN last_ai_response TEXT').run();
    }

    if (!promptCols.includes('owner_user_id')) {
      console.log('Migrating: Adding owner_user_id column to prompts table');
      db!
        .prepare(
          'ALTER TABLE prompts ADD COLUMN owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL',
        )
        .run();
    }

    if (!promptCols.includes('visibility')) {
      console.log('Migrating: Adding visibility column to prompts table');
      db!
        .prepare("ALTER TABLE prompts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'")
        .run();
    }

    // Migrations: folders table (query column list once)
    const folderCols = (db!.pragma('table_info(folders)') as IPragmaColumnInfo[]).map(
      (c) => c.name,
    );

    if (!folderCols.includes('is_private')) {
      console.log('Migrating: Adding is_private column to folders table');
      db!.prepare('ALTER TABLE folders ADD COLUMN is_private INTEGER DEFAULT 0').run();
    }

    if (!folderCols.includes('updated_at')) {
      console.log('Migrating: Adding updated_at column to folders table');
      db!.prepare('ALTER TABLE folders ADD COLUMN updated_at INTEGER').run();
    }

    if (!folderCols.includes('owner_user_id')) {
      console.log('Migrating: Adding owner_user_id column to folders table');
      db!
        .prepare(
          'ALTER TABLE folders ADD COLUMN owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL',
        )
        .run();
    }

    if (!folderCols.includes('visibility')) {
      console.log('Migrating: Adding visibility column to folders table');
      db!
        .prepare("ALTER TABLE folders ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'")
        .run();
    }

    // Migrations: skills table (query column list once)
    const skillCols = (db!.pragma('table_info(skills)') as IPragmaColumnInfo[]).map((c) => c.name);

    const skillNewColumns: { name: string; type: string }[] = [
      { name: 'source_url', type: 'TEXT' },
      { name: 'icon_url', type: 'TEXT' },
      { name: 'icon_emoji', type: 'TEXT' },
      { name: 'icon_background', type: 'TEXT' },
      { name: 'category', type: "TEXT DEFAULT 'general'" },
      { name: 'is_builtin', type: 'INTEGER DEFAULT 0' },
      { name: 'registry_slug', type: 'TEXT' },
      { name: 'content_url', type: 'TEXT' },
      { name: 'installed_content_hash', type: 'TEXT' },
      { name: 'installed_version', type: 'TEXT' },
      { name: 'installed_at', type: 'INTEGER' },
      { name: 'updated_from_store_at', type: 'INTEGER' },
      { name: 'prerequisites', type: 'TEXT' },
      { name: 'compatibility', type: 'TEXT' },
      { name: 'original_tags', type: 'TEXT' },
      { name: 'current_version', type: 'INTEGER DEFAULT 0' },
      { name: 'version_tracking_enabled', type: 'INTEGER DEFAULT 0' },
      { name: 'local_repo_path', type: 'TEXT' },
      { name: 'safety_level', type: 'TEXT' },
      { name: 'safety_score', type: 'INTEGER' },
      { name: 'safety_report', type: 'TEXT' },
      { name: 'safety_scanned_at', type: 'INTEGER' },
    ];

    for (const col of skillNewColumns) {
      if (!skillCols.includes(col.name)) {
        console.log(`Migrating: Adding ${col.name} column to skills table`);
        db!.prepare(`ALTER TABLE skills ADD COLUMN ${col.name} ${col.type}`).run();
      }
    }

    if (!skillCols.includes('owner_user_id')) {
      console.log('Migrating: Adding owner_user_id column to skills table');
      db!
        .prepare(
          'ALTER TABLE skills ADD COLUMN owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL',
        )
        .run();
    }

    if (!skillCols.includes('visibility')) {
      console.log('Migrating: Adding visibility column to skills table');
      db!.prepare("ALTER TABLE skills ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'").run();
    }

    // Backfill: set original_tags = tags for existing skills that don't have original_tags yet
    if (!skillCols.includes('original_tags')) {
      db!.prepare('UPDATE skills SET original_tags = tags WHERE original_tags IS NULL').run();
      console.log('Migrated: Backfilled original_tags for existing skills');
    }

    // ── skills backfill: local_repo_path ──────────────────────────────────────
    if (!hasMigration('backfill_local_repo_path_v1')) {
      if (hooks?.resolveSkillRepoPath) {
        try {
          const skillsWithoutPath = db!
            .prepare(
              "SELECT id, name, source_url FROM skills WHERE local_repo_path IS NULL OR local_repo_path = ''",
            )
            .all() as {
            id: string;
            name: string;
            source_url: string | null;
          }[];

          for (const skill of skillsWithoutPath) {
            const foundPath = hooks.resolveSkillRepoPath(skill);
            if (foundPath) {
              db!
                .prepare('UPDATE skills SET local_repo_path = ? WHERE id = ?')
                .run(foundPath, skill.id);
              console.log(
                `Migrated: Backfilled local_repo_path for skill "${skill.name}" → ${foundPath}`,
              );
            }
          }
        } catch (backfillError) {
          console.error(
            'Failed to backfill local_repo_path for skills (non-fatal):',
            backfillError,
          );
          // Do NOT mark migration as completed on failure — it will be retried next startup
          return;
        }
      }
      markMigration('backfill_local_repo_path_v1');
    }

    if (!hasMigration('normalize_skill_version_tracking_v1')) {
      try {
        const skillsWithVersionStats = db!
          .prepare(
            `SELECT
               s.id AS id,
               MAX(sv.version) AS max_version
             FROM skills s
             LEFT JOIN skill_versions sv ON sv.skill_id = s.id
             GROUP BY s.id`,
          )
          .all() as Array<{ id: string; max_version: number | null }>;

        for (const skill of skillsWithVersionStats) {
          const hasTrackedVersions = typeof skill.max_version === 'number' && skill.max_version > 0;
          db!
            .prepare(
              'UPDATE skills SET current_version = ?, version_tracking_enabled = ? WHERE id = ?',
            )
            .run(hasTrackedVersions ? skill.max_version : 0, hasTrackedVersions ? 1 : 0, skill.id);
        }
      } catch (error) {
        console.error('Failed to normalize skill version tracking state:', error);
        return;
      }
      markMigration('normalize_skill_version_tracking_v1');
    }

    if (!hasMigration('server_auth_tables_v1')) {
      db!.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_settings (
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, key)
        );
      `);
      markMigration('server_auth_tables_v1');
    }

    const userCols = (db!.pragma('table_info(users)') as IPragmaColumnInfo[]).map((c) => c.name);

    if (!userCols.includes('role')) {
      console.log('Migrating: Adding role column to users table');
      db!.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'").run();
    }

    const userSettingsExists = db!
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'")
      .get();

    if (!userSettingsExists) {
      console.log('Migrating: Creating user_settings table');
      db!.exec(`
        CREATE TABLE IF NOT EXISTS user_settings (
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, key)
        )
      `);
    }

    // ── skill_versions table ────────────────────────────────────────────────
    const skillVersionsExists = db!
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='skill_versions'")
      .get();

    if (!skillVersionsExists) {
      console.log('Migrating: Creating skill_versions table');
      db!.exec(`
        CREATE TABLE IF NOT EXISTS skill_versions (
          id TEXT PRIMARY KEY,
          skill_id TEXT NOT NULL,
          version INTEGER NOT NULL,
          content TEXT,
          files_snapshot TEXT,
          note TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
          UNIQUE(skill_id, version)
        )
      `);
    }

    // ── deduplicate skill names (defensive, before UNIQUE index) ─────────
    if (!hasMigration('dedupe_skill_names_v1')) {
      const dupeRows = db!
        .prepare(
          `SELECT LOWER(name) AS lname, COUNT(*) AS cnt
           FROM skills GROUP BY LOWER(name) HAVING cnt > 1`,
        )
        .all() as Array<{ lname: string; cnt: number }>;

      if (dupeRows.length > 0) {
        console.log(`Migrating: Removing ${dupeRows.length} duplicate skill name group(s)`);
        for (const row of dupeRows) {
          db!
            .prepare(
              `DELETE FROM skills WHERE id NOT IN (
                 SELECT id FROM skills
                 WHERE LOWER(name) = ?
                 ORDER BY updated_at DESC LIMIT 1
               ) AND LOWER(name) = ?`,
            )
            .run(row.lname, row.lname);
        }
      }
      markMigration('dedupe_skill_names_v1');
    }

    const promptVersionCols = (
      db!.pragma('table_info(prompt_versions)') as IPragmaColumnInfo[]
    ).map((c) => c.name);

    if (!promptVersionCols.includes('system_prompt_en')) {
      console.log('Migrating: Adding system_prompt_en column to prompt_versions table');
      db!.prepare('ALTER TABLE prompt_versions ADD COLUMN system_prompt_en TEXT').run();
    }

    if (!promptVersionCols.includes('user_prompt_en')) {
      console.log('Migrating: Adding user_prompt_en column to prompt_versions table');
      db!.prepare('ALTER TABLE prompt_versions ADD COLUMN user_prompt_en TEXT').run();
    }

    if (!promptVersionCols.includes('ai_response')) {
      console.log('Migrating: Adding ai_response column to prompt_versions table');
      db!.prepare('ALTER TABLE prompt_versions ADD COLUMN ai_response TEXT').run();
    }

    if (!hasMigration('prompts_slim_metadata_v1')) {
      const legacyCols = ['description', 'prompt_type', 'images', 'videos', 'notes'];
      const hasLegacy = legacyCols.some((col) => promptCols.includes(col));
      if (hasLegacy) {
        console.log('Migrating: Removing legacy prompt metadata columns');
        db!.exec(`
          DROP TRIGGER IF EXISTS prompts_ai;
          DROP TRIGGER IF EXISTS prompts_ad;
          DROP TRIGGER IF EXISTS prompts_au;
          DROP TABLE IF EXISTS prompts_fts;

          CREATE TABLE prompts__slim (
            id TEXT PRIMARY KEY,
            owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'shared')),
            title TEXT NOT NULL,
            system_prompt TEXT,
            system_prompt_en TEXT,
            user_prompt TEXT NOT NULL,
            user_prompt_en TEXT,
            variables TEXT,
            tags TEXT,
            folder_id TEXT,
            is_favorite INTEGER DEFAULT 0,
            is_pinned INTEGER DEFAULT 0,
            current_version INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            source TEXT,
            last_ai_response TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
          );

          INSERT INTO prompts__slim (
            id, owner_user_id, visibility, title,
            system_prompt, system_prompt_en, user_prompt, user_prompt_en,
            variables, tags, folder_id,
            is_favorite, is_pinned, current_version, usage_count,
            source, last_ai_response, created_at, updated_at
          )
          SELECT
            id, owner_user_id, visibility, title,
            system_prompt, system_prompt_en, user_prompt, user_prompt_en,
            variables, tags, folder_id,
            is_favorite, is_pinned, current_version, usage_count,
            source, last_ai_response, created_at, updated_at
          FROM prompts;

          DROP TABLE prompts;
          ALTER TABLE prompts__slim RENAME TO prompts;
        `);
      }
      markMigration('prompts_slim_metadata_v1');
    }

    if (!hasMigration('fix_prompt_current_version_v1')) {
      console.log('Migrating: Aligning prompt current_version with latest stored version');
      db!
        .prepare(
          `UPDATE prompts
         SET current_version = COALESCE(
           (SELECT MAX(version) FROM prompt_versions WHERE prompt_id = prompts.id),
           0
         )`,
        )
        .run();
      markMigration('fix_prompt_current_version_v1');
    }

    if (!hasMigration('kb_tables_v1')) {
      console.log('Migrating: Creating knowledge base tables');
      db!.exec(KB_SCHEMA_TABLES);
      db!.exec(KB_SCHEMA_TRIGGERS);
      db!.exec(KB_SCHEMA_INDEXES);
      markMigration('kb_tables_v1');
    }
    if (!hasMigration('kb_documents_segment_v2')) {
      const cols = db!.prepare(`PRAGMA table_info(kb_documents)`).all() as { name: string }[];
      const names = new Set(cols.map((c) => c.name));
      if (!names.has('segment_mode')) {
        db!.exec(`ALTER TABLE kb_documents ADD COLUMN segment_mode TEXT DEFAULT 'general'`);
      }
      if (!names.has('segment_settings')) {
        db!.exec(`ALTER TABLE kb_documents ADD COLUMN segment_settings TEXT`);
      }
      markMigration('kb_documents_segment_v2');
    }
  });

  try {
    runMigrations();
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }

  // Now that all columns exist, create indexes + FTS
  db.exec(SCHEMA_INDEXES);

  console.log(`Database initialized at: ${dbPath}`);
  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  db = null;
  if (activeDbPath) {
    await destroyDataSource(activeDbPath);
    activeDbPath = null;
  }
}

/**
 * Check if the current database is empty (no user data).
 * Used to detect whether a data recovery prompt should be shown.
 */
export function isDatabaseEmpty(database: Database): boolean {
  try {
    const promptRow = database.prepare('SELECT COUNT(*) as count FROM prompts').get() as
      | { count: number }
      | undefined;
    const folderRow = database.prepare('SELECT COUNT(*) as count FROM folders').get() as
      | { count: number }
      | undefined;

    let skillCount = 0;
    try {
      const skillRow = database.prepare('SELECT COUNT(*) as count FROM skills').get() as
        | { count: number }
        | undefined;
      skillCount = skillRow?.count ?? 0;
    } catch {
      // skills table may not exist in older schemas
    }

    return (promptRow?.count ?? 0) === 0 && (folderRow?.count ?? 0) === 0 && skillCount === 0;
  } catch {
    // Table might not exist in a freshly created DB
    return true;
  }
}
export { db };

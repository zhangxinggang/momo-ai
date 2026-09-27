/**
 * 数据库表结构定义
 */

/**
 * Tables only — run BEFORE migrations so CREATE TABLE IF NOT EXISTS
 * is a safe no-op for existing databases.
 */
export const SCHEMA_TABLES = `
-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Skills 表
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'shared')),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  mcp_config TEXT,
  protocol_type TEXT DEFAULT 'mcp',
  version TEXT,
  author TEXT,
  tags TEXT,
  is_favorite INTEGER DEFAULT 0,
  installed_content_hash TEXT,
  installed_version TEXT,
  installed_at INTEGER,
  updated_from_store_at INTEGER,
  current_version INTEGER DEFAULT 0,
  version_tracking_enabled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Skill 版本表
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
);

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

`;

/**
 * Indexes, FTS, and triggers — run AFTER migrations so all columns exist.
 */
export const SCHEMA_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_skills_updated ON skills(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_owner ON skills(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_skills_visibility ON skills(visibility);
CREATE INDEX IF NOT EXISTS idx_skills_favorite ON skills(is_favorite);
CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skill_versions_skill ON skill_versions(skill_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);



`;

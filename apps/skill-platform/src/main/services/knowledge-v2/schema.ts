export const KNOWLEDGE_V2_SCHEMA = `
CREATE TABLE IF NOT EXISTS kb_collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  description TEXT,
  embedding_profile_id TEXT NOT NULL,
  retrieval_profile_id TEXT NOT NULL,
  parser_profile_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kb_sources (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('file', 'directory', 'pasted')),
  uri TEXT NOT NULL,
  display_name TEXT NOT NULL,
  config_json TEXT NOT NULL,
  sync_mode TEXT NOT NULL CHECK(sync_mode IN ('snapshot', 'manual', 'watch')),
  sync_status TEXT NOT NULL,
  last_synced_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES kb_collections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_documents (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  source_id TEXT,
  filename TEXT NOT NULL,
  relative_path TEXT,
  ext TEXT,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  active_revision_id TEXT,
  segment_mode TEXT NOT NULL DEFAULT 'fixed',
  segment_settings_json TEXT NOT NULL,
  status TEXT NOT NULL,
  stage TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (collection_id) REFERENCES kb_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES kb_sources(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS kb_document_revisions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  source_id TEXT,
  source_uri TEXT NOT NULL,
  relative_path TEXT,
  blob_hash TEXT NOT NULL,
  content_hash TEXT,
  parser_id TEXT,
  parser_version TEXT,
  parser_config_hash TEXT,
  embedding_profile_fingerprint TEXT,
  artifact_uri TEXT,
  quality_score REAL,
  notices_json TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  FOREIGN KEY (document_id) REFERENCES kb_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES kb_sources(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  revision_id TEXT NOT NULL,
  parent_chunk_id TEXT,
  stable_key TEXT NOT NULL,
  idx INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('parent', 'child', 'manual')),
  content TEXT NOT NULL,
  embedding_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  heading_path_json TEXT NOT NULL,
  page INTEGER,
  page_end INTEGER,
  sheet TEXT,
  cell_range TEXT,
  metadata_json TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  origin TEXT NOT NULL CHECK(origin IN ('parsed', 'manual')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES kb_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES kb_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (revision_id) REFERENCES kb_document_revisions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_chunk_id) REFERENCES kb_chunks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_chunk_versions (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  origin TEXT NOT NULL CHECK(origin IN ('parsed', 'manual')),
  status TEXT NOT NULL CHECK(status IN ('draft', 'indexing', 'active', 'failed')),
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (chunk_id) REFERENCES kb_chunks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  collection_id TEXT,
  document_id TEXT,
  revision_id TEXT,
  status TEXT NOT NULL,
  stage TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  finished_at INTEGER
);

CREATE TABLE IF NOT EXISTS kb_index_outbox (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL CHECK(operation IN ('upsert_revision', 'edit_chunk')),
  collection_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  revision_id TEXT NOT NULL,
  embedding_profile_fingerprint TEXT NOT NULL,
  expected_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'interrupted')),
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES kb_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES kb_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (revision_id) REFERENCES kb_document_revisions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_retrieval_traces (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  query TEXT NOT NULL,
  rewritten_query TEXT NOT NULL,
  request_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  timings_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kb_embedding_cache (
  profile_key TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  vector_json TEXT NOT NULL,
  dimension INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (profile_key, content_hash)
);

CREATE VIRTUAL TABLE IF NOT EXISTS kb_chunks_fts_words USING fts5(
  content,
  chunk_id UNINDEXED,
  document_id UNINDEXED,
  collection_id UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS kb_chunks_fts_trigram USING fts5(
  content,
  chunk_id UNINDEXED,
  document_id UNINDEXED,
  collection_id UNINDEXED,
  tokenize = 'trigram'
);

CREATE INDEX IF NOT EXISTS idx_kb_sources_collection ON kb_sources(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_collection ON kb_documents(collection_id, deleted_at, status);
CREATE INDEX IF NOT EXISTS idx_kb_documents_revision ON kb_documents(active_revision_id);
CREATE INDEX IF NOT EXISTS idx_kb_revisions_document ON kb_document_revisions(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_document ON kb_chunks(document_id, revision_id, idx);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_collection ON kb_chunks(collection_id, revision_id, enabled);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_parent ON kb_chunks(parent_chunk_id);
CREATE INDEX IF NOT EXISTS idx_kb_jobs_document ON kb_jobs(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_jobs_status ON kb_jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_index_outbox_status ON kb_index_outbox(status, updated_at DESC);
`;

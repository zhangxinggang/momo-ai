/**
 * 知识库表结构（本地单用户，无 user_id）
 */

export const KB_SCHEMA_TABLES = `
CREATE TABLE IF NOT EXISTS kb_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  group_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  ext TEXT,
  mime TEXT,
  size INTEGER,
  sha256 TEXT,
  status TEXT,
  progress INTEGER DEFAULT 0,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES kb_collections (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  doc_id INTEGER NOT NULL,
  idx INTEGER NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER,
  start_pos INTEGER,
  end_pos INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES kb_collections (id) ON DELETE CASCADE,
  FOREIGN KEY (doc_id) REFERENCES kb_documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_embeddings (
  chunk_id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL,
  vector BLOB NOT NULL,
  dim INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chunk_id) REFERENCES kb_chunks (id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES kb_collections (id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE IF NOT EXISTS kb_chunks_fts USING fts5(
  content,
  chunk_id UNINDEXED,
  doc_id UNINDEXED,
  collection_id UNINDEXED,
  tokenize = 'unicode61'
);
`;

export const KB_SCHEMA_TRIGGERS = `
CREATE TRIGGER IF NOT EXISTS kb_chunks_ai AFTER INSERT ON kb_chunks BEGIN
  INSERT INTO kb_chunks_fts(rowid, content, chunk_id, doc_id, collection_id)
  VALUES (new.id, new.content, new.id, new.doc_id, new.collection_id);
END;

CREATE TRIGGER IF NOT EXISTS kb_chunks_ad AFTER DELETE ON kb_chunks BEGIN
  DELETE FROM kb_chunks_fts WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS kb_chunks_au AFTER UPDATE OF content ON kb_chunks BEGIN
  DELETE FROM kb_chunks_fts WHERE rowid = old.id;
  INSERT INTO kb_chunks_fts(rowid, content, chunk_id, doc_id, collection_id)
  VALUES (new.id, new.content, new.id, new.doc_id, new.collection_id);
END;
`;

export const KB_SCHEMA_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_kb_collections_group ON kb_collections (group_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_collection ON kb_documents (collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON kb_chunks (doc_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_collection ON kb_chunks (collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_embeddings_collection ON kb_embeddings (collection_id);
`;

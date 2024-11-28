DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS documents_search;

-- Main table with all constraints and types
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  namespace TEXT NOT NULL,
  text TEXT NOT NULL,
  summary TEXT NOT NULL,
  indexed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  UNIQUE(url, namespace)
);

-- FTS5 table for search functionality (only title and summary)
CREATE VIRTUAL TABLE documents_search USING fts5 (
  title,
  summary,
  content='documents',
  content_rowid='id'
);

-- Indexes for the main table
CREATE INDEX documents_namespace_idx ON documents(namespace);
CREATE INDEX documents_url_idx ON documents(namespace, url);
CREATE INDEX documents_title_idx ON documents(namespace, title);

-- Triggers to keep FTS index up to date (modified to only sync title and summary)
CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_search(rowid, title, summary)
  VALUES (new.id, new.title, new.summary);
END;

CREATE TRIGGER documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO documents_search(documents_search, rowid, title, summary)
  VALUES('delete', old.id, old.title, old.summary);
END;

CREATE TRIGGER documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO documents_search(documents_search, rowid, title, summary)
  VALUES('delete', old.id, old.title, old.summary);
  INSERT INTO documents_search(rowid, title, summary)
  VALUES (new.id, new.title, new.summary);
END;
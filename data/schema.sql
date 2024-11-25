CREATE TABLE documents (
  -- Using TEXT as primary key since D1/SQLite doesn't have UUID
  id TEXT PRIMARY KEY DEFAULT (uuid()),

  -- URL of the document
  url TEXT NOT NULL,
  
  -- Namespace remains the same
  namespace TEXT NOT NULL,
  
  -- Text field remains the same
  text TEXT NOT NULL,
  
  -- Using TEXT for metadata since D1/SQLite doesn't have JSONB
  -- metadata TEXT NOT NULL DEFAULT '{}',
  
  -- Using INTEGER for timestamp (SQLite standard)
  indexed_at INTEGER NOT NULL DEFAULT (unixepoch())

  -- Unique constraint on url and namespace
  UNIQUE(url, namespace)
);

CREATE INDEX documents_namespace_idx ON documents(namespace);
CREATE INDEX documents_url_idx ON documents(url);

-- Postgres Schema for vector search database

-- Drop database if exists
-- DROP TABLE IF EXISTS documents;

-- Enable uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable vector search
CREATE EXTENSION IF NOT EXISTS "vector";


CREATE TABLE documents (
  -- uuid id
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Unique namespace
  namespace TEXT NOT NULL,

  -- Raw text to search by
  text TEXT NOT NULL,

  -- Embedding vector for semantic search
  embedding VECTOR(1536) NOT NULL,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  indexed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX documents_text_idx ON documents USING GIN (text gin_trgm_ops);

-- index for namespace
CREATE INDEX documents_namespace_idx ON documents (namespace);

-- Index for embedding
CREATE INDEX documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
-- Postgres Schema for vector search database

-- Enable uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable vector search
CREATE EXTENSION IF NOT EXISTS "vector";


CREATE TABLE records (
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
CREATE INDEX records_text_idx ON records USING GIN (text gin_trgm_ops);

-- Unique index for namespace
CREATE UNIQUE INDEX records_namespace_idx ON records (namespace);

-- Index for embedding
CREATE INDEX records_embedding_idx ON records USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)
-- Supabase Vector Search Setup for CounterGo KB
-- Run this in Supabase SQL Editor: https://cdfnowhfprbwjcqrpekd.supabase.co

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create articles table with vector embeddings
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding vector(384), -- all-MiniLM-L6-v2 produces 384-dimensional embeddings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index for vector similarity search
CREATE INDEX IF NOT EXISTS articles_embedding_idx ON articles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create RPC function for vector search with product filtering
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding vector(384),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  product_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  content TEXT,
  url TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    articles.id,
    articles.title,
    articles.content,
    articles.url,
    articles.category,
    1 - (articles.embedding <=> query_embedding) AS similarity
  FROM articles
  WHERE
    (articles.embedding <=> query_embedding) < (1 - match_threshold)
    AND (
      product_filter IS NULL
      OR LOWER(articles.url) LIKE '%' || LOWER(product_filter) || '%'
      OR LOWER(articles.category) LIKE '%' || LOWER(product_filter) || '%'
    )
  ORDER BY articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Grant permissions (adjust if needed for your security setup)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (since we're using anon key)
CREATE POLICY "Allow anonymous read access" ON articles
  FOR SELECT TO anon
  USING (true);

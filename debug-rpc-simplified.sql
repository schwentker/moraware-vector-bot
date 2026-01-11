-- Simplified RPC function for debugging vector search issues
-- This removes the threshold filtering and product filtering to isolate the core vector search

CREATE OR REPLACE FUNCTION search_articles_debug(
  query_embedding vector(384),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  title TEXT,
  similarity FLOAT,
  distance FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    articles.title,
    1 - (articles.embedding <=> query_embedding) AS similarity,
    (articles.embedding <=> query_embedding) AS distance
  FROM articles
  WHERE articles.embedding IS NOT NULL
  ORDER BY articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Test query to verify it works
-- Replace the embedding values with actual values from your console.log
-- SELECT * FROM search_articles_debug('[0.1,0.2,...]'::vector(384), 10);

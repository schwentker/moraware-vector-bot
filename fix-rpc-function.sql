-- FIXED RPC Function with Explicit TEXT to VECTOR Casting
-- This fixes the PostgREST type conversion issue

CREATE OR REPLACE FUNCTION search_articles(
  query_embedding TEXT,  -- Changed from vector(384) to TEXT
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
DECLARE
  query_vec vector(384);  -- Declare variable for explicit cast
BEGIN
  -- Explicitly cast TEXT to vector(384)
  query_vec := query_embedding::vector(384);

  RETURN QUERY
  SELECT
    articles.id,
    articles.title,
    articles.content,
    articles.url,
    articles.category,
    1 - (articles.embedding <=> query_vec) AS similarity
  FROM articles
  WHERE
    articles.embedding IS NOT NULL
    AND (articles.embedding <=> query_vec) < (1 - match_threshold)
    AND (
      product_filter IS NULL
      OR LOWER(articles.url) LIKE '%' || LOWER(product_filter) || '%'
      OR LOWER(articles.category) LIKE '%' || LOWER(product_filter) || '%'
    )
  ORDER BY articles.embedding <=> query_vec
  LIMIT match_count;
END;
$$;

-- Test the fixed function (paste your generated vector from test-vector-sql.txt)
-- SELECT * FROM search_articles('[...]', 0.1, 10, NULL);

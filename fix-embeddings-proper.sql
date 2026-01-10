-- Fix embeddings by converting strings to proper vector type
-- This needs to be run AFTER loading the data with string format

-- First, let's see if we can query directly with casting
SELECT
  id,
  title,
  embedding::vector <=> '[0,0,0,0,0,0,0,0,0,0]'::vector as distance
FROM articles
WHERE title = 'Create A Remnant';

-- If that works, we don't need to change the column type
-- The issue is in how we're calling the RPC function

-- Let's test the RPC function with proper casting
SELECT * FROM search_articles(
  '[0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]'::vector(384),
  0.0,
  10,
  NULL
);

# Step-by-Step Walkthrough: Fix Vector Search

## 🎯 Problem Summary
PostgREST (Supabase's API layer) is not properly converting the vector parameter when calling the RPC function. We need to change the function to accept TEXT and do explicit casting.

---

## Step 1: Open Supabase SQL Editor

1. Go to: https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/sql
2. Log in if needed
3. Click **"New Query"** button

---

## Step 2: Drop the Old Function (CRITICAL!)

**⚠️ IMPORTANT:** PostgreSQL allows function overloading, so `CREATE OR REPLACE` might create a SECOND function instead of replacing the old one. We need to explicitly drop the old version first.

Copy and paste this:

```sql
-- Drop the old function that accepts vector(384) parameter
DROP FUNCTION IF EXISTS search_articles(vector, float, int, text);
```

Click **"Run"**. You should see: `Success. No rows returned`

---

## Step 3: Create the Fixed RPC Function

Now copy and paste this ENTIRE SQL code:

```sql
-- FIXED RPC Function with Explicit TEXT to VECTOR Casting
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
```

Click **"Run"**. You should see: `Success. No rows returned`

---

## Step 4: Verify Function Signature

Let's confirm the function now accepts TEXT instead of vector:

```sql
SELECT
  routine_name,
  parameter_name,
  data_type
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND routine_name = 'search_articles'
ORDER BY ordinal_position;
```

**Expected output:**
```
routine_name     | parameter_name    | data_type
-----------------+-------------------+-----------
search_articles  | query_embedding   | text
search_articles  | match_threshold   | double precision
search_articles  | match_count       | integer
search_articles  | product_filter    | text
```

The key is `query_embedding` should show `text`, NOT `USER-DEFINED` (which would mean vector).

---

## Step 5: Test with Known Vector

Now let's test with a simple known-good query:

```sql
-- Test: Search for articles similar to "Create A Remnant"
-- This uses the embedding already in the database
WITH remnant_embedding AS (
  SELECT embedding::text AS vec
  FROM articles
  WHERE title = 'Create A Remnant'
  LIMIT 1
)
SELECT title, similarity
FROM search_articles(
  (SELECT vec FROM remnant_embedding),
  0.1,  -- Low threshold to get many results
  10,   -- Top 10
  NULL  -- No product filter
)
ORDER BY similarity DESC;
```

**Expected Result:**
- Multiple results (should be 6+ articles)
- **"Create A Remnant"** should be #1 with similarity ≈ 1.0
- Other remnant-related articles: "Slab View By Remnants", "Remnant Screen", etc.

---

## 🧪 What Changed?

**Before (BROKEN):**
```sql
CREATE FUNCTION search_articles(query_embedding vector(384), ...)
```
- PostgREST couldn't convert JS string `"[0.1,0.2,...]"` to `vector(384)`
- RPC calls failed silently or returned wrong results

**After (FIXED):**
```sql
CREATE FUNCTION search_articles(query_embedding TEXT, ...)
DECLARE query_vec vector(384);
BEGIN
  query_vec := query_embedding::vector(384);  -- Explicit cast
```
- Accepts TEXT directly from JavaScript
- Does explicit casting inside the function
- Bypasses PostgREST's broken type conversion

---

## ✅ Success Criteria

After applying this fix:
1. ✅ Step 5 SQL test returns "Create A Remnant" as top result
2. ✅ Node.js test: `node test-actual-search.js` returns correct results
3. ✅ Live website: Searching "remnant" finds "Create A Remnant"

---

## 🚨 Troubleshooting

### If Step 4 still shows "USER-DEFINED" instead of "text":
- The old function wasn't dropped
- Run this: `DROP FUNCTION IF EXISTS search_articles;` (drops ALL versions)
- Then re-run Step 3

### If Step 5 returns 0 or 1 result:
- The TEXT-to-vector cast might be failing
- Check for syntax errors in the function
- Verify embeddings exist: `SELECT COUNT(*) FROM articles WHERE embedding IS NOT NULL;`

### If you get "function does not exist" error:
- Make sure you ran Step 3 successfully
- Try: `SELECT * FROM pg_proc WHERE proname = 'search_articles';` to see if it exists

---

## 📋 Next Steps After Success

Once Step 5 returns correct results:
1. Run the Node.js test to verify: `node test-actual-search.js`
2. Rebuild and deploy the frontend
3. Test the live site at https://sandboxlabs.ai/moraware-vector/

The JavaScript client code doesn't need ANY changes - it already sends the vector as a TEXT string!

# Vector Search Issue - AI Handoff Document

## Problem Summary
Vector search in Supabase is NOT working correctly. Despite multiple fixes, semantic queries like "remnant" or "leftover slabs" are not finding relevant articles that clearly exist in the database.

## Current Behavior
- **Query: "remnant"** → Returns: "Use Consistent Activity Types" (wrong)
- **Expected:** Should return "Create A Remnant", "Slab View By Remnants", etc.
- **SQL Direct Test:** Works correctly (returns 6 results)
- **JavaScript Client:** Only returns 1 irrelevant result

## System Details

### GitHub Repositories
1. **Frontend/Bot Code:** https://github.com/schwentker/countergo-helper-chat
   - Branch: `main`
   - Local path: `/Users/schwentker/dev/countergo-worker/moraware-vector-bot`
   - Key file: `src/lib/vectorSearch.ts`

2. **Deployment (Hugo Static):** https://github.com/schwentker/sandboxlabsai
   - Branch: `main`
   - Deployed to: `https://sandboxlabs.ai/moraware-vector/`
   - Build output copied to: `static/moraware-vector/`

### Supabase Database
- **URL:** `https://cdfnowhfprbwjcqrpekd.supabase.co`
- **Anon Key:** `sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m`
- **SQL Editor:** https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/sql
- **Database:** PostgreSQL with pgvector extension
- **Table:** `articles` (763 articles with embeddings)

### Database Schema

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding vector(384),  -- pgvector type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX articles_embedding_idx ON articles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### RPC Function

```sql
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
    articles.embedding IS NOT NULL
    AND (articles.embedding <=> query_embedding) < (1 - match_threshold)
    AND (
      product_filter IS NULL
      OR LOWER(articles.url) LIKE '%' || LOWER(product_filter) || '%'
      OR LOWER(articles.category) LIKE '%' || LOWER(product_filter) || '%'
    )
  ORDER BY articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## What We've Tried

### 1. Embedding Model
- Using `Xenova/all-MiniLM-L6-v2` (384 dimensions)
- Generates embeddings in browser via `@xenova/transformers`
- Model loads correctly, generates embeddings successfully

### 2. Data Loading
- Loaded 763/786 articles successfully
- Each article has embedding stored
- Embeddings are **vector(384)** type in PostgreSQL
- Verified with SQL: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles'`

### 3. Format Conversions Attempted
- Initially stored as TEXT strings → Converted to vector type
- JavaScript array `[0.1, 0.2, ...]` → String `"[0.1,0.2,...]"`
- Tried both formats, neither works from JS client

### 4. SQL Direct Test - WORKS ✓
```sql
-- This returns 6 results correctly!
SELECT * FROM search_articles(
  (SELECT embedding FROM articles WHERE title = 'Create A Remnant' LIMIT 1),
  0.1,
  50,
  NULL
);
```

### 5. JavaScript Client Test - FAILS ✗
```typescript
const { data } = await supabase.rpc('search_articles', {
  query_embedding: vectorString,  // "[0.1,0.2,...]"
  match_threshold: 0.1,
  match_count: 50,
  product_filter: null
});
// Returns only 1 result: "Use Consistent Activity Types"
```

## Verified Facts

✓ Database has 763 articles with embeddings
✓ "Create A Remnant" article exists in database
✓ "Create A Remnant" has valid vector(384) embedding
✓ RPC function works correctly in SQL
✓ JavaScript client can call the RPC function
✓ Embeddings are proper PostgreSQL vector type
✓ Row Level Security allows SELECT/INSERT

✗ JavaScript client only gets 1 result instead of many
✗ Results are semantically irrelevant

## Hypothesis

The issue is likely:
1. **PostgREST/Supabase-js type conversion bug** when passing vectors to RPC functions
2. **Embedding mismatch** between what's stored and what's queried
3. **RPC parameter casting issue** that SQL editor handles but JS client doesn't
4. **WHERE clause logic error** with the threshold calculation

## Test Queries to Verify Fix

Run these after fixing:

```javascript
// Should return "Create A Remnant" as top result
await searchKB("remnant")

// Should return remnant/scrap tracking articles
await searchKB("leftover slabs")

// Should return "Create & Print Inventory Labels"
await searchKB("print inventory")

// Should return remnant management articles
await searchKB("manage scrap material")
```

## Key Files to Review

1. **`src/lib/vectorSearch.ts`** - Vector search implementation
2. **`src/lib/kbSearch.ts`** - Switches between vector/keyword search
3. **`load-kb-to-supabase.js`** - Data loading script
4. **`supabase-setup.sql`** - Database schema and RPC function

## Environment Variables

Production (`.env.production`):
```
VITE_API_ENDPOINT=https://countergo-chat-worker.countergo-chat-worker.workers.dev/
VITE_SUPABASE_URL=https://cdfnowhfprbwjcqrpekd.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m
VITE_USE_VECTOR=true
```

## Next Steps to Investigate

1. **Check if embeddings are actually different:**
   - Generate embedding for "remnant" in JS
   - Get embedding for "Create A Remnant" from DB
   - Calculate cosine similarity manually
   - Should be high if working correctly

2. **Test RPC with literal vector string:**
   ```sql
   SELECT * FROM search_articles(
     '[exact,embedding,values,from,js,here]'::vector(384),
     0.1,
     50,
     NULL
   );
   ```

3. **Check PostgREST logs/debugging:**
   - Enable verbose logging in Supabase
   - See what SQL is actually being executed
   - Check if type casting is happening

4. **Try alternative approach:**
   - Instead of RPC, use direct table query with `.select()` and manual distance calc
   - Use Supabase Edge Function for vector search
   - Use direct PostgreSQL connection instead of PostgREST

5. **Verify embedding generation:**
   - Compare embedding from JS to embedding from Python/Node script
   - Ensure normalization is consistent
   - Check if model version matches

## Success Criteria

Vector search is working when:
- ✓ "remnant" returns "Create A Remnant" as top result
- ✓ "leftover slabs" returns remnant-related articles
- ✓ "print inventory" returns label printing articles
- ✓ Semantic similarity works better than keyword matching

## Contact Info

User: schwentker@sandboxlabs.ai

## Additional Context

- Original keyword search works fine (`kbSearch.ts`)
- 786 articles scraped from Moraware KB (CounterGo, Systemize, Inventory)
- Product filtering works (systemize/inventory/countergo keywords)
- Cloudflare Worker handles Claude API calls
- Frontend is React/Vite/TypeScript

---

**URGENT:** This has been attempted multiple times with various fixes. The SQL works but JavaScript client fails. Need fresh perspective on the PostgREST/Supabase-js vector type handling issue.

# Copy/Paste This Into ChatGPT/Gemini

---

I need help debugging a vector search issue in a Supabase/PostgreSQL database. The vector search works perfectly in SQL but fails when called from JavaScript client.

## Quick Facts
- **Repository:** https://github.com/schwentker/moraware-vector-bot
- **Full handoff doc:** See `AI-HANDOFF.md` in repo root
- **Supabase URL:** https://cdfnowhfprbwjcqrpekd.supabase.co
- **Anon Key:** `sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m`
- **Database:** 763 articles with vector(384) embeddings
- **SQL Editor:** https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/sql

## The Problem

**SQL Query (works correctly - returns 6 results):**
```sql
SELECT * FROM search_articles(
  (SELECT embedding FROM articles WHERE title = 'Create A Remnant' LIMIT 1),
  0.1,
  50,
  NULL
);
```

**JavaScript Query (fails - returns only 1 wrong result):**
```typescript
const embedding = await generateEmbedding("remnant"); // Returns number[]
const vectorString = `[${embedding.join(',')}]`;

const { data } = await supabase.rpc('search_articles', {
  query_embedding: vectorString,
  match_threshold: 0.1,
  match_count: 50,
  product_filter: null
});
// Returns: ["Use Consistent Activity Types"] - WRONG!
// Expected: ["Create A Remnant", "Slab View By Remnants", etc.]
```

## What's Been Tried
✗ Storing as TEXT strings → converted to vector type
✗ Passing JS array directly
✗ Passing as string "[val1,val2,...]"
✗ Lowering threshold from 0.5 to 0.1
✗ Increasing result count
✗ Adding ::vector casts in RPC function
✗ Multiple data reloads

## RPC Function
```sql
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding vector(384),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  product_filter TEXT DEFAULT NULL
)
RETURNS TABLE (id TEXT, title TEXT, content TEXT, url TEXT, category TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    articles.id, articles.title, articles.content, articles.url, articles.category,
    1 - (articles.embedding <=> query_embedding) AS similarity
  FROM articles
  WHERE
    articles.embedding IS NOT NULL
    AND (articles.embedding <=> query_embedding) < (1 - match_threshold)
    AND (product_filter IS NULL OR LOWER(articles.url) LIKE '%' || LOWER(product_filter) || '%')
  ORDER BY articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Key Question
Why does the EXACT SAME RPC function work in SQL but return different results from JavaScript client (supabase-js)?

## Success = When This Works
```javascript
await vectorSearch("remnant", 10)
// Should return: "Create A Remnant" as top result
// Currently returns: "Use Consistent Activity Types" (wrong)
```

Please investigate the PostgREST/supabase-js vector type conversion issue. Full details in `AI-HANDOFF.md`.

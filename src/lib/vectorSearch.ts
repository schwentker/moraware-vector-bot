import { createClient } from '@supabase/supabase-js';
import { pipeline, env } from '@xenova/transformers';
import type { Article } from './kbSearch';

// Configure transformers.js to use remote models from HuggingFace CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize embedding pipeline (lazy-loaded)
let embedder: any = null;

async function generateEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    console.log('🔧 Initializing embedding model (downloading from CDN ~25MB, one-time only)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model ready and cached!');
  }

  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function vectorSearch(query: string, maxResults = 10): Promise<Article[]> {
  // 1. Generate embedding client-side
  const queryEmbedding = await generateEmbedding(query);

  // 2. Detect product filter
  const queryLower = query.toLowerCase();
  let productFilter = null;
  if (queryLower.includes('systemize')) productFilter = 'systemize';
  else if (queryLower.includes('inventory')) productFilter = 'inventory';
  else if (queryLower.includes('countergo')) productFilter = 'countergo';

  console.log(`🎯 Vector search${productFilter ? ` for ${productFilter}` : ''}`);

  // 3. Search by cosine similarity
  const { data, error } = await supabase.rpc('search_articles', {
    query_embedding: queryEmbedding,
    match_threshold: 0.1,  // Very low threshold to cast a wide net (10% similarity)
    match_count: Math.max(maxResults, 15),  // Get at least 15 results for better ranking
    product_filter: productFilter
  });

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  console.log(`📚 Found ${data.length} vector matches`);

  // 4. Convert to Article format (matches kbSearch.ts interface)
  return data.map(article => ({
    id: article.id,
    title: article.title,
    content: article.content,
    url: article.url,
    category: article.category,
    word_count: article.content.split(/\s+/).length,
    scraped_at: ''
  }));
}

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

  // 🔍 DEBUG: Log embedding details
  console.log('🔍 Embedding Debug Info:');
  console.log(`  - Length: ${queryEmbedding.length} (should be 384)`);
  console.log(`  - First 5 values: [${queryEmbedding.slice(0, 5).join(', ')}]`);
  console.log(`  - Value range: [${Math.min(...queryEmbedding).toFixed(4)}, ${Math.max(...queryEmbedding).toFixed(4)}]`);

  // Calculate vector magnitude to verify normalization
  const magnitude = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
  console.log(`  - Magnitude: ${magnitude.toFixed(6)} (should be ~1.0 if normalized)`);

  // 2. Detect product filter
  const queryLower = query.toLowerCase();
  let productFilter = null;
  if (queryLower.includes('systemize')) productFilter = 'systemize';
  else if (queryLower.includes('inventory')) productFilter = 'inventory';
  else if (queryLower.includes('countergo')) productFilter = 'countergo';

  console.log(`🎯 Vector search${productFilter ? ` for ${productFilter}` : ''}`);

  // 3. Convert array to PostgreSQL vector string format
  // Supabase-js doesn't properly convert JS arrays to PG vectors, so we do it manually
  const vectorString = `[${queryEmbedding.join(',')}]`;

  // 4. Search by cosine similarity
  const { data, error } = await supabase.rpc('search_articles', {
    query_embedding: vectorString,  // Send as PostgreSQL vector string
    match_threshold: 0.1,  // Very low threshold to cast a wide net (10% similarity)
    match_count: Math.max(maxResults, 15),  // Get at least 15 results for better ranking
    product_filter: productFilter
  });

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  console.log(`📚 Found ${data.length} vector matches`);

  // 🔍 DEBUG: Log top results with similarity scores
  if (data.length > 0) {
    console.log('📊 Top 3 results:');
    data.slice(0, 3).forEach((result: any, i: number) => {
      console.log(`  ${i + 1}. "${result.title}" (similarity: ${result.similarity?.toFixed(4) || 'N/A'})`);
    });
  }

  // 5. Convert to Article format (matches kbSearch.ts interface)
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

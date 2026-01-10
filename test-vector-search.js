#!/usr/bin/env node
/**
 * Test vector search with actual queries
 */

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let embedder = null;

async function generateEmbedding(text) {
  if (!embedder) {
    console.log('🔧 Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Model ready\n');
  }

  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function testQuery(query, threshold = 0.3) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Query: "${query}"`);
  console.log(`Threshold: ${threshold}`);
  console.log('='.repeat(60));

  const queryEmbedding = await generateEmbedding(query);

  // Detect product filter
  const queryLower = query.toLowerCase();
  let productFilter = null;
  if (queryLower.includes('systemize')) productFilter = 'systemize';
  else if (queryLower.includes('inventory')) productFilter = 'inventory';
  else if (queryLower.includes('countergo')) productFilter = 'countergo';

  if (productFilter) {
    console.log(`🎯 Product filter: ${productFilter}`);
  }

  const { data, error } = await supabase.rpc('search_articles', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: 10,
    product_filter: productFilter
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n📚 Found ${data.length} results:\n`);

  data.forEach((article, idx) => {
    console.log(`${idx + 1}. [${article.similarity.toFixed(3)}] ${article.title}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   URL: ${article.url}\n`);
  });
}

async function main() {
  await testQuery('leftover slabs', 0.2);
  await testQuery('manage scrap material', 0.2);
  await testQuery('share estimates with customers', 0.2);
}

main();

#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(
  'https://cdfnowhfprbwjcqrpekd.supabase.co',
  'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m'
);

async function testActualSearch() {
  console.log("🔍 Testing actual search flow: 'remnant'\n");

  // Generate embedding for "remnant" (what the user types)
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder('remnant', { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(output.data);

  console.log("Query embedding length:", queryEmbedding.length);
  console.log("Query embedding first 5:", queryEmbedding.slice(0, 5));

  // Format as PostgreSQL vector string
  const vectorString = `[${queryEmbedding.join(',')}]`;

  console.log("\n📡 Calling RPC with vector string...\n");

  // Call the RPC function exactly as the browser does
  const { data, error } = await supabase.rpc('search_articles', {
    query_embedding: vectorString,
    match_threshold: 0.1,
    match_count: 50,
    product_filter: null
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    return;
  }

  console.log(`📚 Found ${data.length} results\n`);

  if (data.length > 0) {
    console.log("Top 10 results:");
    data.slice(0, 10).forEach((article, i) => {
      console.log(`  ${i + 1}. "${article.title}" (similarity: ${article.similarity?.toFixed(4)})`);
    });
  } else {
    console.log("❌ No results found!");
    console.log("\nLet's try the debug RPC without threshold...");

    // Try without threshold
    const { data: data2, error: error2 } = await supabase.rpc('search_articles', {
      query_embedding: vectorString,
      match_threshold: 0.0,  // Accept everything
      match_count: 10,
      product_filter: null
    });

    if (error2) {
      console.error("❌ Debug RPC Error:", error2);
    } else {
      console.log(`\nWith threshold=0.0: ${data2.length} results`);
      data2.slice(0, 5).forEach((article, i) => {
        console.log(`  ${i + 1}. "${article.title}" (similarity: ${article.similarity?.toFixed(4)})`);
      });
    }
  }
}

testActualSearch();

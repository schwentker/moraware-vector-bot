#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(
  'https://cdfnowhfprbwjcqrpekd.supabase.co',
  'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m'
);

async function testDirectSQL() {
  console.log("🔍 Generating 'remnant' embedding...\n");

  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder('remnant', { pooling: 'mean', normalize: true });
  const vectorArray = Array.from(output.data);
  const vectorString = `[${vectorArray.join(',')}]`;

  console.log("Embedding length:", vectorArray.length);
  console.log("First 5 values:", vectorArray.slice(0, 5));

  // Test 1: Try direct table query (bypass RPC)
  console.log("\n📊 Test 1: Direct table query with .select()...\n");

  try {
    const { data, error, count } = await supabase
      .from('articles')
      .select('title, content, embedding', { count: 'exact' });

    if (error) {
      console.error("Error:", error);
    } else {
      console.log(`Total articles in DB: ${count}`);
      console.log(`Articles with embeddings: ${data.filter(a => a.embedding).length}`);

      // Check if "Create A Remnant" exists
      const remnantArticle = data.find(a => a.title === 'Create A Remnant');
      if (remnantArticle) {
        console.log("✅ 'Create A Remnant' found in DB");

        // Parse the embedding
        const dbVector = remnantArticle.embedding
          .replace(/^\[/, '')
          .replace(/\]$/, '')
          .split(',')
          .map(v => parseFloat(v.trim()));

        // Calculate similarity manually
        let dotProduct = 0;
        for (let i = 0; i < dbVector.length; i++) {
          dotProduct += dbVector[i] * vectorArray[i];
        }

        console.log(`   Manual similarity: ${dotProduct.toFixed(4)}`);
        console.log(`   Cosine distance: ${(1 - dotProduct).toFixed(4)}`);
        console.log(`   Should match threshold? ${(1 - dotProduct) < 0.9 ? 'YES' : 'NO'}`);
      } else {
        console.log("❌ 'Create A Remnant' NOT found in DB!");
      }
    }
  } catch (e) {
    console.error("Exception:", e.message);
  }

  // Test 2: Check RPC function parameters
  console.log("\n📊 Test 2: Call RPC and inspect what's happening...\n");

  const { data: rpcData, error: rpcError } = await supabase.rpc('search_articles', {
    query_embedding: vectorString,
    match_threshold: 0.1,
    match_count: 50,
    product_filter: null
  });

  if (rpcError) {
    console.error("RPC Error:", rpcError);
  } else {
    console.log(`RPC returned: ${rpcData.length} results`);
    rpcData.forEach((article, i) => {
      console.log(`  ${i + 1}. "${article.title}" (sim: ${article.similarity?.toFixed(4)})`);
    });
  }

  // Test 3: Raw SQL via PostgREST
  console.log("\n📊 Test 3: Test if vector string is being parsed correctly...\n");
  console.log("Vector string format:", vectorString.substring(0, 50) + "...");
  console.log("Vector string length:", vectorString.length);
}

testDirectSQL();

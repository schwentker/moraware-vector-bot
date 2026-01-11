#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(
  'https://cdfnowhfprbwjcqrpekd.supabase.co',
  'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m'
);

async function test() {
  console.log("Testing with the EXACT format used during loading...\n");

  // Get the article
  const { data: article } = await supabase
    .from('articles')
    .select('title, content, embedding')
    .eq('title', 'Create A Remnant')
    .single();

  // Parse DB embedding
  const dbVector = article.embedding
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map(v => parseFloat(v.trim()));

  // Generate embedding THE SAME WAY as load-kb-to-supabase.js
  const textToEmbed = `${article.title} ${article.title} ${article.content.substring(0, 500)}`;
  console.log("Text to embed:", textToEmbed.substring(0, 100) + "...\n");

  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder(textToEmbed, { pooling: 'mean', normalize: true });
  const localVector = Array.from(output.data);

  // Calculate similarity
  let dotProduct = 0;
  for (let i = 0; i < dbVector.length; i++) {
    dotProduct += dbVector[i] * localVector[i];
  }

  console.log("DB Vector first 5:", dbVector.slice(0, 5));
  console.log("Local Vector first 5:", localVector.slice(0, 5));
  console.log("\n📊 SIMILARITY:", dotProduct.toFixed(6));

  if (dotProduct > 0.95) {
    console.log("✅ MATCH! Loader and browser use same process.");
  } else {
    console.log("❌ MISMATCH! Even with same text format, embeddings differ.");
    console.log("   This suggests a library version or environment difference.");
  }
}

test();

#!/usr/bin/env node
/**
 * Vector Consistency Verification Script
 *
 * This script verifies that embeddings generated in the browser match
 * the embeddings stored in the database by comparing vectors for the
 * same text ("Create A Remnant").
 *
 * Run: node verify-embeddings.js
 */

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyVectorConsistency() {
  console.log("🚀 Starting Vector Consistency Check...\n");

  // 1. Get the stored vector from the database
  console.log("📥 Fetching 'Create A Remnant' from database...");
  const { data: dbRows, error } = await supabase
    .from('articles')
    .select('title, embedding')
    .eq('title', 'Create A Remnant')
    .single();

  if (error || !dbRows) {
    console.error("❌ Could not find 'Create A Remnant' in DB", error);
    return;
  }

  // Parse the embedding - it might be stored as a string or array
  let dbVector;
  console.log(`   Raw type: ${typeof dbRows.embedding}`);

  if (Array.isArray(dbRows.embedding)) {
    dbVector = dbRows.embedding;
  } else if (typeof dbRows.embedding === 'string') {
    // If it's a string like "[0.1,0.2,...]", parse it
    try {
      dbVector = JSON.parse(dbRows.embedding);
    } catch (e) {
      // Try parsing as PostgreSQL array format
      dbVector = dbRows.embedding
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .split(',')
        .map(v => parseFloat(v.trim()));
    }
  } else {
    console.error("❌ Unexpected embedding format:", typeof dbRows.embedding);
    console.error("   Value:", dbRows.embedding);
    return;
  }

  console.log(`✅ DB Vector loaded (length: ${dbVector.length})`);
  console.log(`   First 5 values: [${dbVector.slice(0, 5).join(', ')}]`);
  console.log(`   Value range: [${Math.min(...dbVector).toFixed(4)}, ${Math.max(...dbVector).toFixed(4)}]`);

  // Calculate DB vector magnitude
  const dbMagnitude = Math.sqrt(dbVector.reduce((sum, val) => sum + val * val, 0));
  console.log(`   Magnitude: ${dbMagnitude.toFixed(6)} (should be ~1.0 if normalized)\n`);

  // 2. Generate a fresh vector for the same text
  console.log("🔧 Generating fresh embedding with Xenova/all-MiniLM-L6-v2...");
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder('Create A Remnant', { pooling: 'mean', normalize: true });
  const localVector = Array.from(output.data);

  console.log(`✅ Local Vector generated (length: ${localVector.length})`);
  console.log(`   First 5 values: [${localVector.slice(0, 5).join(', ')}]`);
  console.log(`   Value range: [${Math.min(...localVector).toFixed(4)}, ${Math.max(...localVector).toFixed(4)}]`);

  // Calculate local vector magnitude
  const localMagnitude = Math.sqrt(localVector.reduce((sum, val) => sum + val * val, 0));
  console.log(`   Magnitude: ${localMagnitude.toFixed(6)} (should be ~1.0 if normalized)\n`);

  // 3. Compare lengths
  if (dbVector.length !== localVector.length) {
    console.error(`❌ DIMENSION MISMATCH: DB has ${dbVector.length}, Local has ${localVector.length}`);
    return;
  }

  // 4. Calculate dot product (cosine similarity since both are normalized)
  let dotProduct = 0;
  for (let i = 0; i < dbVector.length; i++) {
    dotProduct += dbVector[i] * localVector[i];
  }

  // 5. Also calculate cosine distance (what PostgreSQL uses)
  const cosineDistance = 1 - dotProduct;

  console.log("=" .repeat(60));
  console.log("📊 RESULTS:");
  console.log("=" .repeat(60));
  console.log(`Cosine Similarity (Dot Product): ${dotProduct.toFixed(6)}`);
  console.log(`Cosine Distance (1 - similarity): ${cosineDistance.toFixed(6)}`);
  console.log("=" .repeat(60));

  // 6. Interpret results
  console.log("\n🔍 DIAGNOSIS:\n");

  if (dotProduct > 0.99) {
    console.log("✅ EXCELLENT MATCH (> 0.99)");
    console.log("   The embeddings are virtually identical.");
    console.log("   The issue is likely in how the RPC call passes the vector to PostgreSQL.\n");
    console.log("💡 RECOMMENDED FIX:");
    console.log("   1. Ensure you're passing the vector as a string: `[${array.join(',')}]`");
    console.log("   2. Try the simplified RPC function without threshold logic");
    console.log("   3. Test with direct table query instead of RPC\n");
  } else if (dotProduct > 0.95) {
    console.log("✅ VERY GOOD MATCH (0.95 - 0.99)");
    console.log("   Minor differences, but embeddings are consistent.");
    console.log("   The issue is likely the RPC call or threshold logic.\n");
    console.log("💡 RECOMMENDED FIX:");
    console.log("   1. Check the match_threshold logic in the RPC function");
    console.log("   2. Ensure vector string formatting is correct\n");
  } else if (dotProduct > 0.80) {
    console.log("⚠️  MODERATE MATCH (0.80 - 0.95)");
    console.log("   Embeddings are somewhat similar but not identical.");
    console.log("   This suggests a normalization or pooling difference.\n");
    console.log("💡 RECOMMENDED FIX:");
    console.log("   1. Verify both use { pooling: 'mean', normalize: true }");
    console.log("   2. Check if DB vectors were normalized when stored");
    console.log("   3. Consider re-loading the database with consistent settings\n");
  } else {
    console.log("❌ POOR MATCH (< 0.80)");
    console.log("   The embeddings are significantly different!");
    console.log("   This indicates the DB was loaded with different settings.\n");
    console.log("💡 RECOMMENDED FIX:");
    console.log("   1. Re-run load-kb-to-supabase.js with the same model and settings");
    console.log("   2. Ensure both use 'Xenova/all-MiniLM-L6-v2'");
    console.log("   3. Ensure both use { pooling: 'mean', normalize: true }\n");
  }

  // 7. Test with the actual query "remnant"
  console.log("\n🧪 BONUS TEST: Compare 'remnant' query to 'Create A Remnant'\n");
  const remnantOutput = await embedder('remnant', { pooling: 'mean', normalize: true });
  const remnantVector = Array.from(remnantOutput.data);

  let remnantDotProduct = 0;
  for (let i = 0; i < dbVector.length; i++) {
    remnantDotProduct += dbVector[i] * remnantVector[i];
  }

  console.log(`Similarity between "remnant" query and "Create A Remnant" DB entry: ${remnantDotProduct.toFixed(6)}`);
  console.log(`Cosine Distance: ${(1 - remnantDotProduct).toFixed(6)}`);

  if (remnantDotProduct > 0.3) {
    console.log("✅ This is a reasonable semantic match - 'remnant' should find this article\n");
  } else {
    console.log("⚠️  Low semantic similarity - may not be the best match for 'remnant'\n");
  }
}

// Run the verification
verifyVectorConsistency().catch(console.error);

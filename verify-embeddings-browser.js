/**
 * Browser Console Version - Vector Consistency Check
 *
 * INSTRUCTIONS:
 * 1. Open https://sandboxlabs.ai/moraware-vector/ in your browser
 * 2. Open DevTools Console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Wait for the results
 */

async function verifyVectorConsistency() {
  console.log("🚀 Starting Vector Consistency Check...\n");

  // Import the pipeline from the window (already loaded by the app)
  const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');

  const supabase = createClient(
    'https://cdfnowhfprbwjcqrpekd.supabase.co',
    'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m'
  );

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

  // Parse the embedding
  let dbVector;
  if (typeof dbRows.embedding === 'string') {
    dbVector = JSON.parse(dbRows.embedding);
  } else if (Array.isArray(dbRows.embedding)) {
    dbVector = dbRows.embedding;
  } else {
    console.error("❌ Unexpected embedding format:", typeof dbRows.embedding);
    return;
  }

  console.log(`✅ DB Vector loaded (length: ${dbVector.length})`);
  console.log(`   First 5 values: [${dbVector.slice(0, 5).join(', ')}]`);

  const dbMagnitude = Math.sqrt(dbVector.reduce((sum, val) => sum + val * val, 0));
  console.log(`   Magnitude: ${dbMagnitude.toFixed(6)}\n`);

  // 2. Generate a fresh vector
  console.log("🔧 Generating fresh embedding...");
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder('Create A Remnant', { pooling: 'mean', normalize: true });
  const localVector = Array.from(output.data);

  console.log(`✅ Local Vector generated (length: ${localVector.length})`);
  console.log(`   First 5 values: [${localVector.slice(0, 5).join(', ')}]`);

  const localMagnitude = Math.sqrt(localVector.reduce((sum, val) => sum + val * val, 0));
  console.log(`   Magnitude: ${localMagnitude.toFixed(6)}\n`);

  // 3. Calculate similarity
  let dotProduct = 0;
  for (let i = 0; i < Math.min(dbVector.length, localVector.length); i++) {
    dotProduct += dbVector[i] * localVector[i];
  }

  console.log("=".repeat(60));
  console.log("📊 SIMILARITY SCORE:", dotProduct.toFixed(6));
  console.log("   Cosine Distance:", (1 - dotProduct).toFixed(6));
  console.log("=".repeat(60));

  if (dotProduct > 0.95) {
    console.log("✅ MATCH! Embeddings are consistent.");
    console.log("   Issue is likely the RPC call or threshold logic.");
  } else {
    console.log("❌ MISMATCH! Embeddings differ significantly.");
    console.log("   Database needs to be reloaded with correct settings.");
  }

  // Test with "remnant"
  console.log("\n🧪 Testing 'remnant' query similarity...");
  const remnantOutput = await embedder('remnant', { pooling: 'mean', normalize: true });
  const remnantVector = Array.from(remnantOutput.data);

  let remnantDot = 0;
  for (let i = 0; i < dbVector.length; i++) {
    remnantDot += dbVector[i] * remnantVector[i];
  }

  console.log(`   "remnant" vs "Create A Remnant": ${remnantDot.toFixed(6)}`);
}

// Run it
verifyVectorConsistency();

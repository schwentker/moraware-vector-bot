#!/usr/bin/env node
/**
 * Load KB articles into Supabase with vector embeddings
 * Run: node load-kb-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize embedding pipeline
let embedder = null;

async function initializeEmbedder() {
  console.log('🔧 Initializing embedding model (this may take a minute on first run)...');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✅ Embedding model ready!\n');
}

async function generateEmbedding(text) {
  if (!embedder) {
    await initializeEmbedder();
  }

  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function loadKBData() {
  console.log('📖 Loading kb-data.json...');
  const kbPath = join(__dirname, 'public', 'kb-data.json');
  const kbData = JSON.parse(readFileSync(kbPath, 'utf-8'));
  return kbData.articles;
}

async function uploadArticle(article, index, total) {
  console.log(`[${index + 1}/${total}] Processing: ${article.title}`);

  try {
    // Generate embedding from title + content (weighted toward title)
    const textToEmbed = `${article.title} ${article.title} ${article.content.substring(0, 500)}`;
    const embedding = await generateEmbedding(textToEmbed);

    // Insert into Supabase
    const { error } = await supabase
      .from('articles')
      .upsert({
        id: article.id,
        title: article.title,
        content: article.content,
        url: article.url,
        category: article.category,
        embedding: embedding
      });

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
      return false;
    }

    console.log(`  ✅ Uploaded successfully`);
    return true;

  } catch (err) {
    console.error(`  ❌ Exception: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting KB upload to Supabase...\n');

  // Initialize embedder first
  await initializeEmbedder();

  const articles = await loadKBData();
  console.log(`📚 Found ${articles.length} articles to process\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const success = await uploadArticle(articles[i], i, articles.length);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid overwhelming the database
    if (i < articles.length - 1 && i % 10 === 9) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${articles.length}`);
  console.log('='.repeat(50));
}

main().catch(console.error);

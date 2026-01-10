#!/usr/bin/env node
/**
 * Delete all articles and reload with properly formatted vector embeddings
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let embedder = null;

async function initializeEmbedder() {
  console.log('🔧 Initializing embedding model...');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✅ Model ready\n');
}

async function generateEmbedding(text) {
  if (!embedder) await initializeEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  // Return as PostgreSQL vector string format
  return `[${Array.from(output.data).join(',')}]`;
}

async function main() {
  console.log('🗑️  Deleting all existing articles...\n');

  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .neq('id', '');  // Delete all

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }

  console.log('✅ All articles deleted\n');
  console.log('📖 Loading kb-data.json...');

  const kbPath = join(__dirname, 'public', 'kb-data.json');
  const kbData = JSON.parse(readFileSync(kbPath, 'utf-8'));
  const articles = kbData.articles;

  console.log(`📚 Found ${articles.length} articles to process\n`);

  await initializeEmbedder();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] Processing: ${article.title}`);

    try {
      const textToEmbed = `${article.title} ${article.title} ${article.content.substring(0, 500)}`;
      const embedding = await generateEmbedding(textToEmbed);

      const { error } = await supabase
        .from('articles')
        .insert({
          id: article.id,
          title: article.title,
          content: article.content,
          url: article.url,
          category: article.category,
          embedding: embedding  // PostgreSQL vector format string
        });

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Uploaded`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Exception: ${err.message}`);
      failCount++;
    }

    // Small delay every 10 articles
    if (i % 10 === 9 && i < articles.length - 1) {
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

#!/usr/bin/env node
/**
 * Check what Inventory articles are in Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkInventory() {
  console.log('🔍 Checking Inventory articles in database...\n');

  // Get all articles with "inventory" in URL or category
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, url, category')
    .or('url.ilike.%inventory%,category.ilike.%inventory%')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Found ${data.length} Inventory-related articles:\n`);

  data.forEach((article, idx) => {
    console.log(`${idx + 1}. ${article.title}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   URL: ${article.url}\n`);
  });

  // Check total articles
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📚 Total articles in database: ${count}`);
}

checkInventory();

#!/usr/bin/env node
/**
 * Set up Supabase database schema for vector search
 * Run: node setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
// Note: For schema changes, you typically need the service_role key, not anon key
// If this fails, you'll need to run the SQL manually in Supabase SQL Editor
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database for vector search...\n');

  // Try to create the table using the client
  // Note: This may fail with anon key - in that case, run supabase-setup.sql manually

  console.log('⚠️  Note: Schema setup typically requires service_role key.');
  console.log('If this fails, please run the SQL in supabase-setup.sql manually at:');
  console.log('https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/sql\n');

  // Check if table already exists by trying to query it
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Articles table does not exist or is not accessible.');
    console.log('   Error:', error.message);
    console.log('\n📋 Please run the SQL from supabase-setup.sql manually.');
    console.log('   Go to: https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/sql');
    console.log('   Copy the contents of supabase-setup.sql and execute it.\n');
    return false;
  }

  console.log('✅ Articles table exists and is accessible!');

  // Check if there are any articles
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Current articles in database: ${count || 0}\n`);

  return true;
}

setupDatabase().catch(console.error);

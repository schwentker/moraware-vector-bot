#!/usr/bin/env node
/**
 * Test if Supabase embed Edge Function exists
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdfnowhfprbwjcqrpekd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8tknVOhKWJ-jp1s3v1S-1A_iuuVni0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmbedFunction() {
  console.log('🧪 Testing Supabase embed Edge Function...\n');

  try {
    const { data, error } = await supabase.functions.invoke('embed', {
      body: {
        input: 'test query',
        model: 'all-MiniLM-L6-v2'
      }
    });

    if (error) {
      console.log('❌ Embed function error:', error);
      console.log('\n⚠️  The embed Edge Function may not exist or is not configured.');
      console.log('   You need to create it at:');
      console.log('   https://cdfnowhfprbwjcqrpekd.supabase.co/project/_/functions\n');
      return false;
    }

    if (data && data.embedding && Array.isArray(data.embedding)) {
      console.log('✅ Embed function works!');
      console.log(`   Generated embedding with ${data.embedding.length} dimensions\n`);
      return true;
    }

    console.log('⚠️  Unexpected response format:', data);
    return false;

  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

testEmbedFunction();

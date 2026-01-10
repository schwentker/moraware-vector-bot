-- Fix Row Level Security to allow inserts with anon key
-- Run this in Supabase SQL Editor: https://cdfnowhfprbwjcqrpekd.supabase.co

-- Allow anonymous inserts (for loading data)
CREATE POLICY "Allow anonymous insert access" ON articles
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous updates (for upserts)
CREATE POLICY "Allow anonymous update access" ON articles
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

#!/usr/bin/env node

// Fix RLS infinite recursion caused by 040_admin_rls.sql
// Admin policies self-reference profiles, creating infinite loop
// These policies are unnecessary: admin routes use service role key (bypasses RLS)

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) { console.error('Set env vars'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY);

const FIX_SQL = `
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
DROP POLICY IF EXISTS "Admins can read all restaurants" ON public.restaurants;
`;

async function main() {
  console.log('Fixing RLS infinite recursion...');
  const { error } = await supabase.rpc('exec_sql', { sql: FIX_SQL });
  if (error) {
    console.error('FAIL:', error.message || error);
    console.log('Run manually in Supabase SQL Editor:');
    console.log(FIX_SQL);
    process.exit(1);
  }
  console.log('OK - Recursive policies dropped');
  const { data, error: e1 } = await supabase.from('profiles').select('id').limit(1);
  console.log(e1 ? 'PROFILES STILL BROKEN: ' + e1.message : 'PROFILES OK');
  const { data: r, error: e2 } = await supabase.from('restaurants').select('id').limit(1);
  console.log(e2 ? 'RESTAURANTS STILL BROKEN: ' + e2.message : 'RESTAURANTS OK');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

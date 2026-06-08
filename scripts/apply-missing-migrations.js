#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY);
const MIG_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const MIGRATIONS = [
  '20240509000000_add_verification_fields.sql',
  '040_admin_rls.sql',
];

async function checkColumn(col) {
  const { error } = await supabase.from('profiles').select(col).limit(1);
  if (error && (error.message?.includes('does not exist') || error.code === '42703')) return false;
  if (error) return null;
  return true;
}

async function runSql(filename) {
  const filepath = path.join(MIG_DIR, filename);
  if (!fs.existsSync(filepath)) { console.log('[SKIP] ' + filename); return; }
  const sql = fs.readFileSync(filepath, 'utf-8');
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    if (error.code === '42883') {
      console.log('[MANUAL] exec_sql not found. Apply in SQL Editor: ' + filename);
    } else if (error.message?.includes('already exists')) {
      console.log('[OK] ' + filename + ' - already exists');
    } else {
      console.error('[FAIL] ' + filename + ':', error.message || error);
    }
  } else {
    console.log('[OK] ' + filename + ' applied');
  }
}

async function main() {
  console.log('=== FoodLister Missing Migration Applier ===');
  const cols = ['is_verified','verified_at','verification_method','login_attempts','locked_until'];
  let anyMissing = false;
  for (const col of cols) {
    const exists = await checkColumn(col);
    if (exists === false) { console.log('[MISSING] profiles.' + col); anyMissing = true; }
    else if (exists === true) { console.log('[OK]     profiles.' + col); }
    else { console.log('[?]      profiles.' + col); anyMissing = true; }
  }
  if (!anyMissing) { console.log('All columns exist!'); return; }
  for (const m of MIGRATIONS) { await runSql(m); }
  const v = await checkColumn('is_verified');
  console.log(v === true ? 'SUCCESS: is_verified exists!' : 'STILL MISSING - apply manually');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

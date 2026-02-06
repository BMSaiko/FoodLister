#!/usr/bin/env node

/**
 * Database Fix Script for FoodList Application
 * 
 * This script helps fix the duplicate review IDs and restaurant creator issues
 * that are causing the React key errors and authentication problems.
 * 
 * Usage: node scripts/run-database-fixes.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your Supabase project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) {
  console.error('❌ Please set your Supabase URL and Service Role Key in environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {

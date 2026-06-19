import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase admin client using the service role key.
 * This bypasses Row Level Security (RLS) — use ONLY in admin API routes
 * after verifying the user is an admin via getServerClient.
 *
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured,
 * so callers can return a proper error instead of throwing.
 */
export function createAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      '[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin API routes require this key. Add it to .env.local (see .env.example).'
    );
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

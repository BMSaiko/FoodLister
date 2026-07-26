import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

// Client-side Supabase client — uses default localStorage for session persistence.
// SSR cookie handling is managed separately by the middleware in middleware.ts.
export const getClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl) {
      throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is required.");
    }
    if (!supabaseKey) {
      throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
    }

    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
};

export const createClient = () => {
  return getClient();
};

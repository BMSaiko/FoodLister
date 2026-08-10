import { createServerClient } from '@supabase/ssr';

import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseClient: ReturnType<typeof createServerClient<Database>> | null = null;

// Client-side Supabase client — uses cookies for session persistence.
// This ensures the middleware can read the session on subsequent requests.
export const getClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl) {
      throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is required.");
    }
    if (!supabaseKey) {
      throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
    }

    supabaseClient = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          // ponytail: SSR guard — doc missing on server; empty cookies = unauthenticated until browser hydrates
          if (typeof document === 'undefined') return [];
          return document.cookie.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          // ponytail: SSR guard — setAll only runs client-side after hydration
          if (typeof document === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge ?? 60 * 60 * 24 * 365}; samesite=lax`;
          });
        },
      },
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

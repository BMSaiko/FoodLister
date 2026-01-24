import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const createServerClient = (request: NextRequest, response: NextResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            if (response) {
              response.cookies.set(name, value, options);
            }
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// Enhanced server client with session validation
export const getServerClient = async (request?: NextRequest, response?: NextResponse) => {
  const supabase = createServerClient(request!, response!);
  
  // Validate session and return authenticated client
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Return null instead of throwing error for unauthenticated requests
    return null;
  }
  
  return supabase;
};

// Secure server client with automatic logout on session expiration
export const getSecureServerClient = async (request?: NextRequest, response?: NextResponse) => {
  const supabase = createServerClient(request!, response!);
  
  // Validate session and check expiration
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session || session.expires_at < Math.floor(Date.now() / 1000)) {
    // Clear cookies and return unauthorized
    if (response) {
      response.cookies.set('sb-access-token', '', { expires: new Date(0) });
      response.cookies.set('sb-refresh-token', '', { expires: new Date(0) });
    }
    throw new Error('Session expired');
  }
  
  return supabase;
};

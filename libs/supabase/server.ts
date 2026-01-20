import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from './client';

// Admin client for operations requiring elevated privileges
export const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!serviceRoleKey) {
    throw new Error('Environment variable SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
};

// Server client for API routes with authentication
export const getServerClient = async (request?: NextRequest, response?: NextResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!supabaseKey) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }

  if (request && response) {
    // For API routes with request/response objects
    return createSupabaseServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    });
  } else {
    // For server components/actions
    const cookieStore = await cookies();
    return createSupabaseServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          cookieStore.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    });
  }
};

// Authenticated client from JWT token (for API routes receiving external requests)
export const getAuthenticatedClient = async (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!supabaseKey) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }

  // Get JWT token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header with Bearer token required');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Create client and set the session
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  const { error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: token, // Use same token for refresh (simplified)
  });

  if (error) {
    throw new Error(`Failed to authenticate: ${error.message}`);
  }

  return supabase;
};

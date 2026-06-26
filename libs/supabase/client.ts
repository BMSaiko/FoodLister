import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import type { Database, SupabaseStorage } from "./types";

// Cookie-based storage implementation for SSR
function getCookieBasedStorage(): SupabaseStorage {
  // Client-side: use document.cookie with improved error handling and fallback
  const storageKey = 'supabase-auth-token';
  
  return {
    getItem: (key: string) => {
      try {
        // First try to get from cookies
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        const cookieValue = match ? match[2] : null;
        
        if (cookieValue) {
          try {
            return decodeURIComponent(cookieValue);
          } catch (decodeError) {
            console.warn(`Error decoding cookie ${key}:`, decodeError);
            return null;
          }
        }
        
        // Fallback to localStorage if cookie is not available
        const localStorageValue = localStorage.getItem(key);
        if (localStorageValue) {
          return localStorageValue;
        }
        
        return null;
      } catch (error) {
        console.warn(`Error reading storage for ${key}:`, error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        const expires = new Date();
        expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        
        // Try to set cookie with more permissive settings
        try {
          document.cookie = `${key}=${encodeURIComponent(value)};path=/;SameSite=None;Secure;expires=${expires.toUTCString()}`;
        } catch (cookieError) {
          console.warn(`Failed to set cookie ${key}, falling back to localStorage:`, cookieError);
          // Fallback to localStorage
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn(`Error setting storage for ${key}:`, error);
      }
    },
    removeItem: (key: string) => {
      try {
        // Remove from cookies
        document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        // Also remove from localStorage fallback
        localStorage.removeItem(key);
        
      } catch (error) {
        console.warn(`Error removing storage for ${key}:`, error);
      }
    }
  };
}


// Certifique-se de criar um arquivo .env.local com estas variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

// Singleton pattern to reuse client instance across requests
export const getClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl) {
      throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
    }
    if (!supabaseKey) {
      throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
    }

    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: getCookieBasedStorage(),
        detectSessionInUrl: true,
      }
    });
  }
  return supabaseClient;
};

// Legacy function for backward compatibility
export const createClient = () => {
  return getClient();
};
import { useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ApiCallOptions extends RequestInit {
  timeout?: number;
}

interface SessionCache {
  token: string;
  expiresAt: number;
  lastFetched: number;
}

export const useApiClient = () => {
  const router = useRouter();
  const sessionCache = useRef<SessionCache | null>(null);
  const sessionPromise = useRef<Promise<string> | null>(null);
  const isRefreshing = useRef(false);

  // Clear all authentication data
  const clearAuthData = useCallback(() => {
    try {
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cache
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      
      // Clear session cache
      sessionCache.current = null;
      sessionPromise.current = null;
      isRefreshing.current = false;
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  // Get session token with caching
  const getSessionToken = useCallback(async (): Promise<string> => {
    const now = Date.now();
    
    // Check if we have a valid cached session
    if (sessionCache.current && sessionCache.current.expiresAt > now + 60000) {
      return sessionCache.current.token;
    }

    // If we're already fetching a session, return the existing promise
    if (sessionPromise.current) {
      return sessionPromise.current;
    }

    // If we're refreshing, wait for it to complete
    if (isRefreshing.current) {
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
      return getSessionToken();
    }

    // Create new session fetch promise
    sessionPromise.current = (async () => {
      try {
        isRefreshing.current = true;
        
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const token = sessionData?.access_token;
          
          if (token) {
            // Cache the session for 5 minutes (with 1 minute buffer)
            sessionCache.current = {
              token,
              expiresAt: now + (sessionData.expires_in || 3600) * 1000 - 60000,
              lastFetched: now
            };
            
            return token;
          }
        }
        
        throw new Error('No session token available');
      } catch (error) {
        console.warn('Could not get session from API:', error);
        throw error;
      } finally {
        isRefreshing.current = false;
        sessionPromise.current = null;
      }
    })();

    return sessionPromise.current;
  }, []);

  const apiCall = useCallback(async (
    endpoint: string, 
    options: ApiCallOptions = {}
  ): Promise<Response> => {
    const {
      timeout = 10000,
      headers,
      ...fetchOptions
    } = options;

    try {
      // Get session token (cached)
      let accessToken;
      
      try {
        accessToken = await getSessionToken();
      } catch (error) {
        // Fallback to cookies if session API fails
        const cookieMatch = document.cookie.match(/sb-access-token=([^;]+)/);
        if (cookieMatch) {
          accessToken = cookieMatch[1];
        } else {
          throw new Error('No authentication token found');
        }
      }

      const requestHeaders = {
        ...headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle 401 errors (token expired/invalid)
      if (response.status === 401) {
        // Clear auth data and redirect
        clearAuthData();
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        router.push('/auth/signin');
        throw new Error('Authentication expired');
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Network error');
    }
  }, [router, getSessionToken, clearAuthData]);

  // Clear session cache on unmount
  useEffect(() => {
    return () => {
      sessionCache.current = null;
      sessionPromise.current = null;
      isRefreshing.current = false;
    };
  }, []);

  // Helper methods for common HTTP methods
  const get = useCallback(async (endpoint: string, options?: ApiCallOptions) => {
    return apiCall(endpoint, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback(async (endpoint: string, body?: any, options?: ApiCallOptions) => {
    return apiCall(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [apiCall]);

  const put = useCallback(async (endpoint: string, body?: any, options?: ApiCallOptions) => {
    return apiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [apiCall]);

  const patch = useCallback(async (endpoint: string, body?: any, options?: ApiCallOptions) => {
    return apiCall(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [apiCall]);

  const del = useCallback(async (endpoint: string, options?: ApiCallOptions) => {
    return apiCall(endpoint, { ...options, method: 'DELETE' });
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    patch,
    del,
    clearAuthData,
    getSessionToken
  };
};
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ApiCallOptions extends RequestInit {
  timeout?: number;
}

export const useApiClient = () => {
  const router = useRouter();

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
      // Get session from Supabase client
      let accessToken;
      
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          accessToken = sessionData?.access_token;
        }
      } catch (error) {
        console.warn('Could not get session from API:', error);
      }

      // If no token found, try cookies as fallback
      if (!accessToken) {
        const cookieMatch = document.cookie.match(/sb-access-token=([^;]+)/);
        if (cookieMatch) {
          accessToken = cookieMatch[1];
        }
      }

      // If still no token, throw error
      if (!accessToken) {
        throw new Error('No authentication token found');
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
  }, [router]);

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
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
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
    clearAuthData
  };
};
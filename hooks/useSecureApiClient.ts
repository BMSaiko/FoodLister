import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface SecureApiCallOptions extends RequestInit {
  timeout?: number;
}

export const useSecureApiClient = () => {
  const router = useRouter();

  const secureApiCall = useCallback(async (
    endpoint: string, 
    options: SecureApiCallOptions = {}
  ): Promise<Response> => {
    const {
      timeout = 10000,
      headers,
      ...fetchOptions
    } = options;

    try {
      // Get session from cookies - try multiple possible cookie names
      const getSessionFromCookies = () => {
        // Try different possible cookie names for Supabase tokens
        const cookieNames = [
          'sb-access-token',
          'sb_refresh_token',
          'sb-access-token-local',
          'sb_refresh_token-local',
          'sb-access-token-localhost',
          'sb_refresh_token-localhost'
        ];

        for (const cookieName of cookieNames) {
          const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
          if (match) {
            return match[2];
          }
        }
        return null;
      };

      let accessToken = getSessionFromCookies();
      
      // If no token found in cookies, try to get from Supabase client
      if (!accessToken) {
        try {
          const sessionData = await fetch('/api/auth/session').then(r => r.json());
          if (sessionData?.access_token) {
            accessToken = sessionData.access_token;
          }
        } catch (error) {
          console.warn('Could not get session from API:', error);
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

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
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
  const get = useCallback(async (endpoint: string, options?: SecureApiCallOptions) => {
    return secureApiCall(endpoint, { ...options, method: 'GET' });
  }, [secureApiCall]);

  const post = useCallback(async (endpoint: string, body?: any, options?: SecureApiCallOptions) => {
    return secureApiCall(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [secureApiCall]);

  const put = useCallback(async (endpoint: string, body?: any, options?: SecureApiCallOptions) => {
    return secureApiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [secureApiCall]);

  const patch = useCallback(async (endpoint: string, body?: any, options?: SecureApiCallOptions) => {
    return secureApiCall(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [secureApiCall]);

  const del = useCallback(async (endpoint: string, options?: SecureApiCallOptions) => {
    return secureApiCall(endpoint, { ...options, method: 'DELETE' });
  }, [secureApiCall]);

  return {
    secureApiCall,
    get,
    post,
    put,
    patch,
    del,
    clearAuthData
  };
};
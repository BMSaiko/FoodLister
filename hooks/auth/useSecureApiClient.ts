import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface SecureApiCallOptions extends RequestInit {
  timeout?: number;
}

export const useSecureApiClient = () => {
  const router = useRouter();
  
  // Circuit breaker state
  const [circuitState, setCircuitState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState(0);
  const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;
  const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds

  const checkCircuitBreaker = useCallback(() => {
    const now = Date.now();
    
    if (circuitState === 'OPEN') {
      if (now - lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
        setCircuitState('HALF_OPEN');
        setFailureCount(0);
        return true;
      }
      return false;
    }
    
    if (circuitState === 'HALF_OPEN' && failureCount >= CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
      setCircuitState('OPEN');
      setLastFailureTime(now);
      return false;
    }
    
    return true;
  }, [circuitState, lastFailureTime, failureCount]);

  const recordFailure = useCallback(() => {
    setFailureCount(prev => prev + 1);
    setLastFailureTime(Date.now());
    
    if (failureCount + 1 >= CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
      setCircuitState('OPEN');
    }
  }, [failureCount]);

  const recordSuccess = useCallback(() => {
    if (circuitState === 'HALF_OPEN') {
      setCircuitState('CLOSED');
      setFailureCount(0);
    }
  }, [circuitState]);

  const secureApiCall = useCallback(async (
    endpoint: string, 
    options: SecureApiCallOptions = {},
    retryCount: number = 0
  ): Promise<Response> => {
    const {
      timeout = 10000,
      headers,
      ...fetchOptions
    } = options;

    try {
      // Get session from Supabase auth API - this is the most reliable method in Next.js 15
      let accessToken = null;
      
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Important for cookies
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData?.access_token) {
            accessToken = sessionData.access_token;
          }
        }
      } catch (error) {
        console.warn('Could not get session from auth API:', error);
      }

      // If still no token, try to get from localStorage as fallback
      if (!accessToken) {
        try {
          if (typeof window !== 'undefined') {
            const storedSession = localStorage.getItem('sb-access-token');
            if (storedSession) {
              accessToken = storedSession;
            }
          }
        } catch (error) {
          console.warn('Could not get token from localStorage:', error);
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
          // Implement retry logic with exponential backoff for timeout errors
          if (retryCount < 2) { // Max 2 retries
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
            console.log(`Request timeout, retrying in ${delay}ms (attempt ${retryCount + 1}/2)`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return secureApiCall(endpoint, options, retryCount + 1);
          }
          
          throw new Error('Request timeout after retries');
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
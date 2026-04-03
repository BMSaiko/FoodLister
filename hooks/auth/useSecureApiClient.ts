import { useCallback, useState, useRef, useEffect } from 'react';
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
  
  // Token caching to prevent repeated session API calls
  const tokenCache = useRef<{ token: string; timestamp: number } | null>(null);
  const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const sessionRequestPromise = useRef<Promise<string | null> | null>(null);

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

  // Get access token with caching to prevent repeated session API calls
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const now = Date.now();
    
    // Check cache first
    if (tokenCache.current && (now - tokenCache.current.timestamp) < TOKEN_CACHE_DURATION) {
      return tokenCache.current.token;
    }
    
    // If there's already a session request in progress, wait for it
    if (sessionRequestPromise.current) {
      return sessionRequestPromise.current;
    }
    
    // Make new session request
    sessionRequestPromise.current = (async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData?.access_token) {
            // Cache the token
            tokenCache.current = {
              token: sessionData.access_token,
              timestamp: now
            };
            return sessionData.access_token;
          }
        }
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem('sb-access-token');
          if (storedSession) {
            tokenCache.current = {
              token: storedSession,
              timestamp: now
            };
            return storedSession;
          }
        }
        
        return null;
      } catch (error) {
        console.warn('Could not get session from auth API:', error);
        return null;
      } finally {
        // Clear the promise reference
        sessionRequestPromise.current = null;
      }
    })();
    
    return sessionRequestPromise.current;
  }, []);

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
      // Get access token with caching
      const accessToken = await getAccessToken();
      
      // If no token, throw error
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
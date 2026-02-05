import { useCallback } from 'react';

interface PublicApiCallOptions extends RequestInit {
  timeout?: number;
}

export const usePublicApiClient = () => {
  const publicApiCall = useCallback(async (
    endpoint: string, 
    options: PublicApiCallOptions = {}
  ): Promise<Response> => {
    const {
      timeout = 10000,
      headers,
      ...fetchOptions
    } = options;

    try {
      const requestHeaders = {
        ...headers,
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

      // Handle timeout
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
  }, []);

  // Helper methods for common HTTP methods
  const get = useCallback(async (endpoint: string, options?: PublicApiCallOptions) => {
    return publicApiCall(endpoint, { ...options, method: 'GET' });
  }, [publicApiCall]);

  const post = useCallback(async (endpoint: string, body?: any, options?: PublicApiCallOptions) => {
    return publicApiCall(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [publicApiCall]);

  const put = useCallback(async (endpoint: string, body?: any, options?: PublicApiCallOptions) => {
    return publicApiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [publicApiCall]);

  const patch = useCallback(async (endpoint: string, body?: any, options?: PublicApiCallOptions) => {
    return publicApiCall(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }, [publicApiCall]);

  const del = useCallback(async (endpoint: string, options?: PublicApiCallOptions) => {
    return publicApiCall(endpoint, { ...options, method: 'DELETE' });
  }, [publicApiCall]);

  return {
    publicApiCall,
    get,
    post,
    put,
    patch,
    del
  };
};
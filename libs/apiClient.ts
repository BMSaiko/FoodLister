/**
 * Centralized API Client
 * Provides request caching, deduplication, retry logic, and abort support
 */

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: boolean;
  cacheTTL?: number; // milliseconds
  retry?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Request deduplication cache - stores pending promises
const pendingRequests = new Map<string, Promise<any>>();

// Response cache - stores completed responses
const responseCache = new Map<string, CacheEntry<any>>();

// Rate limiting
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_SECOND = 10;

// Auth token
let authToken: string | null = null;

// Request interceptors
type RequestInterceptor = (url: string, options: RequestInit) => RequestInit;
const requestInterceptors: RequestInterceptor[] = [];

// Response interceptors
type ResponseInterceptor = (response: Response, url: string) => void;
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Rate limiter - throws if too many requests
 */
function checkRateLimit(): void {
  const now = Date.now();
  const oneSecondAgo = now - 1000;
  
  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneSecondAgo) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }
  
  requestTimestamps.push(now);
}

/**
 * Generate cache key from URL and options
 */
function generateCacheKey(url: string, options?: RequestInit): string {
  return `${options?.method || 'GET'}:${url}:${options?.body || ''}`;
}

/**
 * Check if cached data is still valid
 */
function getCachedData<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    responseCache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Store data in cache
 */
function setCachedData<T>(key: string, data: T, ttl: number): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Default retry delay with exponential backoff
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Create default headers with auth token
 */
function createDefaultHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

/**
 * Main fetch with retry, caching, and deduplication
 */
async function apiFetch<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    cache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    retry = 2,
    retryDelay = 1000,
    timeout = 30000,
    headers: customHeaders,
    signal: externalSignal
  } = options;

  const method = 'GET';
  const cacheKey = generateCacheKey(url, { method });

  // Check cache first for GET requests
  if (cache) {
    const cached = getCachedData<T>(cacheKey);
    if (cached) {
      return { data: cached, status: 200 };
    }
  }

  // Check for pending request (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Link external signal if provided
  externalSignal?.addEventListener('abort', () => controller.abort());

  // Build request options
  let fetchOptions: RequestInit = {
    method,
    headers: createDefaultHeaders(customHeaders),
    signal: controller.signal
  };

  // Apply request interceptors
  for (const interceptor of requestInterceptors) {
    fetchOptions = interceptor(url, fetchOptions);
  }

  // Create the fetch promise
  const promise = (async (): Promise<ApiResponse<T>> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        checkRateLimit();
        
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of responseInterceptors) {
          interceptor(response, url);
        }

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data?.error || data?.message || `HTTP ${response.status}`;
          
          // Don't retry client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(errorMsg);
          }
          
          lastError = new Error(errorMsg);
          
          // Wait before retry (exponential backoff)
          if (attempt < retry) {
            const delay = response.status === 429 
              ? 2000 // Longer delay for rate limit
              : getRetryDelay(attempt, retryDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }

        // Cache successful response
        if (cache) {
          setCachedData(cacheKey, data, cacheTTL);
        }

        return { data, status: response.status };
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Request aborted');
        }
        
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Wait before retry
        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  })();

  // Store pending request for deduplication
  pendingRequests.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Make a POST request
 */
async function post<T = any>(
  url: string,
  body?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'cache'> = {}
): Promise<ApiResponse<T>> {
  const { headers: customHeaders, signal: externalSignal, retry = 1, retryDelay = 1000, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  externalSignal?.addEventListener('abort', () => controller.abort());

  let fetchOptions: RequestInit = {
    method: 'POST',
    headers: createDefaultHeaders(customHeaders),
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal
  };

  for (const interceptor of requestInterceptors) {
    fetchOptions = interceptor(url, fetchOptions);
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      checkRateLimit();
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      for (const interceptor of responseInterceptors) {
        interceptor(response, url);
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `HTTP ${response.status}`;
        lastError = new Error(errorMsg);
        
        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
        }
        continue;
      }

      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retry) {
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Make a PUT request
 */
async function put<T = any>(
  url: string,
  body?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'cache'> = {}
): Promise<ApiResponse<T>> {
  return post<T>(url, body, { ...options, method: 'PUT' } as any);
}

/**
 * Make a PATCH request
 */
async function patch<T = any>(
  url: string,
  body?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'cache'> = {}
): Promise<ApiResponse<T>> {
  return post<T>(url, body, { ...options, method: 'PATCH' } as any);
}

/**
 * Make a DELETE request
 */
async function del<T = any>(
  url: string,
  options: Omit<ApiRequestOptions, 'cache'> = {}
): Promise<ApiResponse<T>> {
  const { headers: customHeaders, signal: externalSignal, retry = 1, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  externalSignal?.addEventListener('abort', () => controller.abort());

  let fetchOptions: RequestInit = {
    method: 'DELETE',
    headers: createDefaultHeaders(customHeaders),
    signal: controller.signal
  };

  for (const interceptor of requestInterceptors) {
    fetchOptions = interceptor(url, fetchOptions);
  }

  const response = await fetch(url, fetchOptions);
  clearTimeout(timeoutId);

  for (const interceptor of responseInterceptors) {
    interceptor(response, url);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
  }

  return { data, status: response.status };
}

/**
 * Invalidate cached responses matching a pattern
 */
function invalidateCache(pattern?: string | RegExp): void {
  if (!pattern) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    } else {
      if (pattern.test(key)) {
        responseCache.delete(key);
      }
    }
  }
}

/**
 * Clear all cached responses
 */
function clearCache(): void {
  responseCache.clear();
}

/**
 * Set authentication token
 */
function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Get current auth token
 */
function getAuthToken(): string | null {
  return authToken;
}

/**
 * Add request interceptor
 */
function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

/**
 * Add response interceptor
 */
function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

/**
 * Get cache stats for debugging
 */
function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys())
  };
}

/**
 * Get pending requests for debugging
 */
function getPendingRequests(): string[] {
  return Array.from(pendingRequests.keys());
}

// Export singleton API client
export const apiClient = {
  get: apiFetch,
  post,
  put,
  patch,
  delete: del,
  invalidateCache,
  clearCache,
  setAuthToken,
  getAuthToken,
  addRequestInterceptor,
  addResponseInterceptor,
  getCacheStats,
  getPendingRequests
};

export default apiClient;
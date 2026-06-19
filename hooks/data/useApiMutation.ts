/**
 * useApiMutation - Generic hook for API mutations (POST, PUT, DELETE, PATCH)
 * Provides loading state, error handling, and success callbacks
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export interface MutationResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
}

export interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useApiMutation<T = any>(options: UseApiMutationOptions<T> = {}) {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'Erro ao processar requisição',
    showToast = true
  } = options;

  const [state, setState] = useState<MutationResult<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const mutate = useCallback(async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    body?: Record<string, any>
  ): Promise<T | null> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState(prev => ({ ...prev, isLoading: true, error: null, isSuccess: false }));

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: abortController.signal
      };

      if (body && method !== 'DELETE') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || errorMessage;
        throw new Error(errorMsg);
      }

      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true
      });

      if (showToast && successMessage) {
        toast.success(successMessage, {
          position: "top-center",
          autoClose: 3000
        });
      }

      onSuccess?.(data);
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }

      const errorMsg = error instanceof Error ? error.message : errorMessage;
      
      setState({
        data: null,
        error: errorMsg,
        isLoading: false,
        isSuccess: false
      });

      if (showToast) {
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 4000
        });
      }

      onError?.(errorMsg);
      return null;
    }
  }, [successMessage, errorMessage, showToast, onSuccess, onError]);

  // Convenience methods
  const create = useCallback((url: string, body: Record<string, any>) => 
    mutate(url, 'POST', body), [mutate]);

  const update = useCallback((url: string, body: Record<string, any>) => 
    mutate(url, 'PUT', body), [mutate]);

  const patch = useCallback((url: string, body: Record<string, any>) => 
    mutate(url, 'PATCH', body), [mutate]);

  const remove = useCallback((url: string) => 
    mutate(url, 'DELETE'), [mutate]);

  // Reset mutation state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false
    });
  }, []);

  return {
    ...state,
    mutate,
    create,
    update,
    patch,
    remove,
    reset
  };
}
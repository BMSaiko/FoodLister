/**
 * useLocalStorage - Hook for localStorage operations with type safety
 * Provides get, set, remove, and clear operations with JSON serialization
 */

import { useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const useLocalStorage = () => {
  const get = useCallback(<T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Check if it's a cached entry with TTL
      if (parsed && typeof parsed.timestamp === 'number' && typeof parsed.ttl === 'number') {
        const isExpired = Date.now() - parsed.timestamp >= parsed.ttl;
        if (isExpired) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.data as T;
      }
      
      return parsed as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  }, []);

  const set = useCallback(<T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, []);

  const setWithTTL = useCallback(<T>(key: string, value: T, ttl: number): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}" with TTL:`, error);
    }
  }, []);

  const remove = useCallback((key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, []);

  const clear = useCallback((): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }, []);

  const removeByPrefix = useCallback((prefix: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn(`Error removing localStorage keys with prefix "${prefix}":`, error);
    }
  }, []);

  return { get, set, setWithTTL, remove, clear, removeByPrefix };
};
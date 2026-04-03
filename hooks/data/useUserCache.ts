import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface UserCacheData {
  profile: any;
  reviews: any[];
  lists: any[];
  restaurants: any[];
}

export const useUserCache = () => {
  const [cache, setCache] = useState<Map<string, CacheEntry<UserCacheData>>>(new Map());
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null);

  // Default cache TTL: 5 minutes
  const DEFAULT_TTL = 5 * 60 * 1000;

  // Cleanup expired entries
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      for (const [key, entry] of newCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          newCache.delete(key);
        }
      }
      
      return newCache;
    });
  }, []);

  // Start cleanup interval
  useEffect(() => {
    cleanupInterval.current = setInterval(cleanupExpiredEntries, 60000); // Check every minute

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, [cleanupExpiredEntries]);

  // Get cached data for a user
  const getCachedData = useCallback((userId: string) => {
    const entry = cache.get(userId);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(userId);
        return newCache;
      });
      return null;
    }

    return entry.data;
  }, [cache]);

  // Set cached data for a user
  const setCachedData = useCallback((userId: string, data: UserCacheData, ttl: number = DEFAULT_TTL) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(userId, {
        data,
        timestamp: Date.now(),
        ttl
      });
      return newCache;
    });
  }, [DEFAULT_TTL]);

  // Update specific cache entries
  const updateCachedProfile = useCallback((userId: string, profileData: any) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      const existingEntry = newCache.get(userId);
      
      if (existingEntry) {
        newCache.set(userId, {
          ...existingEntry,
          data: {
            ...existingEntry.data,
            profile: profileData
          },
          timestamp: Date.now()
        });
      }
      
      return newCache;
    });
  }, []);

  const updateCachedReviews = useCallback((userId: string, reviewsData: any[]) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      const existingEntry = newCache.get(userId);
      
      if (existingEntry) {
        newCache.set(userId, {
          ...existingEntry,
          data: {
            ...existingEntry.data,
            reviews: reviewsData
          },
          timestamp: Date.now()
        });
      }
      
      return newCache;
    });
  }, []);

  const updateCachedLists = useCallback((userId: string, listsData: any[]) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      const existingEntry = newCache.get(userId);
      
      if (existingEntry) {
        newCache.set(userId, {
          ...existingEntry,
          data: {
            ...existingEntry.data,
            lists: listsData
          },
          timestamp: Date.now()
        });
      }
      
      return newCache;
    });
  }, []);

  const updateCachedRestaurants = useCallback((userId: string, restaurantsData: any[]) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      const existingEntry = newCache.get(userId);
      
      if (existingEntry) {
        newCache.set(userId, {
          ...existingEntry,
          data: {
            ...existingEntry.data,
            restaurants: restaurantsData
          },
          timestamp: Date.now()
        });
      }
      
      return newCache;
    });
  }, []);

  // Invalidate cache for a user
  const invalidateCache = useCallback((userId: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(userId);
      return newCache;
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }, [cache.size]);

  return {
    getCachedData,
    setCachedData,
    updateCachedProfile,
    updateCachedReviews,
    updateCachedLists,
    updateCachedRestaurants,
    invalidateCache,
    clearCache,
    getCacheStats
  };
};
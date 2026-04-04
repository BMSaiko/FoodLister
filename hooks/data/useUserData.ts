/**
 * useUserData - Consolidated hook for fetching user data
 * Replaces useUserData, useUserDataOptimized, and useUserDataV2
 * Supports caching, pagination, and selective data loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiClient } from '../auth/useApiClient';
import { toast } from 'react-toastify';
import { lockScroll, unlockScroll } from '@/utils/scrollLock';
import { useLocalStorage } from '../utilities/useLocalStorage';

// Types
export interface UserProfile {
  id: string;
  userIdCode: string;
  name: string;
  profileImage: string;
  location: string;
  bio: string;
  website: string;
  publicProfile: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalRestaurantsVisited: number;
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
  recentReviews?: any[];
  recentLists?: any[];
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE' | null;
  isOwnProfile: boolean;
}

export interface UserData {
  profile: UserProfile | null;
  reviews: any[];
  lists: any[];
  restaurants: any[];
  loading: boolean;
  loadingStates: {
    profile: boolean;
    reviews: boolean;
    lists: boolean;
    restaurants: boolean;
  };
  error: string | null;
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE' | null;
}

export interface UseUserDataOptions {
  userId: string;
  enableReviews?: boolean;
  enableLists?: boolean;
  enableRestaurants?: boolean;
  autoFetch?: boolean;
  cacheTTL?: number;
  useCursorPagination?: boolean;
}

// Cache key constants
const CACHE_KEYS = {
  PROFILE: 'user_profile_',
  REVIEWS: 'user_reviews_',
  LISTS: 'user_lists_',
  RESTAURANTS: 'user_restaurants_'
};

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

export function useUserData(options: UseUserDataOptions) {
  const {
    userId,
    enableReviews = true,
    enableLists = true,
    enableRestaurants = false,
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    useCursorPagination = true
  } = options;

  const [userData, setUserData] = useState<UserData>({
    profile: null,
    reviews: [],
    lists: [],
    restaurants: [],
    loading: false,
    loadingStates: {
      profile: false,
      reviews: false,
      lists: false,
      restaurants: false
    },
    error: null,
    accessLevel: null
  });

  const { get } = useApiClient();
  const { get: getCache, setWithTTL: setCache, remove: removeCache, removeByPrefix } = useLocalStorage();
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef<boolean>(true);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!userId) return null;

    const cacheKey = CACHE_KEYS.PROFILE + userId;
    
    // Check cache first
    const cached = getCache<UserProfile>(cacheKey);
    if (cached) {
      setUserData(prev => ({ ...prev, profile: cached, loading: false, error: null }));
      return cached;
    }

    // Check pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    const promise = (async () => {
      try {
        setUserData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await get(`/api/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setCache(cacheKey, data, cacheTTL);
          setUserData(prev => ({
            ...prev,
            profile: data,
            accessLevel: data.accessLevel,
            loading: false,
            error: null
          }));
          return data;
        } else {
          const errorMsg = data.error || 'Failed to fetch user profile';
          setUserData(prev => ({ ...prev, profile: null, loading: false, error: errorMsg }));
          return null;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Network error';
        setUserData(prev => ({ ...prev, error: errorMsg, loading: false }));
        return null;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, promise);
    return promise;
  }, [userId, get, cacheTTL, getCache, setCache]);

  // Fetch user reviews
  const fetchReviews = useCallback(async (page = 1, limit = 12) => {
    if (!userId || !enableReviews) return [];

    const cacheKey = `${CACHE_KEYS.REVIEWS}${userId}_page${page}`;
    const cached = getCache<any[]>(cacheKey);
    if (cached) {
      setUserData(prev => ({ ...prev, reviews: cached }));
      return cached;
    }

    try {
      const response = await get(`/api/users/${userId}/reviews?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (response.ok) {
        const reviews = data.data || [];
        setCache(cacheKey, reviews, cacheTTL);
        setUserData(prev => ({ ...prev, reviews }));
        return reviews;
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }, [userId, enableReviews, get, cacheTTL, getCache, setCache]);

  // Fetch user lists
  const fetchLists = useCallback(async (page = 1, limit = 12) => {
    if (!userId || !enableLists) return [];

    const cacheKey = `${CACHE_KEYS.LISTS}${userId}_page${page}`;
    const cached = getCache<any[]>(cacheKey);
    if (cached) {
      setUserData(prev => ({ ...prev, lists: cached }));
      return cached;
    }

    try {
      const response = await get(`/api/users/${userId}/lists?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (response.ok) {
        const lists = data.data || [];
        setCache(cacheKey, lists, cacheTTL);
        setUserData(prev => ({ ...prev, lists }));
        return lists;
      }
      return [];
    } catch (error) {
      console.error('Error fetching lists:', error);
      return [];
    }
  }, [userId, enableLists, get, cacheTTL, getCache, setCache]);

  // Fetch user restaurants
  const fetchRestaurants = useCallback(async (page = 1, limit = 12) => {
    if (!userId || !enableRestaurants) return [];

    const cacheKey = `${CACHE_KEYS.RESTAURANTS}${userId}_page${page}`;
    const cached = getCache<any[]>(cacheKey);
    if (cached) {
      setUserData(prev => ({ ...prev, restaurants: cached }));
      return cached;
    }

    try {
      setUserData(prev => ({ 
        ...prev, 
        loading: true, 
        loadingStates: { ...prev.loadingStates, restaurants: true } 
      }));

      const response = await get(`/api/users/${userId}/restaurants?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const restaurants = data.data.filter((r: any, i: number, arr: any[]) => 
          r?.id && arr.findIndex(x => x.id === r.id) === i
        );
        
        setCache(cacheKey, restaurants, cacheTTL);
        setUserData(prev => ({
          ...prev,
          restaurants,
          loading: false,
          loadingStates: { ...prev.loadingStates, restaurants: false }
        }));
        return restaurants;
      }
      
      setUserData(prev => ({
        ...prev,
        loading: false,
        loadingStates: { ...prev.loadingStates, restaurants: false }
      }));
      return [];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setUserData(prev => ({
        ...prev,
        loading: false,
        loadingStates: { ...prev.loadingStates, restaurants: false }
      }));
      return [];
    }
  }, [userId, enableRestaurants, get, cacheTTL, getCache, setCache]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }));

      await Promise.allSettled([
        fetchProfile(),
        enableReviews ? fetchReviews() : Promise.resolve(),
        enableLists ? fetchLists() : Promise.resolve(),
        enableRestaurants ? fetchRestaurants() : Promise.resolve()
      ]);

      setUserData(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error loading data',
        loading: false
      }));
    }
  }, [userId, fetchProfile, fetchReviews, fetchLists, fetchRestaurants, enableReviews, enableLists, enableRestaurants]);

  // Refresh all data (invalidate cache)
  const refreshData = useCallback(async () => {
    if (!userId) return;
    
    removeByPrefix(CACHE_KEYS.PROFILE + userId);
    removeByPrefix(CACHE_KEYS.REVIEWS + userId);
    removeByPrefix(CACHE_KEYS.LISTS + userId);
    removeByPrefix(CACHE_KEYS.RESTAURANTS + userId);
    
    await loadData();
    toast.success('Dados atualizados!', { position: "top-center", autoClose: 3000 });
  }, [userId, loadData, removeByPrefix]);

  // Load more restaurants with cursor pagination
  const loadMoreRestaurants = useCallback(async () => {
    if (!hasMoreRef.current || userData.loadingStates.restaurants) return;
    
    try {
      lockScroll();
      const allRestaurants: any[] = [];
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        attempts++;
        const url = cursorRef.current
          ? `/api/users/${userId}/restaurants?cursor=${cursorRef.current}&limit=24`
          : `/api/users/${userId}/restaurants?page=1&limit=24`;

        const response = await get(url);
        const data = await response.json();

        if (!response.ok || !data.data) break;

        allRestaurants.push(...data.data);
        cursorRef.current = data.nextCursor || null;
        hasMoreRef.current = !!data.nextCursor;

        setUserData(prev => ({ ...prev, restaurants: [...allRestaurants] }));
        
        if (!hasMoreRef.current) break;
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    } finally {
      unlockScroll();
    }
  }, [userId, get, userData.loadingStates.restaurants]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && userId) {
      loadData();
    }
  }, [autoFetch, userId, loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up pending requests for this user
      for (const key of pendingRequests.keys()) {
        if (key.includes(userId)) {
          pendingRequests.delete(key);
        }
      }
    };
  }, [userId]);

  // Alias for backward compatibility
  const fetchUserRestaurants = fetchRestaurants;

  return {
    ...userData,
    loadData,
    refreshData,
    loadMoreRestaurants,
    fetchRestaurants,
    fetchUserRestaurants,
    hasMoreRestaurants: hasMoreRef.current,
    canViewPrivateData: userData.accessLevel === 'OWNER' || userData.accessLevel === 'PRIVATE',
    isOwnProfile: userData.accessLevel === 'OWNER'
  };
}
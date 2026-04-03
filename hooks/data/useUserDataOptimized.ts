import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiClient } from '../auth/useApiClient';
import { toast } from 'react-toastify';
import { lockScroll, unlockScroll } from '@/utils/scrollLock';

interface UserData {
  profile: any;
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
}

interface UseUserDataOptions {
  userId: string;
  enableReviews?: boolean;
  enableLists?: boolean;
  enableRestaurants?: boolean;
  autoFetch?: boolean;
  cacheTTL?: number; // Custom TTL in milliseconds
  enableCursorPagination?: boolean; // Enable cursor-based pagination
}

// Request deduplication cache with TTL
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number; ttl: number }>();

// Performance optimization: debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache management utilities
const CACHE_KEYS = {
  PROFILE: 'user_profile_',
  REVIEWS: 'user_reviews_',
  LISTS: 'user_lists_',
  RESTAURANTS: 'user_restaurants_',
  RESTAURANTS_CURSOR: 'user_restaurants_cursor_'
};

const getCachedData = (key: string, userId: string) => {
  try {
    const cacheKey = `${key}${userId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < data.ttl) {
        return data.data;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Error reading cached data:', error);
  }
  return null;
};

const setCachedData = (key: string, userId: string, data: any, ttl: number) => {
  try {
    const cacheKey = `${key}${userId}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
      ttl
    }));
  } catch (error) {
    console.warn('Could not cache data:', error);
  }
};

const invalidateCache = (userId: string) => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(`${key}${userId}`);
    });
  } catch (error) {
    console.warn('Error invalidating cache:', error);
  }
};

export const useUserDataOptimized = (options: UseUserDataOptions) => {
  const {
    userId,
    enableReviews = true,
    enableLists = true,
    enableRestaurants = true,
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enableCursorPagination = true
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
    error: null
  });

  const { get } = useApiClient();
  const restaurantsCursorRef = useRef<string | null>(null);
  const hasMoreRestaurantsRef = useRef<boolean>(true);

  // Enhanced fetch user profile with better error handling
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;

    const cacheKey = `profile_${userId}`;
    const cacheTTLKey = `profile_ttl_${userId}`;
    
    // Check if request is already in progress
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest && Date.now() - cachedRequest.timestamp < cachedRequest.ttl) {
      return cachedRequest.promise;
    }

    const requestPromise = (async () => {
      try {
        setUserData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await get(`/api/users/${userId}`);
        const profileData = await response.json();

        if (response.ok) {
          setUserData(prev => ({
            ...prev,
            profile: profileData,
            loading: false,
            error: null
          }));

          // Cache the data
          setCachedData(CACHE_KEYS.PROFILE, userId, profileData, cacheTTL);

          return profileData;
        } else {
          let errorMessage = 'Failed to fetch user profile';
          if (response.status === 404) {
            errorMessage = 'User not found or profile is private';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          setUserData(prev => ({
            ...prev,
            profile: null,
            loading: false,
            error: errorMessage
          }));

          if (response.status === 404) {
            return null;
          }
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
        setUserData(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
        throw error;
      }
    })();

    // Cache the request with TTL
    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      ttl: 30000 // 30 seconds request cache TTL
    });

    return requestPromise;
  }, [userId, get, cacheTTL]);

  // Enhanced fetch user reviews with deduplication
  const fetchUserReviews = useCallback(async () => {
    if (!userId || !enableReviews) return;

    const cacheKey = `reviews_${userId}`;
    
    // Check if request is already in progress
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest && Date.now() - cachedRequest.timestamp < cachedRequest.ttl) {
      return cachedRequest.promise;
    }

    const requestPromise = (async () => {
      try {
        const response = await get(`/api/users/${userId}/reviews?page=1&limit=12`);
        const reviewsData = await response.json();

        if (response.ok) {
          setUserData(prev => ({
            ...prev,
            reviews: reviewsData.data || []
          }));

          // Cache the data
          setCachedData(CACHE_KEYS.REVIEWS, userId, reviewsData.data || [], cacheTTL);

          return reviewsData.data || [];
        } else {
          throw new Error(reviewsData.error || 'Failed to fetch user reviews');
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }
    })();

    // Cache the request with TTL
    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      ttl: 30000 // 30 seconds request cache TTL
    });

    return requestPromise;
  }, [userId, get, enableReviews, cacheTTL]);

  // Enhanced fetch user lists with deduplication
  const fetchUserLists = useCallback(async () => {
    if (!userId || !enableLists) return;

    const cacheKey = `lists_${userId}`;
    
    // Check if request is already in progress
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest && Date.now() - cachedRequest.timestamp < cachedRequest.ttl) {
      return cachedRequest.promise;
    }

    const requestPromise = (async () => {
      try {
        const response = await get(`/api/users/${userId}/lists?page=1&limit=12`);
        const listsData = await response.json();

        if (response.ok) {
          setUserData(prev => ({
            ...prev,
            lists: listsData.data || []
          }));

          // Cache the data
          setCachedData(CACHE_KEYS.LISTS, userId, listsData.data || [], cacheTTL);

          return listsData.data || [];
        } else {
          throw new Error(listsData.error || 'Failed to fetch user lists');
        }
      } catch (error) {
        console.error('Error fetching user lists:', error);
        throw error;
      }
    })();

    // Cache the request with TTL
    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      ttl: 30000 // 30 seconds request cache TTL
    });

    return requestPromise;
  }, [userId, get, enableLists, cacheTTL]);

  // Enhanced fetch user restaurants with cursor pagination support
  const fetchUserRestaurants = useCallback(async (useCursor = false) => {
    if (!userId) return;

    const cacheKey = useCursor 
      ? `restaurants_cursor_${userId}_${restaurantsCursorRef.current}`
      : `restaurants_${userId}`;
    
    // Check if request is already in progress
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest && Date.now() - cachedRequest.timestamp < cachedRequest.ttl) {
      return cachedRequest.promise;
    }

    const requestPromise = (async () => {
      try {
        setUserData(prev => ({ ...prev, loading: true, loadingStates: { ...prev.loadingStates, restaurants: true } }));
        
        // Build URL with cursor pagination if enabled
        let url = `/api/users/${userId}/restaurants?page=1&limit=12`;
        if (useCursor && restaurantsCursorRef.current) {
          url = `/api/users/${userId}/restaurants?cursor=${restaurantsCursorRef.current}&limit=12`;
        }

        const response = await get(url);
        const restaurantsData = await response.json();

        if (response.ok && restaurantsData.data && Array.isArray(restaurantsData.data)) {
          // Filter out any duplicate restaurants by ID to prevent React key conflicts
          const uniqueRestaurants = restaurantsData.data.filter((restaurant: any, index: number, arr: any[]) => {
            if (!restaurant || !restaurant.id) {
              console.warn('Skipping restaurant without valid ID:', restaurant);
              return false;
            }
            
            const firstIndex = arr.findIndex(r => r.id === restaurant.id);
            return index === firstIndex;
          });

          setUserData(prev => ({
            ...prev,
            restaurants: useCursor 
              ? [...prev.restaurants, ...uniqueRestaurants]
              : uniqueRestaurants,
            loading: false,
            loadingStates: { ...prev.loadingStates, restaurants: false }
          }));

          // Update cursor and pagination state
          if (restaurantsData.nextCursor) {
            restaurantsCursorRef.current = restaurantsData.nextCursor;
            hasMoreRestaurantsRef.current = true;
          } else {
            hasMoreRestaurantsRef.current = false;
            restaurantsCursorRef.current = null;
          }

          // Cache the data
          const cacheKey = useCursor ? CACHE_KEYS.RESTAURANTS_CURSOR : CACHE_KEYS.RESTAURANTS;
          setCachedData(cacheKey, userId, uniqueRestaurants, cacheTTL);

          return uniqueRestaurants;
        } else {
          throw new Error(restaurantsData.error || 'Failed to fetch user restaurants');
        }
      } catch (error) {
        console.error('Error fetching user restaurants:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error fetching user restaurants';
        setUserData(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          loadingStates: { ...prev.loadingStates, restaurants: false }
        }));
        throw error;
      }
    })();

    // Cache the request with TTL
    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      ttl: 30000 // 30 seconds request cache TTL
    });

    return requestPromise;
  }, [userId, get, cacheTTL]);

  // Load more restaurants with cursor pagination
  const loadMoreRestaurants = useCallback(async () => {
    if (!hasMoreRestaurantsRef.current || userData.loadingStates.restaurants) {
      return;
    }

    try {
      await fetchUserRestaurants(true);
    } catch (error) {
      console.error('Error loading more restaurants:', error);
      toast.error('Erro ao carregar mais restaurantes');
    }
  }, [fetchUserRestaurants, userData.loadingStates.restaurants]);

  // Enhanced load data function with smart caching
  const debouncedLoadData = useCallback(
    debounce(async () => {
      if (!userId) return;

      try {
        // Check cache first for all data types
        const cachedProfile = getCachedData(CACHE_KEYS.PROFILE, userId);
        const cachedReviews = getCachedData(CACHE_KEYS.REVIEWS, userId);
        const cachedLists = getCachedData(CACHE_KEYS.LISTS, userId);
        const cachedRestaurants = getCachedData(CACHE_KEYS.RESTAURANTS, userId);
        
        if (cachedProfile) {
          // Use cached data but set loading to true for background refresh
          setUserData(prev => ({
            ...prev,
            profile: cachedProfile,
            reviews: cachedReviews || [],
            lists: cachedLists || [],
            restaurants: cachedRestaurants || [],
            loading: true,
            error: null
          }));

          // Background refresh with error handling
          try {
            await Promise.allSettled([
              fetchUserProfile(),
              enableReviews ? fetchUserReviews().catch(error => {
                console.warn('Failed to refresh reviews:', error);
                return [];
              }) : Promise.resolve(),
              enableLists ? fetchUserLists().catch(error => {
                console.warn('Failed to refresh lists:', error);
                return [];
              }) : Promise.resolve(),
              enableRestaurants ? fetchUserRestaurants().catch(error => {
                console.warn('Failed to refresh restaurants:', error);
                return [];
              }) : Promise.resolve()
            ]);
            
            setUserData(prev => ({ ...prev, loading: false }));
          } catch (refreshError) {
            console.warn('Background refresh failed:', refreshError);
            setUserData(prev => ({ ...prev, loading: false }));
          }
        } else {
          // No cache, fetch all data
          setUserData(prev => ({ ...prev, loading: true, error: null }));
          
          try {
            await Promise.allSettled([
              fetchUserProfile(),
              enableReviews ? fetchUserReviews() : Promise.resolve(),
              enableLists ? fetchUserLists() : Promise.resolve(),
              enableRestaurants ? fetchUserRestaurants() : Promise.resolve()
            ]);
            setUserData(prev => ({ ...prev, loading: false }));
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            const errorMessage = fetchError instanceof Error ? fetchError.message : 'Error fetching user data';
            setUserData(prev => ({
              ...prev,
              error: errorMessage,
              loading: false
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error loading user data';
        setUserData(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      }
    }, 300), // 300ms debounce
    [
      userId,
      enableReviews,
      enableLists,
      enableRestaurants,
      cacheTTL,
      fetchUserProfile,
      fetchUserReviews,
      fetchUserLists,
      fetchUserRestaurants
    ]
  );

  // Load data with smart caching
  const loadData = useCallback(async () => {
    if (!userId) return;
    await debouncedLoadData();
  }, [debouncedLoadData]);

  // Refresh all data (invalidate cache and refetch)
  const refreshData = useCallback(async () => {
    if (!userId) return;

    try {
      invalidateCache(userId);
      restaurantsCursorRef.current = null;
      hasMoreRestaurantsRef.current = true;
      await loadData();
      toast.success('Dados do usuário atualizados!');
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Erro ao atualizar dados do usuário');
    }
  }, [userId, loadData]);

  // Enhanced restaurant loading that supports both cursor and page-based pagination
  const loadAllRestaurants = useCallback(async () => {
    if (!userId) return;

    const cacheKey = `all_restaurants_${userId}`;
    
    // Check if request is already in progress
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest && Date.now() - cachedRequest.timestamp < cachedRequest.ttl) {
      return cachedRequest.promise;
    }

    const requestPromise = (async () => {
      try {
        lockScroll();
        setUserData(prev => ({ 
          ...prev, 
          loading: true,
          loadingStates: { ...prev.loadingStates, restaurants: true }
        }));

        // Use cursor-based pagination for better performance
        let allRestaurants: any[] = [];
        let cursor: string | null = null;
        let hasMore = true;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        while (hasMore && attempts < maxAttempts) {
          attempts++;
          
          const url = cursor 
            ? `/api/users/${userId}/restaurants?cursor=${cursor}&limit=24`
            : `/api/users/${userId}/restaurants?page=1&limit=24`;

          const response = await get(url);
          const data = await response.json();

          if (!response.ok || !data.data || !Array.isArray(data.data)) {
            throw new Error(data.error || 'Failed to fetch user restaurants');
          }

          allRestaurants = [...allRestaurants, ...data.data];
          cursor = data.nextCursor;
          hasMore = !!cursor;

          // Update UI with current progress
          setUserData(prev => ({
            ...prev,
            restaurants: allRestaurants
          }));
        }

        // Remove duplicates by ID
        const uniqueRestaurants = allRestaurants.filter((restaurant: any, index: number, arr: any[]) => {
          if (!restaurant || !restaurant.id) {
            console.warn('Skipping restaurant without valid ID:', restaurant);
            return false;
          }
          
          const firstIndex = arr.findIndex(r => r.id === restaurant.id);
          return index === firstIndex;
        });

        setUserData(prev => ({
          ...prev,
          restaurants: uniqueRestaurants,
          loading: false,
          loadingStates: { ...prev.loadingStates, restaurants: false }
        }));

        // Cache all restaurants data
        setCachedData(CACHE_KEYS.RESTAURANTS, userId, uniqueRestaurants, cacheTTL);

        return uniqueRestaurants;
      } catch (error) {
        console.error('Error loading all restaurants:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error loading all restaurants';
        setUserData(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          loadingStates: { ...prev.loadingStates, restaurants: false }
        }));
        throw error;
      } finally {
        unlockScroll();
      }
    })();

    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      ttl: 60000 // 1 minute request cache TTL for expensive operations
    });

    return requestPromise;
  }, [userId, get, cacheTTL]);

  // Initialize data loading
  useEffect(() => {
    if (autoFetch && userId) {
      loadData();
    }
  }, [autoFetch, userId, loadData]);

  // Cleanup function to clear request cache when userId changes
  useEffect(() => {
    return () => {
      // Clear request cache for this user when component unmounts or userId changes
      const keysToDelete = Array.from(requestCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => requestCache.delete(key));
    };
  }, [userId]);

  return {
    ...userData,
    // Data fetching methods
    loadData,
    refreshData,
    fetchUserRestaurants,
    loadMoreRestaurants,
    loadAllRestaurants,
    hasMoreRestaurants: hasMoreRestaurantsRef.current,
    restaurantsCursor: restaurantsCursorRef.current,
    
    // Cache management
    invalidateCache: () => invalidateCache(userId),
    clearCache: () => invalidateCache(userId),
    
    // Utility methods
    hasCachedData: !!getCachedData(CACHE_KEYS.PROFILE, userId),
    isUsingCursorPagination: enableCursorPagination
  };
};
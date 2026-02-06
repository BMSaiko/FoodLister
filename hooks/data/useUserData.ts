import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../auth/useApiClient';
import { toast } from 'react-toastify';

interface UserData {
  profile: any;
  reviews: any[];
  lists: any[];
  restaurants: any[];
  loading: boolean;
  error: string | null;
}

interface UseUserDataOptions {
  userId: string;
  enableReviews?: boolean;
  enableLists?: boolean;
  enableRestaurants?: boolean;
  autoFetch?: boolean;
  cacheTTL?: number; // Custom TTL in milliseconds
}

export const useUserData = (options: UseUserDataOptions) => {
  const {
    userId,
    enableReviews = true,
    enableLists = true,
    enableRestaurants = false, // Only fetch when needed
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [userData, setUserData] = useState<UserData>({
    profile: null,
    reviews: [],
    lists: [],
    restaurants: [],
    loading: false,
    error: null
  });

  const { get } = useApiClient();

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;

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

      // Simple caching - just store in localStorage for now
      try {
        const cacheKey = `user_profile_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data: profileData,
          timestamp: Date.now(),
          ttl: cacheTTL
        }));
      } catch (error) {
        console.warn('Could not cache profile data:', error);
      }

        return profileData;
      } else {
        // Handle different error types
        let errorType = 'unknown';
        let errorMessage = 'Failed to fetch user profile';
        
        if (response.status === 404) {
          errorType = 'not_found';
          errorMessage = 'User not found or profile is private';
        } else if (response.status === 401 || response.status === 403) {
          errorType = 'unauthorized';
          errorMessage = 'Access denied. Please check your authentication.';
        } else if (response.status >= 500) {
          errorType = 'server_error';
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status >= 400) {
          errorType = 'client_error';
          errorMessage = profileData.error || 'Invalid request';
        }
        
        setUserData(prev => ({
          ...prev,
          profile: null,
          loading: false,
          error: errorMessage
        }));

        // Don't throw an error for 404, let the component handle it gracefully
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
  }, [userId, get, cacheTTL]);

  // Fetch user reviews
  const fetchUserReviews = useCallback(async () => {
    if (!userId || !enableReviews) return;

    try {
      const response = await get(`/api/users/${userId}/reviews?page=1&limit=12`);
      const reviewsData = await response.json();

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          reviews: reviewsData.data || []
        }));

      // Simple caching for reviews
      try {
        const cacheKey = `user_reviews_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data: reviewsData.data || [],
          timestamp: Date.now(),
          ttl: cacheTTL
        }));
      } catch (error) {
        console.warn('Could not cache reviews data:', error);
      }

        return reviewsData.data || [];
      } else {
        throw new Error(reviewsData.error || 'Failed to fetch user reviews');
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }, [userId, get, enableReviews, cacheTTL]);

  // Fetch user lists
  const fetchUserLists = useCallback(async () => {
    if (!userId || !enableLists) return;

    try {
      const response = await get(`/api/users/${userId}/lists?page=1&limit=12`);
      const listsData = await response.json();

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          lists: listsData.data || []
        }));

      // Simple caching for lists
      try {
        const cacheKey = `user_lists_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data: listsData.data || [],
          timestamp: Date.now(),
          ttl: cacheTTL
        }));
      } catch (error) {
        console.warn('Could not cache lists data:', error);
      }

        return listsData.data || [];
      } else {
        throw new Error(listsData.error || 'Failed to fetch user lists');
      }
    } catch (error) {
      console.error('Error fetching user lists:', error);
      throw error;
    }
  }, [userId, get, enableLists, cacheTTL]);

  // Fetch user restaurants
  const fetchUserRestaurants = useCallback(async () => {
    if (!userId || !enableRestaurants) return;

    try {
      setUserData(prev => ({ ...prev, loading: true }));
      
      const response = await get(`/api/users/${userId}/restaurants?page=1&limit=12`);
      const restaurantsData = await response.json();

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          restaurants: restaurantsData.data || [],
          loading: false
        }));

      // Simple caching for restaurants
      try {
        const cacheKey = `user_restaurants_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data: restaurantsData.data || [],
          timestamp: Date.now(),
          ttl: cacheTTL
        }));
      } catch (error) {
        console.warn('Could not cache restaurants data:', error);
      }

        return restaurantsData.data || [];
      } else {
        throw new Error(restaurantsData.error || 'Failed to fetch user restaurants');
      }
    } catch (error) {
      console.error('Error fetching user restaurants:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching user restaurants';
      setUserData(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      throw error;
    }
  }, [userId, get, enableRestaurants, cacheTTL]);

  // Load data with simple caching
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      
      // Check cache first
      const cachedProfile = getCachedProfile(userId);
      const cachedReviews = getCachedReviews(userId);
      const cachedLists = getCachedLists(userId);
      
      if (cachedProfile) {
        // Use cached data but set loading to true for background refresh
        setUserData(prev => ({
          ...prev,
          profile: cachedProfile,
          reviews: cachedReviews || [],
          lists: cachedLists || [],
          loading: true, // Keep loading true for background refresh
          error: null
        }));

        // Background refresh
        try {
          
          await Promise.all([
            fetchUserProfile().catch(error => {
              return null;
            }),
            enableReviews ? fetchUserReviews().catch(error => {
              return [];
            }) : Promise.resolve(),
            enableLists ? fetchUserLists().catch(error => {
              return [];
            }) : Promise.resolve()
          ]);
          
          setUserData(prev => ({ ...prev, loading: false }));
          
        } catch (refreshError) {
          setUserData(prev => ({ ...prev, loading: false }));
        }
      } else {
        // No cache, fetch all data
        setUserData(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          await Promise.all([
            fetchUserProfile(),
            enableReviews ? fetchUserReviews() : Promise.resolve(),
            enableLists ? fetchUserLists() : Promise.resolve()
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
  }, [
    userId,
    enableReviews,
    enableLists,
    cacheTTL,
    fetchUserProfile,
    fetchUserReviews,
    fetchUserLists
  ]);

  // Refresh all data (invalidate cache and refetch)
  const refreshData = useCallback(async () => {
    if (!userId) return;

    try {
      invalidateCache(userId);
      await loadData();
      toast.success('Dados do usuário atualizados!');
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Erro ao atualizar dados do usuário');
    }
  }, [userId, loadData]);

  // Refresh specific data type
  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      await fetchUserProfile();
      toast.success('Perfil atualizado!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  }, [userId, fetchUserProfile]);

  const refreshReviews = useCallback(async () => {
    if (!userId || !enableReviews) return;
    
    try {
      await fetchUserReviews();
      toast.success('Avaliações atualizadas!');
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      toast.error('Erro ao atualizar avaliações');
    }
  }, [userId, enableReviews, fetchUserReviews]);

  const refreshLists = useCallback(async () => {
    if (!userId || !enableLists) return;
    
    try {
      await fetchUserLists();
      toast.success('Listas atualizadas!');
    } catch (error) {
      console.error('Error refreshing lists:', error);
      toast.error('Erro ao atualizar listas');
    }
  }, [userId, enableLists, fetchUserLists]);

  const refreshRestaurants = useCallback(async () => {
    if (!userId || !enableRestaurants) return;
    
    try {
      await fetchUserRestaurants();
      toast.success('Restaurantes atualizados!');
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
      toast.error('Erro ao atualizar restaurantes');
    }
  }, [userId, enableRestaurants, fetchUserRestaurants]);

  // Initialize data loading
  useEffect(() => {
    if (autoFetch && userId) {
      loadData();
    }
  }, [autoFetch, userId, loadData]);

  // Debug: Track hook calls
  useEffect(() => {
  }, [userId, autoFetch]);

  // Cache helper functions
  const invalidateCache = (userId: string) => {
    try {
      localStorage.removeItem(`user_profile_${userId}`);
      localStorage.removeItem(`user_reviews_${userId}`);
      localStorage.removeItem(`user_lists_${userId}`);
      localStorage.removeItem(`user_restaurants_${userId}`);
    } catch (error) {
      console.warn('Error invalidating cache:', error);
    }
  };

  const getCachedProfile = (userId: string) => {
    try {
      const cacheKey = `user_profile_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < data.ttl) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn('Error reading cached profile:', error);
    }
    return null;
  };

  const getCachedReviews = (userId: string) => {
    try {
      const cacheKey = `user_reviews_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < data.ttl) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn('Error reading cached reviews:', error);
    }
    return null;
  };

  const getCachedLists = (userId: string) => {
    try {
      const cacheKey = `user_lists_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < data.ttl) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn('Error reading cached lists:', error);
    }
    return null;
  };

  return {
    ...userData,
    // Data fetching methods
    loadData,
    refreshData,
    refreshProfile,
    refreshReviews,
    refreshLists,
    refreshRestaurants,
    fetchUserRestaurants,
    
    // Cache management
    invalidateCache: () => invalidateCache(userId),
    
    // Utility methods
    hasCachedData: !!getCachedProfile(userId)
  };
};
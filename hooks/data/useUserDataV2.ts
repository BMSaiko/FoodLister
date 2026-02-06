import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../auth/useApiClient';
import { toast } from 'react-toastify';

// Tipos para melhor integração
interface UserProfileResponse {
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
  stats: {
    totalRestaurantsVisited: number;
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
  recentReviews: any[];
  recentLists: any[];
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE' | null;
  isOwnProfile: boolean;
}

interface ReviewsResponse {
  data: any[];
  total: number;
  hasMore: boolean;
}

interface ListsResponse {
  data: any[];
  total: number;
  hasMore: boolean;
}

interface RestaurantsResponse {
  data: any[];
  total: number;
  hasMore: boolean;
}

interface UserData {
  profile: any;
  reviews: any[];
  lists: any[];
  restaurants: any[];
  loading: boolean;
  error: string | null;
  accessLevel: 'OWNER' | 'PUBLIC' | 'PRIVATE' | null;
}

interface UseUserDataOptions {
  userId: string;
  enableReviews?: boolean;
  enableLists?: boolean;
  enableRestaurants?: boolean;
  autoFetch?: boolean;
  cacheTTL?: number;
}

export const useUserDataV2 = (options: UseUserDataOptions) => {
  const {
    userId,
    enableReviews = true,
    enableLists = true,
    enableRestaurants = false,
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [userData, setUserData] = useState<UserData>({
    profile: null,
    reviews: [],
    lists: [],
    restaurants: [],
    loading: false,
    error: null,
    accessLevel: null
  });

  const { get } = useApiClient();

  // Verificar nível de acesso
  const checkAccess = useCallback(async () => {
    if (!userId) return;

    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await get(`/api/users/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          profile: data,
          accessLevel: data.accessLevel,
          loading: false,
          error: null
        }));
        
        // Buscar dados adicionais baseados no nível de acesso
        await loadDataForAccessLevel(data.accessLevel);
      } else {
        setUserData(prev => ({
          ...prev,
          error: data.error || 'Failed to fetch user data',
          loading: false,
          accessLevel: null
        }));
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setUserData(prev => ({
        ...prev,
        error: 'Network error or server unavailable',
        loading: false,
        accessLevel: null
      }));
    }
  }, [userId, get]);

  // Buscar dados baseados no nível de acesso
  const loadDataForAccessLevel = useCallback(async (accessLevel: string) => {
    if (!userId || !accessLevel) return;

    try {
      const requests = [];

      // Sempre buscar perfil (já temos)
      // Buscar avaliações se habilitado
      if (enableReviews) {
        requests.push(
          get(`/api/users/${userId}/reviews?page=1&limit=12`)
            .then(res => res.json())
            .then(data => ({ type: 'reviews', data: data.data || [] }))
        );
      }

      // Buscar listas se habilitado
      if (enableLists) {
        requests.push(
          get(`/api/users/${userId}/lists?page=1&limit=12`)
            .then(res => res.json())
            .then(data => ({ type: 'lists', data: data.data || [] }))
        );
      }

      // Buscar restaurantes se habilitado
      if (enableRestaurants) {
        requests.push(
          get(`/api/users/${userId}/restaurants?page=1&limit=12`)
            .then(res => res.json())
            .then(data => ({ type: 'restaurants', data: data.data || [] }))
        );
      }

      if (requests.length > 0) {
        const results = await Promise.all(requests);
        
        const updates: any = {};
        results.forEach(result => {
          updates[result.type] = result.data;
        });

        setUserData(prev => ({
          ...prev,
          ...updates,
          loading: false
        }));
      } else {
        setUserData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading data for access level:', error);
      setUserData(prev => ({
        ...prev,
        error: 'Failed to load user data',
        loading: false
      }));
    }
  }, [userId, get, enableReviews, enableLists, enableRestaurants]);

  // Atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      await checkAccess();
      toast.success('Perfil atualizado!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  }, [userId, checkAccess]);

  // Atualizar avaliações
  const refreshReviews = useCallback(async () => {
    if (!userId || !enableReviews) return;
    
    try {
      const response = await get(`/api/users/${userId}/reviews?page=1&limit=12`);
      const data = await response.json();
      
      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          reviews: data.data || []
        }));
        toast.success('Avaliações atualizadas!');
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      toast.error('Erro ao atualizar avaliações');
    }
  }, [userId, get, enableReviews]);

  // Atualizar listas
  const refreshLists = useCallback(async () => {
    if (!userId || !enableLists) return;
    
    try {
      const response = await get(`/api/users/${userId}/lists?page=1&limit=12`);
      const data = await response.json();
      
      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          lists: data.data || []
        }));
        toast.success('Listas atualizadas!');
      }
    } catch (error) {
      console.error('Error refreshing lists:', error);
      toast.error('Erro ao atualizar listas');
    }
  }, [userId, get, enableLists]);

  // Atualizar restaurantes
  const refreshRestaurants = useCallback(async () => {
    if (!userId || !enableRestaurants) return;
    
    try {
      const response = await get(`/api/users/${userId}/restaurants?page=1&limit=12`);
      const data = await response.json();
      
      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          restaurants: data.data || []
        }));
        toast.success('Restaurantes atualizados!');
      }
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
      toast.error('Erro ao atualizar restaurantes');
    }
  }, [userId, get, enableRestaurants]);

  // Inicializar dados
  useEffect(() => {
    if (autoFetch && userId) {
      checkAccess();
    }
  }, [autoFetch, userId, checkAccess]);

  // Debug: Track hook calls
  useEffect(() => {
  }, [userId, autoFetch]);

  return {
    ...userData,
    // Data fetching methods
    refreshProfile,
    refreshReviews,
    refreshLists,
    refreshRestaurants,
    
    // Utility methods
    canViewPrivateData: userData.accessLevel === 'OWNER' || userData.accessLevel === 'PRIVATE',
    isOwnProfile: userData.accessLevel === 'OWNER',
    isPublicProfile: userData.accessLevel === 'PUBLIC'
  };
};
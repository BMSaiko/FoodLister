import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Utensils, Clock, MapPin, Euro, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';
import { 
  ProfileCard, 
  RatingBadge, 
  PriceLevelBadge, 
  LocationBadge, 
  CuisineBadge, 
  DateBadge,
  TouchButton,
  SkeletonLoader,
  EmptyState 
} from '../shared';
import RestaurantCard from './RestaurantCard';
import { useUserCache } from '@/hooks/data/useUserCache';

interface UserRestaurantsSectionProps {
  userId: string;
  initialRestaurants: Array<{
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    location?: string;
    priceLevel?: number;
    rating?: number;
    createdAt: string;
    cuisineTypes: string[];
    dietaryOptions: string[];
    features: string[];
  }>;
  initialTotal: number;
  isOwnProfile: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const UserRestaurantsSection: React.FC<UserRestaurantsSectionProps> = ({
  userId,
  initialRestaurants,
  initialTotal,
  isOwnProfile,
  isLoading: hookIsLoading,
  error: hookError
}) => {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialRestaurants.length < initialTotal);
  const [hasInitialized, setHasInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with initialRestaurants when component mounts or props change
  useEffect(() => {
    if (!hasInitialized && initialRestaurants.length > 0) {
      setRestaurants(initialRestaurants);
      setTotal(initialTotal);
      setHasMore(initialRestaurants.length < initialTotal);
      setHasInitialized(true);
      console.log('UserRestaurantsSection - Initialized with initial data:', {
        restaurants: initialRestaurants.length,
        total: initialTotal,
        hasMore: initialRestaurants.length < initialTotal
      });
    } else if (hasInitialized && initialRestaurants.length > 0) {
      // Update if initialRestaurants changes (e.g., from parent re-render)
      setRestaurants(initialRestaurants);
      setTotal(initialTotal);
      setHasMore(initialRestaurants.length < initialTotal);
      console.log('UserRestaurantsSection - Updated with new initial data:', {
        restaurants: initialRestaurants.length,
        total: initialTotal
      });
    }
  }, [initialRestaurants, initialTotal, hasInitialized]);

  // Sync state with hook data when hook loading completes and we have data
  useEffect(() => {
    if (hookIsLoading === false && initialRestaurants.length > 0 && !hasInitialized) {
      setRestaurants(initialRestaurants);
      setTotal(initialTotal);
      setHasMore(initialRestaurants.length < initialTotal);
      setHasInitialized(true);
      console.log('UserRestaurantsSection - Synced with hook data after loading:', {
        restaurants: initialRestaurants.length,
        total: initialTotal
      });
    }
  }, [hookIsLoading, initialRestaurants, initialTotal, hasInitialized]);

  // Debug logging to track data flow
  useEffect(() => {
    console.log('UserRestaurantsSection - Props received:', {
      userId,
      initialRestaurants: initialRestaurants.length,
      initialTotal,
      hookIsLoading,
      hookError
    });
  }, [userId, initialRestaurants, initialTotal, hookIsLoading, hookError]);

  useEffect(() => {
    console.log('UserRestaurantsSection - State updated:', {
      restaurants: restaurants.length,
      total,
      hasMore,
      hasInitialized
    });
  }, [restaurants, total, hasMore, hasInitialized]);

  const { get } = useSecureApiClient();

  // Scroll to specific restaurant after navigation from edit
  const scrollToRestaurant = useCallback((restaurantId: string) => {
    if (!containerRef.current) return;

    // Wait for DOM to be ready and then scroll
    setTimeout(() => {
      const restaurantElement = containerRef.current?.querySelector(`[data-restaurant-id="${restaurantId}"]`);
      if (restaurantElement) {
        restaurantElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }, []);

  // Check for restaurantId in URL parameters and scroll to it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurantId');
    const tab = urlParams.get('tab');

    // Only scroll if we're on the restaurants tab and have a restaurantId
    if (tab === 'restaurants' && restaurantId) {
      scrollToRestaurant(restaurantId);
    }
  }, [scrollToRestaurant]);

  const loadMoreRestaurants = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await get(`/api/users/${userId}/restaurants?page=${page + 1}&limit=12`);
      const data = await response.json();

      if (response.ok) {
        // Filter out any duplicate restaurants by ID to prevent React key conflicts
        const newRestaurants = data.data.filter((newRestaurant: any) => 
          !restaurants.some(existingRestaurant => existingRestaurant.id === newRestaurant.id)
        );
        
        setRestaurants(prev => [...prev, ...newRestaurants]);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Show loading state only when no data is available and still loading
  if (hookIsLoading && restaurants.length === 0 && initialRestaurants.length === 0 && !hasInitialized) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show restaurants if they exist, regardless of loading state
  // This ensures that even if loading is still true but data is available, it will be displayed
  if (restaurants.length > 0 || (initialRestaurants.length > 0 && hasInitialized)) {
    return (
      <div className="space-y-6" ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isOwnRestaurant={isOwnProfile}
              onEdit={() => {
                // Navigate to edit page with back navigation parameters
                const currentUserId = window.location.pathname.split('/')[2];
                const editUrl = `/restaurants/${restaurant.id}/edit?source=profile&userId=${currentUserId}&tab=restaurants`;
                window.location.href = editUrl;
              }}
              onDelete={() => {
                // Handle delete functionality
                console.log('Delete restaurant:', restaurant.id);
              }}
              onShare={() => {
                // Handle share functionality
                console.log('Share restaurant:', restaurant.id);
              }}
              dataRestaurantId={restaurant.id}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-6">
            <TouchButton
              onClick={loadMoreRestaurants}
              loading={isLoadingMore}
              variant="primary"
              size="md"
              disabled={isLoadingMore}
              icon={isLoadingMore ? undefined : <Utensils className="h-4 w-4" />}
              fullWidth={false}
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais restaurantes'}
            </TouchButton>
          </div>
        )}

        {/* Total Count - Always show if we have a total count */}
        {total > 0 && (
          <div className="text-center text-gray-500 text-sm ios-safe-padding-top">
            Mostrando {restaurants.length} de {total} restaurantes
          </div>
        )}
      </div>
    );
  }

  // Show empty state if no restaurants and not loading or initialized
  if (restaurants.length === 0 && !hookIsLoading && !hasInitialized) {
    return (
      <EmptyState
        icon={<Utensils className="h-8 w-8 text-gray-400" />}
        title="Nenhum restaurante encontrado"
        description={isOwnProfile 
          ? 'Você ainda não adicionou nenhum restaurante. Comece a explorar e adicionar seus restaurantes favoritos!'
          : 'Este usuário ainda não adicionou nenhum restaurante.'
        }
        action={isOwnProfile ? {
          label: 'Explorar restaurantes',
          onClick: () => window.location.href = '/restaurants',
          icon: <Utensils className="h-4 w-4" />
        } : undefined}
      />
    );
  }

  if (hookError) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar restaurantes</h3>
        <p className="text-gray-600 mb-4">{hookError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }
};

export default UserRestaurantsSection;

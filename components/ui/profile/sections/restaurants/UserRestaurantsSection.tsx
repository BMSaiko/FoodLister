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
import RestaurantSkeletonLoader from './RestaurantSkeletonLoader';
import { useUserCache } from '@/hooks/data/useUserCache';
import { useScrollLock } from '@/utils/scrollLock';

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
  loadingStates?: {
    profile: boolean;
    reviews: boolean;
    lists: boolean;
    restaurants: boolean;
  };
  error?: string | null;
}

const UserRestaurantsSection: React.FC<UserRestaurantsSectionProps> = ({
  userId,
  initialRestaurants,
  initialTotal,
  isOwnProfile,
  isLoading: hookIsLoading,
  loadingStates,
  error: hookError
}) => {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialRestaurants.length < initialTotal);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFetchedRestaurants = useRef(false);

  // Scroll lock: prevent scrolling while loading all restaurants
  useScrollLock(isLoadingAll);

  // Initialize with initialRestaurants when component mounts or props change
  useEffect(() => {
    if (!hasInitialized && initialRestaurants.length > 0) {
      setRestaurants(initialRestaurants);
      setTotal(initialTotal);
      setHasMore(initialRestaurants.length < initialTotal);
      setHasInitialized(true);
      hasFetchedRestaurants.current = true;
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

  // Auto-load all restaurants when component mounts and no data is available
  useEffect(() => {
    // Check if we're on the restaurants tab and need to load data
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const isRestaurantsTab = tab === 'restaurants';
    
    if (isRestaurantsTab && !hasInitialized && restaurants.length === 0 && !hookIsLoading) {
      console.log('UserRestaurantsSection - Auto-loading all restaurants on mount');
      loadAllRestaurants();
    }
  }, [hasInitialized, restaurants.length, hookIsLoading]);

  // Sync state with hook data when hook loading completes and we have data
  useEffect(() => {
    if (hookIsLoading === false && initialRestaurants.length > 0 && !hasInitialized && !hasFetchedRestaurants.current) {
      setRestaurants(initialRestaurants);
      setTotal(initialTotal);
      setHasMore(initialRestaurants.length < initialTotal);
      setHasInitialized(true);
      hasFetchedRestaurants.current = true;
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
    const scrollToElement = () => {
      const restaurantElement = containerRef.current?.querySelector(`[data-restaurant-id="${restaurantId}"]`);
      if (restaurantElement) {
        restaurantElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        // Add a temporary highlight effect
        restaurantElement.classList.add('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-lg');
        setTimeout(() => {
          restaurantElement.classList.remove('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-lg');
        }, 3000);
        return true;
      }
      return false;
    };

    // Try to scroll immediately
    if (scrollToElement()) return;

    // If element not found, wait a bit and try again
    setTimeout(() => {
      if (scrollToElement()) return;
      
      // If still not found, wait longer (for lazy loading or dynamic content)
      setTimeout(() => {
        scrollToElement();
      }, 500);
    }, 100);
  }, []);

  // Load all restaurants at once - this is now the default behavior
  const loadAllRestaurants = useCallback(async () => {
    if (isLoadingAll || hookIsLoading) return;

    setIsLoadingAll(true);
    try {
      const response = await get(`/api/users/${userId}/restaurants?loadAll=true`);
      const data = await response.json();

      if (!response.ok || !data.data || !Array.isArray(data.data)) {
        throw new Error(data.error || 'Failed to fetch user restaurants');
      }

      // Remove duplicates by ID (though the API should not return duplicates)
      const uniqueRestaurants = data.data.filter((restaurant: any, index: number, arr: any[]) => {
        if (!restaurant || !restaurant.id) {
          console.warn('Skipping restaurant without valid ID:', restaurant);
          return false;
        }
        
        const firstIndex = arr.findIndex(r => r.id === restaurant.id);
        return index === firstIndex;
      });

      setRestaurants(uniqueRestaurants);
      setTotal(data.total || uniqueRestaurants.length);
      setPage(1);
      setHasMore(false);
      setHasInitialized(true);
      hasFetchedRestaurants.current = true;

      console.log('UserRestaurantsSection - Loaded all restaurants:', {
        restaurants: uniqueRestaurants.length,
        total: data.total || uniqueRestaurants.length
      });

    } catch (error) {
      console.error('Error loading all restaurants:', error);
      // Fallback to loading first page if bulk load fails
      try {
        const fallbackResponse = await get(`/api/users/${userId}/restaurants?page=1&limit=12`);
        const fallbackData = await fallbackResponse.json();
        if (fallbackResponse.ok && fallbackData.data) {
          setRestaurants(fallbackData.data);
          setTotal(fallbackData.total || fallbackData.data.length);
          setHasMore(fallbackData.hasMore || false);
          setHasInitialized(true);
          hasFetchedRestaurants.current = true;
        }
      } catch (fallbackError) {
        console.error('Fallback loading also failed:', fallbackError);
      }
    } finally {
      setIsLoadingAll(false);
    }
  }, [userId, get, isLoadingAll, hookIsLoading]);

  // Check if a specific restaurant exists in the current list
  const hasRestaurant = useCallback((restaurantId: string) => {
    return restaurants.some(restaurant => restaurant.id === restaurantId);
  }, [restaurants]);

  // Load more pages until the target restaurant is found
  const loadRestaurantIfNeeded = useCallback(async (restaurantId: string) => {
    // If we already have the restaurant, no need to load more
    if (hasRestaurant(restaurantId)) {
      return true;
    }

    // If we don't have more pages to load, the restaurant doesn't exist
    if (!hasMore) {
      return false;
    }

    // Load more pages until we find the restaurant or run out of pages
    let found = false;
    let attempts = 0;
    const maxAttempts = 5; // Reduced attempts to prevent infinite loops

    while (!found && hasMore && attempts < maxAttempts) {
      attempts++;
      
      // Load next page
      await loadAllRestaurants();
      
      // Check if the restaurant is now in our list
      found = hasRestaurant(restaurantId);
      
      // Small delay to prevent overwhelming the server
      if (!found && hasMore) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay
      }
    }

    return found;
  }, [restaurants, hasMore, hasRestaurant, loadAllRestaurants]);

  // Check for restaurantId in URL parameters and scroll to it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurantId');
    const tab = urlParams.get('tab');

    // Only scroll if we're on the restaurants tab and have a restaurantId
    if (tab === 'restaurants' && restaurantId) {
      // Debounce the scroll action to prevent multiple rapid calls
      const timeoutId = setTimeout(() => {
        // First, try to load the restaurant if it's not in our current list
        loadRestaurantIfNeeded(restaurantId).then((found) => {
          // Always try to scroll, even if the restaurant wasn't found
          // (this handles the case where it was already loaded)
          scrollToRestaurant(restaurantId);
        });
      }, 100); // Small delay to prevent rapid calls

      return () => clearTimeout(timeoutId);
    }
  }, [scrollToRestaurant, restaurants, loadRestaurantIfNeeded]);

  // Show loading state when data is being fetched and no data is available yet
  const shouldShowLoading = () => {
    // Show loading if:
    // 1. Hook is loading AND we have no restaurants AND no initial data AND not initialized
    // 2. OR we're actively loading more restaurants
    // 3. OR restaurants loading state is true from hook
    // 4. OR we're loading all restaurants at once
    return (hookIsLoading && restaurants.length === 0 && initialRestaurants.length === 0 && !hasInitialized) || 
           isLoadingMore ||
           (loadingStates?.restaurants === true && restaurants.length === 0 && !hasInitialized) ||
           isLoadingAll;
  };

  // Show loading state
  if (shouldShowLoading()) {
    if (isLoadingAll) {
      // Use enhanced skeleton loader for loading all restaurants
      return (
        <RestaurantSkeletonLoader 
          count={total || 12} 
          showProgress={true}
          message="Carregando todos os restaurantes..."
        />
      );
    } else {
      // Use regular skeleton loader for other loading states
      return (
        <div className="space-y-6">
          <SkeletonLoader type="restaurant" count={4} />
          {isLoadingMore && (
            <div className="flex justify-center pt-6">
              <div className="h-12 bg-gray-300 rounded-lg w-48 animate-pulse"></div>
            </div>
          )}
        </div>
      );
    }
  }

  // Show restaurants if they exist and are ready for display
  const shouldShowRestaurants = () => {
    // Show restaurants if:
    // 1. We have restaurants loaded AND (hook is not loading OR we have initialized with data)
    // 2. OR we have initial restaurants and are initialized
    return (restaurants.length > 0 && (!hookIsLoading || hasInitialized)) || 
           (initialRestaurants.length > 0 && hasInitialized);
  };

  if (shouldShowRestaurants()) {
    // Runtime validation: ensure no duplicate keys before rendering
    const uniqueRestaurants = restaurants.filter((restaurant, index, arr) => {
      const firstIndex = arr.findIndex(r => r.id === restaurant.id);
      return index === firstIndex;
    });
    
    // Log if we had to remove duplicates before rendering
    if (restaurants.length !== uniqueRestaurants.length) {
      console.warn('Removed duplicate restaurants before rendering:', {
        originalLength: restaurants.length,
        uniqueLength: uniqueRestaurants.length,
        removedCount: restaurants.length - uniqueRestaurants.length
      });
    }

    return (
      <div className="space-y-6" ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {uniqueRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isOwnRestaurant={isOwnProfile}
              onEdit={() => {
                // Navigate to edit page with back navigation parameters
                const currentUserId = window.location.pathname.split('/')[2];
                const currentTab = new URLSearchParams(window.location.search).get('tab') || 'restaurants';
                const editUrl = `/restaurants/${restaurant.id}/edit?source=profile&userId=${currentUserId}&tab=${currentTab}&restaurantId=${restaurant.id}`;
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


        {/* Total Count - Always show if we have a total count */}
        {total > 0 && (
          <div className="text-center text-gray-500 text-sm ios-safe-padding-top">
            Mostrando {restaurants.length} de {total} restaurantes
          </div>
        )}
      </div>
    );
  }

  // Show empty state if no restaurants and not loading
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

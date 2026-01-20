'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RestaurantCard from '@/components/ui/RestaurantCard';
import RestaurantFilters from '@/components/ui/RestaurantFilters';
import { FiltersProvider, useFilters, useAuth } from '@/contexts/index';
import Link from 'next/link';
import { Plus, Search as SearchIcon, CookingPot, Filter, ChefHat } from 'lucide-react';

// Component para mostrar loading
function RestaurantsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md h-56 sm:h-64 md:h-72 animate-pulse" />
      ))}
    </div>
  );
}

// Filtros iniciais
const initialFilters = {
  maxPrice: 100,
  minRating: 0,
  visited: false,
  notVisited: false,
  cuisineTypes: []
};

// Component to handle the search params logic and filtering
function RestaurantsContent({ showHeader = true }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [visitsData, setVisitsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search');
  const { clearTrigger } = useFilters();
  const { user, getAccessToken } = useAuth();

  // Clear visits data when user changes (logs in/out or switches accounts)
  useEffect(() => {
    const newUserId = user?.id || null;
    if (newUserId !== currentUserId) {
      // User changed - clear visits data to force fresh fetch
      setVisitsData({});
      setCurrentUserId(newUserId);
    }
  }, [user, currentUserId]);

  // Clear filters when clearTrigger changes
  useEffect(() => {
    if (clearTrigger > 0) {
      setFilters(initialFilters);
      setFilteredRestaurants(restaurants);
      setActiveFilters(false);
    }
  }, [clearTrigger, restaurants]);

  // Aplicar filtros automaticamente quando filtros, restaurantes ou dados de visitas mudarem
  useEffect(() => {
    if (restaurants.length > 0) {
      applyFilters();
    }
  }, [filters, restaurants, visitsData, user]);

  // Fetch visits data for all restaurants when user is authenticated and restaurants are loaded
  // Also refetch when component remounts (user navigates back from individual page)
  useEffect(() => {
    const fetchVisitsData = async () => {
      if (!user) {
        return;
      }

      if (restaurants.length === 0) {
        return;
      }
      setLoadingVisits(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoadingVisits(false);
          return;
        }

        const restaurantIds = restaurants.map(r => r.id);

        const response = await fetch('/api/restaurants/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setVisitsData(data);
        } else {
          console.error('❌ Failed to fetch visits data, status:', response.status);
          // Set default visits data on failure
          const defaultVisitsData = {};
          restaurantIds.forEach(id => {
            defaultVisitsData[id] = { visited: false, visitCount: 0 };
          });
          setVisitsData(defaultVisitsData);
        }
      } catch (error) {
        console.error('Error fetching visits data:', error);
        // Set default visits data on error
        const defaultVisitsData = {};
        restaurants.forEach(restaurant => {
          defaultVisitsData[restaurant.id] = { visited: false, visitCount: 0 };
        });
        setVisitsData(defaultVisitsData);
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchVisitsData();
  }, [user, restaurants, getAccessToken]);

  // Also fetch visits data when the page becomes visible again (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && restaurants.length > 0) {
        // Refetch visits data when page becomes visible again
        const refetchVisitsData = async () => {
          try {
            const token = await getAccessToken();
            if (!token) return;

            const restaurantIds = restaurants.map(r => r.id);
            const response = await fetch('/api/restaurants/visits', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ restaurantIds }),
            });

            if (response.ok) {
              const data = await response.json();
              setVisitsData(data);
            }
          } catch (error) {
            console.error('Error refetching visits data:', error);
          }
        };

        refetchVisitsData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, restaurants, getAccessToken]);

  // Function to update visits data when a card notifies a change
  const handleVisitsDataUpdate = (restaurantId, newVisitsData) => {
    console.log('🔄 Updating visits data for restaurant:', restaurantId, 'new data:', newVisitsData, 'user:', user?.email);
    setVisitsData(prev => ({
      ...prev,
      [restaurantId]: newVisitsData
    }));
  };

  // Fetch restaurants from optimized API route
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);

      try {
        const searchParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
        const response = await fetch(`/api/restaurants${searchParam}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText} - ${errorText}`);
        }

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        }

        if (!responseData || typeof responseData !== 'object' || !('restaurants' in responseData)) {
          throw new Error('Invalid response structure: missing restaurants data');
        }

        const { restaurants: data } = responseData;
        if (!Array.isArray(data)) {
          throw new Error('Invalid response structure: restaurants data is not an array');
        }

        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error('Erro ao buscar restaurantes:', err);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [searchQuery]);

  // Aplicar filtros automaticamente
  const applyFilters = () => {
    const filtered = restaurants.filter(restaurant => {
      // Filtro de preço
      if (restaurant.price_per_person > filters.maxPrice) {
        return false;
      }

      // Filtro de avaliação
      if (restaurant.rating < filters.minRating) {
        return false;
      }

      // Filtros de status (visitado/não visitado) - apenas para usuários logados
      if (user) {
        const restaurantVisitsData = visitsData[restaurant.id];
        const isVisited = restaurantVisitsData ? restaurantVisitsData.visited : false;

        if (filters.visited && !isVisited) {
          return false;
        }

        if (filters.notVisited && isVisited) {
          return false;
        }
      } else {
        // Para usuários não logados, os filtros de visita não se aplicam
        // (todos os restaurantes são considerados "não visitados")
        if (filters.visited) {
          return false; // Nenhum restaurante é considerado visitado para usuários não logados
        }
        // filters.notVisited sempre será true para usuários não logados, então não filtra nada
      }

      // Filtro por categoria culinária
      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        // Extrair IDs de categorias do restaurante
        const restaurantCuisineIds = restaurant.cuisine_types.map(type => type.id);

        // Verificar se há pelo menos uma correspondência entre as categorias do restaurante
        // e as categorias selecionadas no filtro
        const hasMatchingCuisine = filters.cuisineTypes.some(cuisineId =>
          restaurantCuisineIds.includes(cuisineId)
        );

        if (!hasMatchingCuisine) {
          return false;
        }
      }

      return true;
    });

    setFilteredRestaurants(filtered);
    setActiveFilters(true);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters(initialFilters);
    setFilteredRestaurants(restaurants);
    setActiveFilters(false);
  };

  const renderEmptyState = () => {
    // Se há uma pesquisa, mostra mensagem de "nenhum resultado"
    if (searchQuery) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
          <div className="text-center max-w-md">
            <SearchIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Não encontramos nenhum restaurante que corresponda a "{searchQuery}".
            </p>
            <Link href="/restaurants" className="text-amber-600 hover:text-amber-800 font-medium">
              Limpar pesquisa
            </Link>
          </div>
        </div>
      );
    }

    // Se não há pesquisa, mostra mensagem para criar primeiro restaurante
    return (
      <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <CookingPot className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante cadastrado</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Comece adicionando seu primeiro restaurante para criar sua coleção gastronômica.
          </p>
          <Link
            href="/restaurants/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Restaurante
          </Link>
        </div>
      </div>
    );
  };

  const renderFilterStats = () => {
    if (!activeFilters) return null;

    const totalRestaurants = restaurants.length;
    const filteredCount = filteredRestaurants.length;

    return (
      <div className="text-sm text-gray-500 mb-4 flex items-center">
        <Filter className="h-3 w-3 mr-1 text-amber-500" />
        <span>
          Mostrando {filteredCount} de {totalRestaurants} restaurantes
        </span>
      </div>
    );
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Restaurantes'}
          </h1>
          <Link
            href="/restaurants/roulette"
            className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0 w-full sm:w-auto"
          >
            <ChefHat className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Roleta</span>
            <span className="sm:hidden">Roleta de Restaurantes</span>
          </Link>
        </div>
      </>
    );
  };

  return (
    <>
      {renderHeader()}

      <RestaurantFilters
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        autoApply={true}
      />

      {renderFilterStats()}

      {loading ? (
        <RestaurantsLoading />
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredRestaurants.map(restaurant => {
            const restaurantVisitsData = visitsData[restaurant.id];
            return (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                visitsData={restaurantVisitsData}
                loadingVisits={loadingVisits}
                onVisitsDataUpdate={handleVisitsDataUpdate}
              />
            );
          })}
        </div>
      ) : (
        renderEmptyState()
      )}
    </>
  );
}

// Main component with Suspense
export default function RestaurantsList({ showHeader = true }) {
  return (
    <FiltersProvider>
      <RestaurantsListContent showHeader={showHeader} />
    </FiltersProvider>
  );
}

function RestaurantsListContent({ showHeader }) {
  const { clearFilters } = useFilters();

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <Suspense fallback={<RestaurantsLoading />}>
        <RestaurantsContent showHeader={showHeader} />
      </Suspense>
    </div>
  );
}

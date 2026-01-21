'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFilters } from '@/contexts/index';

interface Restaurant {
  id: string;
  name: string;
  price_per_person?: number;
  rating?: number;
  cuisine_types?: Array<{
    id: string;
    name: string;
  }>;
}

interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

interface VisitsData {
  [restaurantId: string]: {
    visited: boolean;
    visitCount: number;
  };
}

interface Filters {
  maxPrice: number;
  minRating: number;
  visited: boolean;
  notVisited: boolean;
  cuisineTypes: string[];
}

interface UseFiltersLogicReturn {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredRestaurants: Restaurant[];
  activeFilters: boolean;
  clearFilters: () => void;
}

const initialFilters: Filters = {
  maxPrice: 100,
  minRating: 0,
  visited: false,
  notVisited: false,
  cuisineTypes: []
};

export function useFiltersLogic(
  restaurants: Restaurant[],
  visitsData: VisitsData,
  user: User | null
): UseFiltersLogicReturn {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<boolean>(false);
  const { clearTrigger } = useFilters();

  // Clear filters when clearTrigger changes
  useEffect(() => {
    if (clearTrigger > 0) {
      setFilters(initialFilters);
      setActiveFilters(false);
    }
  }, [clearTrigger]);

  // Apply filters automatically when filters, restaurants or visits data change
  const filteredRestaurants = useMemo(() => {
    if (!restaurants.length) return restaurants;

    const filtered = restaurants.filter(restaurant => {
      // Filtro de preço
      if (restaurant.price_per_person && restaurant.price_per_person > filters.maxPrice) {
        return false;
      }

      // Filtro de avaliação - converter para número se necessário
      if (restaurant.rating !== undefined && restaurant.rating !== null) {
        const rating = typeof restaurant.rating === 'string' ? parseFloat(restaurant.rating) : restaurant.rating;
        if (rating < filters.minRating) {
          return false;
        }
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
        const restaurantCuisineIds = restaurant.cuisine_types?.map(type => type.id) || [];

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

    setActiveFilters(true);
    return filtered;
  }, [filters, restaurants, visitsData, user]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters(initialFilters);
    setActiveFilters(false);
  };

  return {
    filters,
    setFilters,
    filteredRestaurants,
    activeFilters,
    clearFilters
  };
}

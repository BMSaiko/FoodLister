// utils/filters.ts
// Funções e tipos para gerenciar filtros de restaurantes

import { createClient } from '@/libs/supabase/client';
import { logError } from './logger';

// Interface para os filtros de restaurantes
export interface RestaurantFilters {
  maxPrice: number;
  minRating: number;
  visited?: boolean;
  notVisited?: boolean;
  cuisineTypes?: string[]; // Array de IDs de categorias culinárias
  searchTerm?: string;
}

// Valores padrão para filtros
export const defaultFilters: RestaurantFilters = {
  maxPrice: 100,
  minRating: 0,
  visited: false,
  notVisited: false,
  cuisineTypes: [],
  searchTerm: ''
};

/**
 * Aplica filtros a uma lista de restaurantes
 * @param restaurants - Lista de restaurantes
 * @param filters - Filtros a serem aplicados
 * @returns Lista filtrada de restaurantes
 */
export const applyFiltersToRestaurants = (restaurants: any[], filters: RestaurantFilters) => {
  return restaurants.filter(restaurant => {
    // Filtro de preço
    if (restaurant.price_per_person > filters.maxPrice) {
      return false;
    }
    
    // Filtro de avaliação
    if (restaurant.rating < filters.minRating) {
      return false;
    }
    
    // Filtros de status (visitado/não visitado)
    if (filters.visited && !restaurant.visited) {
      return false;
    }
    
    if (filters.notVisited && restaurant.visited) {
      return false;
    }
    
    // Filtro por tipo de cozinha
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      // Se restaurant.cuisine_types estiver disponível (carregado com relacionamentos)
      if (restaurant.cuisine_types && restaurant.cuisine_types.length > 0) {
        const restaurantCuisineIds = restaurant.cuisine_types.map(type => type.id);
        // Verificar se há pelo menos uma correspondência entre as categorias do restaurante e as selecionadas no filtro
        const hasMatchingCuisine = filters.cuisineTypes.some(cuisineId => 
          restaurantCuisineIds.includes(cuisineId)
        );
        
        if (!hasMatchingCuisine) {
          return false;
        }
      } else {
        // Se não temos informações sobre as categorias do restaurante, talvez seja melhor
        // não filtrar para evitar falsos negativos. Alternativa é excluir assumindo que
        // não há categorias relacionadas.
        return false;
      }
    }
    
    // Filtro por termo de pesquisa
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase();
      const nameMatch = restaurant.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = restaurant.description.toLowerCase().includes(searchTerm);
      
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Busca restaurantes do Supabase e aplica filtros
 * @param filters - Filtros a serem aplicados
 * @returns Promise com a lista filtrada de restaurantes
 */
export const fetchAndFilterRestaurants = async (filters: RestaurantFilters) => {
  const supabase = createClient();
  
  try {
    // 1. Primeiro buscamos todos os restaurantes
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        cuisine_types:restaurant_cuisine_types(
          cuisine_type:cuisine_types(*)
        )
      `);
    
    // Se tiver termo de pesquisa, aplicar como filtro na consulta
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logError('Erro ao buscar restaurantes', error);
      return [];
    }
    
    // 2. Transformar os dados para facilitar o trabalho com as categorias
    const restaurantsWithFormattedCuisines = (data as any[]).map(restaurant => {
      // Extrair e formatear os tipos de cozinha para um formato mais conveniente
      const cuisineTypes = restaurant.cuisine_types
        ? restaurant.cuisine_types.map((relation: any) => relation.cuisine_type)
        : [];

      return {
        ...restaurant,
        cuisine_types: cuisineTypes
      };
    });
    
    // 3. Aplicar os filtros restantes na memória
    return applyFiltersToRestaurants(restaurantsWithFormattedCuisines, filters);
  } catch (err) {
    logError('Erro ao buscar e filtrar restaurantes', err);
    return [];
  }
};

/**
 * Obtém estatísticas dos filtros (quantidade de resultados, etc)
 * @param total - Total de itens antes da filtragem
 * @param filtered - Total de itens após a filtragem
 * @returns Objeto com estatísticas
 */
export const getFilterStats = (total: number, filtered: number) => {
  return {
    total,
    filtered,
    hidden: total - filtered,
    percentFiltered: total > 0 ? Math.round((filtered / total) * 100) : 0
  };
};

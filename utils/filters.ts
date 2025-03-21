// utils/filters.ts
// Funções e tipos para gerenciar filtros de restaurantes

import { createClient } from '@/libs/supabase/client';

// Interface para os filtros de restaurantes
export interface RestaurantFilters {
  maxPrice: number;
  minRating: number;
  visited?: boolean;
  notVisited?: boolean;
  cuisineType?: string[];
  searchTerm?: string;
}

// Valores padrão para filtros
export const defaultFilters: RestaurantFilters = {
  maxPrice: 100,
  minRating: 0,
  visited: false,
  notVisited: false,
  cuisineType: [],
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
    
    // Filtro por tipo de cozinha (quando implementado)
    if (filters.cuisineType && filters.cuisineType.length > 0 && restaurant.cuisine) {
      if (!filters.cuisineType.includes(restaurant.cuisine)) {
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
  
  let query = supabase.from('restaurants').select('*');
  
  // Se tiver termo de pesquisa, aplicar como filtro na consulta
  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    query = query.ilike('name', `%${filters.searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar restaurantes:', error);
    return [];
  }
  
  // Aplicar filtros restantes na memória
  return applyFiltersToRestaurants(data || [], filters);
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
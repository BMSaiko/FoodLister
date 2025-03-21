// app/restaurants/page.js
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import RestaurantFilters from '@/components/ui/RestaurantFilters';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus, Search as SearchIcon, CookingPot, Filter } from 'lucide-react';

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
function RestaurantsContent() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search');
  
  const supabase = createClient();
  
  // Fetch all restaurants with cuisine types
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      
      try {
        // Consulta mais elaborada para obter restaurantes com suas categorias culinárias
        let query = supabase
          .from('restaurants')
          .select(`
            *,
            cuisine_types:restaurant_cuisine_types(
              cuisine_type:cuisine_types(*)
            )
          `);
        
        // Adiciona filtro de pesquisa se houver uma query
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar restaurantes:', error);
          setRestaurants([]);
          setFilteredRestaurants([]);
        } else {
          // Transformar os dados para facilitar o trabalho com as categorias
          const processedData = data.map(restaurant => {
            // Extrair e formatar os tipos de cozinha para um formato mais conveniente
            const cuisineTypes = restaurant.cuisine_types
              ? restaurant.cuisine_types.map(relation => relation.cuisine_type)
              : [];
            
            return {
              ...restaurant,
              cuisine_types: cuisineTypes
            };
          });
          
          setRestaurants(processedData || []);
          setFilteredRestaurants(processedData || []);
        }
      } catch (err) {
        console.error('Erro ao processar dados de restaurantes:', err);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurants();
  }, [searchQuery]);
  
  // Aplicar filtros
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
      
      // Filtros de status (visitado/não visitado)
      if (filters.visited && !restaurant.visited) {
        return false;
      }
      
      if (filters.notVisited && restaurant.visited) {
        return false;
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
  
  return (
    <>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Restaurantes'}
        </h1>
      </div>
      
      <RestaurantFilters 
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
      />
      
      {renderFilterStats()}
      
      {loading ? (
        <RestaurantsLoading />
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </>
  );
}

// Main component with Suspense
export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Suspense fallback={<RestaurantsLoading />}>
          <RestaurantsContent />
        </Suspense>
      </div>
    </main>
  );
}
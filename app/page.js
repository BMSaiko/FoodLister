// app/page.js
"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import ListCard from '@/components/ui/ListCard';
import RestaurantFilters from '@/components/ui/RestaurantFilters';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus, Utensils, ListChecks, Filter } from 'lucide-react';

// Loading component
function ContentLoading() {
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

// Component to handle content
function HomeContent({ activeTab }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(false);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      if (activeTab === 'restaurants') {
        try {
          // Consulta para obter restaurantes com suas categorias culinárias
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('restaurants')
            .select(`
              *,
              cuisine_types:restaurant_cuisine_types(
                cuisine_type:cuisine_types(*)
              )
            `);
            
          if (!restaurantError) {
            // Transformar os dados para facilitar o trabalho com as categorias
            const processedData = restaurantData.map(restaurant => {
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
          } else {
            console.error('Error fetching restaurants:', restaurantError);
          }
        } catch (err) {
          console.error('Error processing restaurant data:', err);
        }
      } else {
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*, list_restaurants(restaurant_id)');
          
        if (!listError) {
          setLists(listData || []);
        }
      }
      
      setLoading(false);
    }
    
    fetchData();
    // Resetar filtros ativos quando mudar de aba
    setActiveFilters(false);
    setFilters(initialFilters);
  }, [activeTab]);
  
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
  
  const renderEmptyRestaurants = () => (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
      <div className="text-center max-w-md">
        <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante encontrado</h3>
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
  
  const renderEmptyLists = () => (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
      <div className="text-center max-w-md">
        <ListChecks className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista encontrada</h3>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Crie sua primeira lista para organizar seus restaurantes favoritos por categoria, ocasião ou qualquer critério.
        </p>
        <Link 
          href="/lists/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Lista
        </Link>
      </div>
    </div>
  );
  
  const renderFilterStats = () => {
    if (!activeFilters || activeTab !== 'restaurants') return null;
    
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
  
  if (loading) {
    return <ContentLoading />;
  }
  
  if (activeTab === 'restaurants') {
    return (
      <>
        {/* Mostrar filtros apenas na aba de restaurantes */}
        <RestaurantFilters 
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
        
        {renderFilterStats()}
        
        {activeFilters ? (
          filteredRestaurants.length === 0 ? (
            <div className="w-full py-8 text-center text-gray-500">
              <p>Nenhum restaurante corresponde aos filtros selecionados.</p>
              <button 
                onClick={clearFilters}
                className="mt-2 text-amber-600 hover:text-amber-800 underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )
        ) : (
          restaurants.length === 0 ? (
            renderEmptyRestaurants()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {restaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )
        )}
      </>
    );
  } else {
    if (lists.length === 0) {
      return renderEmptyLists();
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lists.map(list => (
          <ListCard 
            key={list.id} 
            list={list} 
            restaurantCount={list.list_restaurants?.length || 0} 
          />
        ))}
      </div>
    );
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('restaurants');
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="sm:hidden flex bg-gray-100 rounded-lg p-1 justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'restaurants' 
                ? 'bg-white shadow-sm text-amber-500' 
                : 'text-gray-600 hover:text-amber-500'
            }`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurantes
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'lists' 
                ? 'bg-white shadow-sm text-amber-500' 
                : 'text-gray-600 hover:text-amber-500'
            }`}
            onClick={() => setActiveTab('lists')}
          >
            Listas
          </button>
        </div>
        
        <Suspense fallback={<ContentLoading />}>
          <HomeContent activeTab={activeTab} />
        </Suspense>
        <SpeedInsights />
      </div>
    </main>
  );
}
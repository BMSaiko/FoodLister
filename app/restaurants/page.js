// app/restaurants/page.js (versão responsiva)
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus, Search as SearchIcon, CookingPot } from 'lucide-react';

// Component to handle the search params logic
function RestaurantsContent() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      
      let query = supabase.from('restaurants').select('*');
      
      // Adiciona filtro de pesquisa se houver uma query
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
        
      if (!error) {
        setRestaurants(data || []);
      } else {
        console.error('Erro ao buscar restaurantes:', error);
        setRestaurants([]);
      }
      
      setLoading(false);
    }
    
    fetchRestaurants();
  }, [searchQuery]);
  
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
  
  return (
    <>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Restaurantes'}
        </h1>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md h-56 sm:h-64 md:h-72 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </>
  );
}

// Loading fallback for Suspense
function RestaurantsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md h-56 sm:h-64 md:h-72 animate-pulse" />
      ))}
    </div>
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
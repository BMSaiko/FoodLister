// app/restaurants/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import Navbar from '@/components/layouts/Navbar';

export default function RestaurantsPage() {
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
        
      if (!error && data) {
        setRestaurants(data);
      }
      
      setLoading(false);
    }
    
    fetchRestaurants();
  }, [searchQuery]);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Restaurantes'}
        </h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-72 animate-pulse" />
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum restaurante encontrado.</p>
          </div>
        )}
      </div>
    </main>
  );
}
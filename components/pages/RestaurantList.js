import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import Navbar from '@/components/layout/Navbar';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
        
      if (!error && data) {
        setRestaurants(data);
      }
      
      setLoading(false);
    }
    
    fetchRestaurants();
  }, []);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Todos os Restaurantes</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
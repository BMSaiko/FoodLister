"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ListDetails() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchListDetails() {
      if (!id) return;
      
      setLoading(true);
      
      // Fetch list details
      const { data: listData } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single();
        
      if (listData) {
        setList(listData);
        
        // Fetch restaurants in this list
        const { data: restaurantsData } = await supabase
          .from('list_restaurants')
          .select('restaurant_id')
          .eq('list_id', id);
          
        if (restaurantsData && restaurantsData.length > 0) {
          const restaurantIds = restaurantsData.map(item => item.restaurant_id);
          
          const { data: restaurantDetails } = await supabase
            .from('restaurants')
            .select('*')
            .in('id', restaurantIds);
            
          if (restaurantDetails) {
            setRestaurants(restaurantDetails);
          }
        }
      }
      
      setLoading(false);
    }
    
    fetchListDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white p-6 rounded-lg shadow-md h-24 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Lista não encontrada</h2>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-indigo-600 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{list.name}</h1>
          <p className="text-gray-600 mt-2">{list.description}</p>
          <p className="text-sm text-gray-500 mt-4">
            {restaurants.length} restaurantes • Criada em {new Date(list.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Restaurantes nesta lista</h2>
        
        {restaurants.length === 0 ? (
          <p className="text-gray-500">Não há restaurantes nesta lista.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
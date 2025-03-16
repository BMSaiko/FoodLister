"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layouts/Navbar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      if (activeTab === 'restaurants') {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*');
          
        if (!restaurantError) {
          setRestaurants(restaurantData);
        }
      } else {
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*, list_restaurants(restaurant_id)');
          
        if (!listError) {
          setLists(listData);
        }
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [activeTab]);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Esqueletos de carregamento
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-72 animate-pulse" />
            ))
          ) : activeTab === 'restaurants' ? (
            restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))
          ) : (
            lists.map(list => (
              <ListCard 
                key={list.id} 
                list={list} 
                restaurantCount={list.list_restaurants?.length || 0} 
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
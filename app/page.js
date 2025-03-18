"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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
          setRestaurants(restaurantData || []);
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
  }, [activeTab]);
  
  const renderEmptyRestaurants = () => (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante encontrado</h3>
        <p className="text-gray-500 mb-6">
          Comece adicionando seu primeiro restaurante para criar sua coleção gastronômica.
        </p>
        <Link 
          href="/restaurants/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Restaurante
        </Link>
      </div>
    </div>
  );
  
  const renderEmptyLists = () => (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista encontrada</h3>
        <p className="text-gray-500 mb-6">
          Crie sua primeira lista para organizar seus restaurantes favoritos por categoria, ocasião ou qualquer critério.
        </p>
        <Link 
          href="/lists/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Lista
        </Link>
      </div>
    </div>
  );
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md h-72 animate-pulse" />
          ))}
        </div>
      );
    }
    
    if (activeTab === 'restaurants') {
      if (restaurants.length === 0) {
        return renderEmptyRestaurants();
      }
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      );
    } else {
      if (lists.length === 0) {
        return renderEmptyLists();
      }
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </main>
  );
}
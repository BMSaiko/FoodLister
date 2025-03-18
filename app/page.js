// app/page.js (com ajustes responsivos)
"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import RestaurantCard from '@/components/ui/RestaurantCard';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus, Utensils, ListChecks } from 'lucide-react';

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
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md h-56 sm:h-64 md:h-72 animate-pulse" />
          ))}
        </div>
      );
    }
    
    if (activeTab === 'restaurants') {
      if (restaurants.length === 0) {
        return renderEmptyRestaurants();
      }
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
  };
  
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
        
        {renderContent()}
      </div>
    </main>
  );
}
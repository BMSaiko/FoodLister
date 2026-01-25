// app/lists/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import Navbar from '@/components/layouts/Navbar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { ArrowLeft, Edit, User } from 'lucide-react';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: any[];
  review_count?: number;
}

interface List {
  id: string;
  name: string;
  description?: string;
  creator_id?: string;
  creator?: string;
  created_at: string;
  updated_at: string;
  restaurants: Restaurant[];
}

export default function ListDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { get } = useSecureApiClient();
  const [list, setList] = useState<List | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListDetails() {
      if (!id) return;

      setLoading(true);

      try {
        const response = await get(`/api/lists/${id}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch list details: ${response.status} ${response.statusText} - ${errorText}`);
        }

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown error';
          throw new Error(`Invalid JSON response: ${errorMessage}`);
        }

        if (!responseData || typeof responseData !== 'object' || !('list' in responseData)) {
          throw new Error('Invalid response structure: missing list data');
        }

        const { list: listData } = responseData;
        if (!listData || typeof listData !== 'object') {
          throw new Error('Invalid response structure: list data is not an object');
        }

        setList(listData);
        setRestaurants(listData.restaurants || []);
      } catch (error) {
        console.error('Error fetching list details:', error);
        setList(null);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
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
          <Link href="/lists" className="mt-4 inline-block text-amber-600 hover:underline">
            Voltar para a página de listas
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <Link href="/lists" className="flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 transition-colors min-h-[44px] sm:min-h-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Link>
          
          <div className="flex w-full sm:w-auto">
            {user && list?.creator_id === user.id && (
              <Link
                href={`/lists/${id}/edit`}
                className="flex items-center justify-center bg-amber-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                <Edit className="h-4 w-4 mr-1.5 sm:mr-1" />
                <span className="text-sm sm:text-base">Editar</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{list.name}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{list.description}</p>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-500">
              {restaurants.length} restaurantes • Criada em {new Date(list.created_at).toLocaleDateString('pt-PT')}
            </div>
            
            {list.creator && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Criada por: {list.creator}
              </div>
            )}
          </div>
        </div>
        
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Restaurantes nesta lista</h2>
        
        {restaurants.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">Não há restaurantes nesta lista.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={{ 
                  ...restaurant, 
                  cuisine_types: restaurant.cuisine_types || [] 
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

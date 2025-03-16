import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, ListChecks } from 'lucide-react';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchRestaurantDetails() {
      if (!id) return;
      
      setLoading(true);
      
      // Fetch restaurant details
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
        
      if (restaurantData) {
        setRestaurant(restaurantData);
        
        // Fetch lists containing this restaurant
        const { data: listRelations } = await supabase
          .from('list_restaurants')
          .select('list_id')
          .eq('restaurant_id', id);
          
        if (listRelations && listRelations.length > 0) {
          const listIds = listRelations.map(item => item.list_id);
          
          const { data: listDetails } = await supabase
            .from('lists')
            .select('*')
            .in('id', listIds);
            
          if (listDetails) {
            setLists(listDetails);
          }
        }
      }
      
      setLoading(false);
    }
    
    fetchRestaurantDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-xl shadow-md h-96 mb-6"></div>
          <div className="animate-pulse bg-white p-6 rounded-lg shadow-md h-24 mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Restaurante não encontrado</h2>
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
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <Image
              src={restaurant.image_url || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <div className="flex items-center bg-yellow-100 px-3 py-2 rounded">
                <Star className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
                <span className="font-semibold text-lg">{restaurant.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mt-4">{restaurant.description}</p>
            
            <div className="mt-6 text-indigo-600 font-semibold text-xl">
              €{restaurant.price_per_person.toFixed(2)} por pessoa
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-indigo-600" />
            Listas que incluem este restaurante
          </h2>
          
          {lists.length === 0 ? (
            <p className="text-gray-500 mt-4">Este restaurante não está em nenhuma lista.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map(list => (
                <Link key={list.id} href={`/lists/${list.id}`} className="block">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium text-gray-800">{list.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{list.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
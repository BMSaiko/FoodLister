// app/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, ListChecks, Edit, Trash } from 'lucide-react';

export default function RestaurantDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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
  
  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    
    try {
      // First delete all relationships in list_restaurants
      await supabase
        .from('list_restaurants')
        .delete()
        .eq('restaurant_id', id);
      
      // Then delete the restaurant
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Redirect to restaurants list
      router.push('/restaurants');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setDeleting(false);
      setDeleteModalOpen(false);
      // Here you could add error feedback to the user
    }
  };
  
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
          <Link href="/restaurants" className="mt-4 inline-block text-indigo-600 hover:underline">
            Voltar para a página de restaurantes
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/restaurants" className="flex items-center text-indigo-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
          
          <div className="flex space-x-2">
            <Link 
              href={`/restaurants/${id}/edit`}
              className="flex items-center bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-sm">Editar</span>
            </Link>
            
            {/* <button 
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
            >
              <Trash className="h-4 w-4 mr-1" />
              <span className="text-sm">Apagar</span>
            </button> */}
          </div>
        </div>
        
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
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o restaurante <span className="font-semibold">"{restaurant.name}"</span>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleting}
              >
                Cancelar
              </button>
              {/* <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// app/lists/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import Link from 'next/link';

export default function ListDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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
  
  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    
    try {
      // First delete all relationships in list_restaurants
      await supabase
        .from('list_restaurants')
        .delete()
        .eq('list_id', id);
      
      // Then delete the list
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Redirect to lists page
      router.push('/lists');
    } catch (err) {
      console.error('Error deleting list:', err);
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
          <Link href="/lists" className="mt-4 inline-block text-indigo-600 hover:underline">
            Voltar para a página de listas
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
          <Link href="/lists" className="flex items-center text-indigo-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
          
          <div className="flex space-x-2">
            <Link 
              href={`/lists/${id}/edit`}
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
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a lista <span className="font-semibold">"{list.name}"</span>? 
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
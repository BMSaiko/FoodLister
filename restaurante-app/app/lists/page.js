// app/lists/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layouts/Navbar';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchLists() {
      setLoading(true);
      
      let query = supabase.from('lists').select('*');
      
      // Adiciona filtro de pesquisa se houver uma query
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
        
      if (!error && data) {
        // Para cada lista, conta o número de restaurantes
        const listsWithCounts = await Promise.all(
          data.map(async (list) => {
            const { count } = await supabase
              .from('list_restaurants')
              .select('*', { count: 'exact' })
              .eq('list_id', list.id);
              
            return {
              ...list,
              restaurantCount: count || 0
            };
          })
        );
        
        setLists(listsWithCounts);
      }
      
      setLoading(false);
    }
    
    fetchLists();
  }, [searchQuery]);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Todas as Listas'}
        </h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-48 animate-pulse" />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <ListCard 
                key={list.id} 
                list={list} 
                restaurantCount={list.restaurantCount} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhuma lista encontrada.</p>
          </div>
        )}
      </div>
    </main>
  );
}
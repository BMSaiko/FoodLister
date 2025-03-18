// app/lists/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { Plus, Search as SearchIcon, ListChecks } from 'lucide-react';

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
      } else {
        console.error('Erro ao buscar listas:', error);
        setLists([]);
      }
      
      setLoading(false);
    }
    
    fetchLists();
  }, [searchQuery]);
  
  const renderEmptyState = () => {
    // Se há uma pesquisa, mostra mensagem de "nenhum resultado"
    if (searchQuery) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mb-6">
              Não encontramos nenhuma lista que corresponda a "{searchQuery}".
            </p>
            <Link href="/lists" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Limpar pesquisa
            </Link>
          </div>
        </div>
      );
    }
    
    // Se não há pesquisa, mostra mensagem para criar primeira lista
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista cadastrada</h3>
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
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Todas as Listas'}
          </h1>
        </div>
        
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
          renderEmptyState()
        )}
      </div>
    </main>
  );
}
// app/lists/page.js (versão responsiva)
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import ListCard from '@/components/ui/ListCard';
import Link from 'next/link';
import { Plus, Search as SearchIcon, ListChecks } from 'lucide-react';

// Component to handle the search params logic
function ListsContent() {
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
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
          <div className="text-center max-w-md">
            <SearchIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Não encontramos nenhuma lista que corresponda a "{searchQuery}".
            </p>
            <Link href="/lists" className="text-amber-600 hover:text-amber-800 font-medium">
              Limpar pesquisa
            </Link>
          </div>
        </div>
      );
    }
    
    // Se não há pesquisa, mostra mensagem para criar primeira lista
    return (
      <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <ListChecks className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista cadastrada</h3>
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
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'Todas as Listas'}
        </h1>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md h-48 animate-pulse" />
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
    </>
  );
}

// Loading fallback for Suspense
function ListsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md h-48 animate-pulse" />
      ))}
    </div>
  );
}

// Main component with Suspense
export default function ListsPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <Suspense fallback={<ListsLoading />}>
        <ListsContent />
      </Suspense>
    </div>
  );
}

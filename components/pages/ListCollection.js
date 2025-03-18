import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ListCard from '@/components/ui/ListCard';
import Navbar from '@/components/layout/Navbar';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchLists() {
      setLoading(true);
      
      // Fetch lists
      const { data, error } = await supabase
        .from('lists')
        .select('*');
        
      if (!error && data) {
        // For each list, count the number of restaurants
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
  }, []);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Todas as Listas</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <ListCard 
                key={list.id} 
                list={list} 
                restaurantCount={list.restaurantCount} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
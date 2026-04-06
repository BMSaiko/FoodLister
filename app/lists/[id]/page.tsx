// app/lists/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import Navbar from '@/components/ui/navigation/Navbar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import RestaurantRoulette from '@/components/ui/RestaurantRoulette';
import { ArrowLeft, Edit, User, Shuffle, Globe, Lock, RefreshCw, Trash2, Share2, Copy, BarChart3, MessageCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useShare } from '@/hooks/utilities/useShare';
import ListStatistics from '@/components/ui/lists/ListStatistics';
import ListComments from '@/components/ui/lists/ListComments';
import ListExportButtons from '@/components/ui/lists/ListExportButtons';
import ListCollaborators from '@/components/ui/lists/ListCollaborators';

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
  cuisine_types: any[];
  review_count?: number;
  features: any[];
  dietary_options: any[];
}

interface List {
  id: string;
  name: string;
  description?: string;
  creator_id?: string;
  creator?: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  filters?: any;
  restaurants: Restaurant[];
}

export default function ListDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoulette, setShowRoulette] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const { share } = useShare();

  useEffect(() => {
    async function fetchListDetails() {
      if (!id) return;

      setLoading(true);

      try {
        const response = await fetch(`/api/lists/${id}`);

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

        // Transform restaurant data to match RestaurantWithDetails type
        const transformedRestaurants = (listData.restaurants || []).map((restaurant: any) => ({
          ...restaurant,
          features: restaurant.restaurant_features?.map((rf: any) => rf.features) || [],
          dietary_options: restaurant.restaurant_dietary_options?.map((rdo: any) => rdo.dietary_options) || [],
          cuisine_types: restaurant.restaurant_cuisine_types?.map((rct: any) => rct.cuisine_types) || []
        }));

        setList(listData);
        setRestaurants(transformedRestaurants);
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

  // Share list
  const handleShareList = async () => {
    if (!list) return;
    await share({
      title: list.name,
      text: list.description || `Vê a lista "${list.name}" no FoodLister!`,
      url: `/lists/${id}`,
    });
  };

  // Duplicate list
  const handleDuplicateList = async () => {
    if (!list) return;

    setDuplicating(true);
    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${list.name} (Cópia)` }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Lista duplicada com sucesso!');
        window.location.href = `/lists/${data.list.id}`;
      } else {
        toast.error(data.error || 'Erro ao duplicar a lista');
      }
    } catch (error) {
      console.error('Error duplicating list:', error);
      toast.error('Erro ao duplicar a lista. Tente novamente.');
    } finally {
      setDuplicating(false);
    }
  };

  // Delete list
  const handleDeleteList = async () => {
    if (!confirm(`Tem certeza que deseja eliminar a lista "${list?.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Lista eliminada com sucesso!');
        window.location.href = '/lists';
      } else {
        toast.error(data.error || 'Erro ao eliminar a lista');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Erro ao eliminar a lista. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  // Apply filters from list if it has them
  const applyFilters = async () => {
    if (!list?.filters) return;
    
    setApplyingFilters(true);
    try {
      const supabase = (await import('@/libs/supabase/client')).getClient();
      const filters = list.filters;
      
      let query = supabase.from('restaurants').select('*');
      
      if (filters.cuisineTypes?.length > 0) {
        const { data: junctionData } = await supabase
          .from('restaurant_cuisine_types')
          .select('restaurant_id')
          .in('cuisine_type_id', filters.cuisineTypes);
        
        if (junctionData && junctionData.length > 0) {
          const restaurantIds = [...new Set(junctionData.map((j: any) => j.restaurant_id))];
          query = query.in('id', restaurantIds);
        } else {
          setRestaurants([]);
          setApplyingFilters(false);
          return;
        }
      }
      
      if (filters.features?.length > 0) {
        const { data: junctionData } = await supabase
          .from('restaurant_restaurant_features')
          .select('restaurant_id')
          .in('feature_id', filters.features);
        
        if (junctionData && junctionData.length > 0) {
          const restaurantIds = [...new Set(junctionData.map((j: any) => j.restaurant_id))];
          query = query.in('id', restaurantIds);
        } else {
          setRestaurants([]);
          setApplyingFilters(false);
          return;
        }
      }
      
      if (filters.dietaryOptions?.length > 0) {
        const { data: junctionData } = await supabase
          .from('restaurant_dietary_options_junction')
          .select('restaurant_id')
          .in('dietary_option_id', filters.dietaryOptions);
        
        if (junctionData && junctionData.length > 0) {
          const restaurantIds = [...new Set(junctionData.map((j: any) => j.restaurant_id))];
          query = query.in('id', restaurantIds);
        } else {
          setRestaurants([]);
          setApplyingFilters(false);
          return;
        }
      }
      
      query = query.gte('price_per_person', filters.priceRange?.[0] ?? 0)
                   .lte('price_per_person', filters.priceRange?.[1] ?? 100)
                   .gte('rating', filters.minRating ?? 0);
      
      const { data, error } = await query;
      
      if (!error && data) {
        const transformedRestaurants = data.map((restaurant: any) => ({
          ...restaurant,
          features: restaurant.restaurant_features?.map((rf: any) => rf.features) || [],
          dietary_options: restaurant.restaurant_dietary_options?.map((rdo: any) => rdo.dietary_options) || [],
          cuisine_types: restaurant.restaurant_cuisine_types?.map((rct: any) => rct.cuisine_types) || []
        }));
        
        setRestaurants(transformedRestaurants);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
    } finally {
      setApplyingFilters(false);
    }
  };
  
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
          
           <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             {/* Roulette Button */}
             <button
               onClick={() => setShowRoulette(true)}
               className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
             >
               <Shuffle className="h-4 w-4 mr-1.5 sm:mr-1" />
               <span className="text-sm sm:text-base">Roleta</span>
             </button>
             
              {/* Share Button - Available for all users */}
              <button
                onClick={handleShareList}
                className="flex items-center justify-center bg-blue-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                <Share2 className="h-4 w-4 mr-1.5 sm:mr-1" />
                <span className="text-sm sm:text-base">Partilhar</span>
              </button>

               {user && list?.creator_id === user.id && (
                 <>
                   {/* Duplicate Button */}
                   <button
                     onClick={handleDuplicateList}
                     disabled={duplicating}
                     className="flex items-center justify-center bg-indigo-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-indigo-600 active:bg-indigo-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0 disabled:opacity-50"
                   >
                     {duplicating ? (
                       <RefreshCw className="h-4 w-4 mr-1.5 sm:mr-1 animate-spin" />
                     ) : (
                       <Copy className="h-4 w-4 mr-1.5 sm:mr-1" />
                     )}
                     <span className="text-sm sm:text-base">{duplicating ? 'A duplicar...' : 'Duplicar'}</span>
                   </button>

                   <Link
                     href={`/lists/${id}/edit`}
                     className="flex items-center justify-center bg-amber-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
                   >
                     <Edit className="h-4 w-4 mr-1.5 sm:mr-1" />
                     <span className="text-sm sm:text-base">Editar</span>
                   </Link>
                   <button
                     onClick={handleDeleteList}
                     disabled={deleting}
                     className="flex items-center justify-center bg-red-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-red-600 active:bg-red-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0 disabled:opacity-50"
                   >
                     {deleting ? (
                       <RefreshCw className="h-4 w-4 mr-1.5 sm:mr-1 animate-spin" />
                     ) : (
                       <Trash2 className="h-4 w-4 mr-1.5 sm:mr-1" />
                     )}
                     <span className="text-sm sm:text-base">{deleting ? 'A eliminar...' : 'Eliminar'}</span>
                   </button>
                 </>
               )}
           </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{list.name}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{list.description}</p>
          
           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2 sm:gap-0">
             <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
               <span>
                 {restaurants.length} restaurantes • Criada em {new Date(list.created_at).toLocaleDateString('pt-PT')}
               </span>
               
               {/* Privacy indicator */}
               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                 list.is_public !== false 
                   ? 'bg-green-100 text-green-700' 
                   : 'bg-red-100 text-red-700'
               }`}>
                 {list.is_public !== false ? (
                   <><Globe className="h-3 w-3" /> Pública</>
                 ) : (
                   <><Lock className="h-3 w-3" /> Privada</>
                 )}
               </span>
               
               {/* Filter indicator */}
               {list.filters && (
                 <button
                   onClick={applyFilters}
                   disabled={applyingFilters}
                   className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                 >
                   {applyingFilters ? (
                     <><RefreshCw className="h-3 w-3 animate-spin" /> A aplicar...</>
                   ) : (
                     <>Com filtros</>
                   )}
                 </button>
               )}
             </div>
             
             {list.creator && (
               <div className="flex items-center text-xs sm:text-sm text-gray-500">
                 <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                 Criada por: {list.creator}
               </div>
             )}
           </div>
        </div>
        
         {/* Statistics Section - Collapsible */}
         {restaurants.length > 0 && (
           <div className="mb-4 sm:mb-6 lg:mb-8">
             <button
               onClick={() => setShowStatistics(!showStatistics)}
               className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors"
             >
               <BarChart3 className="h-5 w-5" />
               <span>Estatísticas</span>
               <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showStatistics ? 'rotate-180' : ''}`} />
             </button>
             {showStatistics && (
               <div className="mt-4">
                 <ListStatistics restaurants={restaurants} />
               </div>
             )}
           </div>
         )}

         <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Restaurantes nesta lista</h2>
         
         {restaurants.length === 0 ? (
           <p className="text-gray-500 text-sm sm:text-base">Não há restaurantes nesta lista.</p>
         ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
             {restaurants.map(restaurant => (
               <RestaurantCard 
                 key={restaurant.id} 
                 restaurant={restaurant} 
               />
             ))}
           </div>
          )}

          {/* Export Section */}
          {restaurants.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Exportar Lista</h3>
              <ListExportButtons list={list} restaurants={restaurants} />
            </div>
          )}

          {/* Collaborators Section - Only for owner */}
          {user?.id === list.creator_id && (
            <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <ListCollaborators
                listId={id as string}
                isOwner={true}
              />
            </div>
          )}

          {/* Comments Section - Only for public lists */}
          {list.is_public && (
            <div className="mt-6 sm:mt-8">
              <ListComments
                listId={id as string}
                isOwner={user?.id === list.creator_id}
              />
            </div>
          )}
         </div>
       
       {/* Roulette Modal */}
       {showRoulette && (
         <RestaurantRoulette 
           restaurants={restaurants} 
           onClose={() => setShowRoulette(false)} 
         />
       )}
     </div>
   );
 }

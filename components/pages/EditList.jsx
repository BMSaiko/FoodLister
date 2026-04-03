// components/pages/EditList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/ui/navigation/Navbar';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Search, Globe, Lock, Filter } from 'lucide-react';

// Componente de proteção de autenticação
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Você precisa estar logado para editar listas.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base",
        bodyClassName: "text-sm sm:text-base"
      });
      router.push('/auth/signin');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return children;
}

export default function EditList({ listId }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [creationMode, setCreationMode] = useState('manual'); // 'manual' or 'filters'
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    cuisineTypes: [],
    priceRange: [0, 100],
    minRating: 0,
    features: [],
    dietaryOptions: []
  });
  const [filterPreview, setFilterPreview] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Filter options state
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);

  const supabase = createClient();


  
  // Fetch list data and its restaurants
  useEffect(() => {
    async function fetchList() {
      if (!listId) return;
      
      try {
        setLoading(true);
        
        // Fetch list details with proper error handling
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId);
          
        if (listError) throw listError;
        
        // Check if we got data back and handle case where list wasn't found
        if (!listData || listData.length === 0) {
          setError('Lista não encontrada.');
          setLoading(false);
          return;
        }
        
        // Use first item instead of .single() to avoid potential errors
        const list = listData[0];
        
        setFormData({
          name: list.name,
          description: list.description || '',
          isPublic: list.is_public !== false // Default to true if not set
        });
        
        // If list has filters, load them
        if (list.filters) {
          setFilters(list.filters);
          setCreationMode('filters');
        }
        
        // Fetch restaurants in this list
        const { data: listRestaurantsData, error: relError } = await supabase
          .from('list_restaurants')
          .select('restaurant_id')
          .eq('list_id', listId);
          
        if (relError) throw relError;
        
        if (listRestaurantsData && listRestaurantsData.length > 0) {
          const restaurantIds = listRestaurantsData.map(item => item.restaurant_id);
          
          // Fetch restaurant details with proper error handling
          const { data: restaurantDetails, error: restaurantError } = await supabase
            .from('restaurants')
            .select('*')
            .in('id', restaurantIds);
            
          if (restaurantError) throw restaurantError;
          
          if (restaurantDetails) {
            setSelectedRestaurants(restaurantDetails);
          }
        }
      } catch (err) {
        console.error('Error fetching list:', err);
        setError('Erro ao carregar detalhes da lista: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchList();
  }, [listId]);
  
  // Fetch filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      const { data: cuisines } = await supabase.from('cuisine_types').select('*');
      const { data: feats } = await supabase.from('restaurant_features').select('*');
      const { data: diets } = await supabase.from('restaurant_dietary_options').select('*');
      
      if (cuisines) setCuisineTypes(cuisines);
      if (feats) setFeatures(feats);
      if (diets) setDietaryOptions(diets);
    }
    
    fetchFilterOptions();
  }, []);

  // Fetch restaurants matching filters for preview
  useEffect(() => {
    if (creationMode !== 'filters') return;
    
    async function fetchFilteredRestaurants() {
      setLoadingPreview(true);
      try {
        let query = supabase.from('restaurants').select('*');
        
        if (filters.cuisineTypes.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_cuisine_types')
            .select('restaurant_id')
            .in('cuisine_type_id', filters.cuisineTypes);
          
          if (junctionData && junctionData.length > 0) {
            const restaurantIds = [...new Set(junctionData.map(j => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        if (filters.features.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_restaurant_features')
            .select('restaurant_id')
            .in('feature_id', filters.features);
          
          if (junctionData && junctionData.length > 0) {
            const restaurantIds = [...new Set(junctionData.map(j => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        if (filters.dietaryOptions.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_dietary_options_junction')
            .select('restaurant_id')
            .in('dietary_option_id', filters.dietaryOptions);
          
          if (junctionData && junctionData.length > 0) {
            const restaurantIds = [...new Set(junctionData.map(j => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        query = query.gte('price_per_person', filters.priceRange[0])
                     .lte('price_per_person', filters.priceRange[1])
                     .gte('rating', filters.minRating);
        
        const { data, error } = await query;
        
        if (!error && data) {
          setFilterPreview(data);
          // Auto-select all filtered restaurants
          setSelectedRestaurants(data);
        }
      } catch (err) {
        console.error('Error fetching filtered restaurants:', err);
      } finally {
        setLoadingPreview(false);
      }
    }
    
    fetchFilteredRestaurants();
  }, [filters, creationMode]);

  // Fetch all restaurants for selection
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          setRestaurants(data);
        }
      } catch (err) {
        console.error('Error fetching all restaurants:', err);
        // We don't set the main error state here to avoid blocking the form
        // but we could show a notification or a separate error message
      }
    }
    
    fetchRestaurants();
  }, []);
  
  // Filter restaurants based on search query and exclude already selected ones
  useEffect(() => {
    // First filter out already selected restaurants
    const availableRestaurants = restaurants.filter(restaurant => 
      !selectedRestaurants.some(selected => selected.id === restaurant.id)
    );
    
    // Then apply search filter if there's a query
    if (searchQuery === '') {
      setFilteredRestaurants(availableRestaurants);
    } else {
      const filtered = availableRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants, selectedRestaurants]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addRestaurant = (restaurant) => {
    if (!selectedRestaurants.some(r => r.id === restaurant.id)) {
      setSelectedRestaurants([...selectedRestaurants, restaurant]);
    }
  };
  
  const removeRestaurant = (restaurantId) => {
    setSelectedRestaurants(selectedRestaurants.filter(r => r.id !== restaurantId));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.name) {
      setError('Por favor, preencha o nome da lista.');
      return;
    }
    
    setSaving(true);
    
    try {
      // Build update data
      const updateData = {
        name: formData.name,
        description: formData.description,
        is_public: formData.isPublic
      };
      
      // If using filter mode, save the filters
      if (creationMode === 'filters') {
        updateData.filters = filters;
      } else {
        // Clear filters if switching to manual
        updateData.filters = null;
      }
      
      // Update the list data
      const { error: updateError } = await supabase
        .from('lists')
        .update(updateData)
        .eq('id', listId);
      
      if (updateError) {
        console.error('Error updating list:', updateError);
        throw updateError;
      }
      
      // Get current restaurant relations
      const { data: currentRelations, error: relError } = await supabase
        .from('list_restaurants')
        .select('restaurant_id')
        .eq('list_id', listId);
      
      if (relError) throw relError;
      
      // Convert to array of ids for easier comparison
      const currentRestaurantIds = currentRelations.map(rel => rel.restaurant_id);
      const newRestaurantIds = selectedRestaurants.map(r => r.id);
      
      // Restaurants to remove (in current but not in new)
      const restaurantsToRemove = currentRestaurantIds.filter(
        id => !newRestaurantIds.includes(id)
      );
      
      // Restaurants to add (in new but not in current)
      const restaurantsToAdd = newRestaurantIds.filter(
        id => !currentRestaurantIds.includes(id)
      );
      
      // Remove restaurants that are no longer in the list
      if (restaurantsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('list_restaurants')
          .delete()
          .eq('list_id', listId)
          .in('restaurant_id', restaurantsToRemove);
        
        if (removeError) throw removeError;
      }
      
      // Add new restaurants to the list
      if (restaurantsToAdd.length > 0) {
        const newRelations = restaurantsToAdd.map(restaurantId => ({
          list_id: listId,
          restaurant_id: restaurantId
        }));
        
        const { error: addError } = await supabase
          .from('list_restaurants')
          .insert(newRelations);
        
        if (addError) throw addError;
      }
      
      // Redirect back to the list details page
      router.push(`/lists/${listId}`);
    } catch (err) {
      console.error('Error updating list:', err);

      // Specific message for RLS error
      if (err.code === '42501' || err.message?.includes('row-level security policy')) {
        setError('Erro de permissão: O usuário atual não tem permissões para editar listas. Verifique as políticas de segurança no Supabase.');
      } else {
        setError('Erro ao atualizar lista. Por favor, tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  const toggleFilter = (category, id) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [category]: updated };
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href={`/lists/${listId}`} className="flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes da Lista
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Lista</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
           <form onSubmit={handleSubmit}>
             <div className="mb-4">
               <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                 Nome da Lista *
               </label>
               <input
                 type="text"
                 id="name"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                 required
               />
             </div>
             
             <div className="mb-4">
               <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                 Descrição
               </label>
               <textarea
                 id="description"
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 rows={3}
                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
               />
             </div>
             
             {/* Public/Private Toggle */}
             <div className="mb-6">
               <label className="block text-gray-700 font-medium mb-2">
                 Visibilidade
               </label>
               <div className="flex gap-4">
                 <button
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                   className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${
                     formData.isPublic 
                       ? 'border-amber-500 bg-amber-50 text-amber-700' 
                       : 'border-gray-200 text-gray-500 hover:border-gray-300'
                   }`}
                 >
                   <Globe className="h-5 w-5" />
                   <span>Pública</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                   className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${
                     !formData.isPublic 
                       ? 'border-amber-500 bg-amber-50 text-amber-700' 
                       : 'border-gray-200 text-gray-500 hover:border-gray-300'
                   }`}
                 >
                   <Lock className="h-5 w-5" />
                   <span>Privada</span>
                 </button>
               </div>
               <p className="text-xs text-gray-500 mt-2">
                 {formData.isPublic 
                   ? 'Qualquer pessoa pode ver esta lista' 
                   : 'Apenas você pode ver esta lista'}
               </p>
             </div>
             
             {/* Creation Mode Selection */}
             <div className="mb-6">
               <label className="block text-gray-700 font-medium mb-2">
                 Como adicionar restaurantes?
               </label>
               <div className="flex gap-4">
                 <button
                   type="button"
                   onClick={() => {
                     setCreationMode('manual');
                     setSelectedRestaurants([]);
                   }}
                   className={`flex-1 p-3 rounded-md border-2 transition-colors ${
                     creationMode === 'manual'
                       ? 'border-amber-500 bg-amber-50 text-amber-700'
                       : 'border-gray-200 text-gray-500 hover:border-gray-300'
                   }`}
                 >
                   Seleção Manual
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     setCreationMode('filters');
                     setSelectedRestaurants([]);
                   }}
                   className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${
                     creationMode === 'filters'
                       ? 'border-amber-500 bg-amber-50 text-amber-700'
                       : 'border-gray-200 text-gray-500 hover:border-gray-300'
                   }`}
                 >
                   <Filter className="h-5 w-5" />
                   Usar Filtros
                 </button>
               </div>
             </div>
             
             {creationMode === 'manual' ? (
               /* Manual Selection Mode */
               <div className="mb-6">
                 <label className="block text-gray-700 font-medium mb-2">
                   Gerenciar Restaurantes
                 </label>
                 
                 <div className="relative mb-4">
                   <input
                     type="text"
                     placeholder="Procurar restaurantes..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                   />
                   <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                 </div>
                 
                 <div className="mb-4 max-h-36 sm:max-h-48 overflow-y-auto bg-gray-50 rounded-md border border-gray-200">
                   {filteredRestaurants.length > 0 ? (
                     <ul className="divide-y divide-gray-200">
                       {filteredRestaurants.map(restaurant => (
                         <li 
                           key={restaurant.id} 
                           className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                           onClick={() => addRestaurant(restaurant)}
                         >
                           <div className="pr-2">
                             <div className="font-medium text-sm sm:text-base line-clamp-1">{restaurant.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{restaurant.price_per_person != null ? `€${restaurant.price_per_person.toFixed(2)}` : '€--'} • {restaurant.rating != null ? `${restaurant.rating.toFixed(1)}★` : '--★'}</div>
                           </div>
                           <Plus className="h-5 w-5 text-amber-600 flex-shrink-0" />
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <div className="p-4 text-center text-gray-500 text-sm">
                       Nenhum restaurante encontrado
                     </div>
                   )}
                 </div>
               </div>
             ) : (
               /* Filter Mode */
               <div className="mb-6 space-y-4">
                 <label className="block text-gray-700 font-medium mb-2">
                   Filtros
                 </label>
                 
                 {/* Cuisine Types */}
                 <div>
                   <h4 className="text-sm font-medium text-gray-600 mb-2">Tipo de Cozinha</h4>
                   <div className="flex flex-wrap gap-2">
                     {cuisineTypes.map(ct => (
                       <button
                         key={ct.id}
                         type="button"
                         onClick={() => toggleFilter('cuisineTypes', ct.id)}
                         className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                           filters.cuisineTypes.includes(ct.id)
                             ? 'bg-amber-500 text-white border-amber-500'
                             : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                         }`}
                       >
                         {ct.name}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 {/* Price Range */}
                 <div>
                   <h4 className="text-sm font-medium text-gray-600 mb-2">
                     Preço por Pessoa: €{filters.priceRange[0]} - €{filters.priceRange[1]}
                   </h4>
                   <div className="flex gap-4">
                     <input
                       type="range"
                       min="0"
                       max="100"
                       value={filters.priceRange[0]}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         priceRange: [parseInt(e.target.value), prev.priceRange[1]] 
                       }))}
                       className="flex-1 accent-amber-500"
                     />
                     <input
                       type="range"
                       min="0"
                       max="100"
                       value={filters.priceRange[1]}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         priceRange: [prev.priceRange[0], parseInt(e.target.value)] 
                       }))}
                       className="flex-1 accent-amber-500"
                     />
                   </div>
                 </div>
                 
                 {/* Minimum Rating */}
                 <div>
                   <h4 className="text-sm font-medium text-gray-600 mb-2">
                     Avaliação Mínima: {filters.minRating}★
                   </h4>
                   <input
                     type="range"
                     min="0"
                     max="5"
                     step="0.5"
                     value={filters.minRating}
                     onChange={(e) => setFilters(prev => ({ 
                       ...prev, 
                       minRating: parseFloat(e.target.value) 
                     }))}
                     className="w-full accent-amber-500"
                   />
                 </div>
                 
                 {/* Features */}
                 <div>
                   <h4 className="text-sm font-medium text-gray-600 mb-2">Características</h4>
                   <div className="flex flex-wrap gap-2">
                     {features.map(f => (
                       <button
                         key={f.id}
                         type="button"
                         onClick={() => toggleFilter('features', f.id)}
                         className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                           filters.features.includes(f.id)
                             ? 'bg-amber-500 text-white border-amber-500'
                             : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                         }`}
                       >
                         {f.name}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 {/* Dietary Options */}
                 <div>
                   <h4 className="text-sm font-medium text-gray-600 mb-2">Opções Dietéticas</h4>
                   <div className="flex flex-wrap gap-2">
                     {dietaryOptions.map((opt) => (
                       <button
                         key={opt.id}
                         type="button"
                         onClick={() => toggleFilter('dietaryOptions', opt.id)}
                         className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                           filters.dietaryOptions.includes(opt.id)
                             ? 'bg-amber-500 text-white border-amber-500'
                             : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                         }`}
                       >
                         {opt.name}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 {/* Filter Preview */}
                 <div className="mt-4 p-4 bg-gray-50 rounded-md">
                   <h4 className="text-sm font-medium text-gray-700 mb-2">
                     Restaurantes Encontrados: {loadingPreview ? '...' : filterPreview.length}
                   </h4>
                   {loadingPreview ? (
                     <div className="flex items-center gap-2 text-gray-500">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                       <span className="text-sm">A carregar...</span>
                     </div>
                   ) : filterPreview.length > 0 ? (
                     <div className="max-h-32 overflow-y-auto space-y-1">
                       {filterPreview.slice(0, 5).map(r => (
                         <div key={r.id} className="text-sm text-gray-600">
                           {r.name} - €{r.price_per_person?.toFixed(2)} • {r.rating?.toFixed(1)}★
                         </div>
                       ))}
                       {filterPreview.length > 5 && (
                         <div className="text-xs text-gray-400">
                           +{filterPreview.length - 5} mais restaurantes
                         </div>
                       )}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500">Nenhum restaurante corresponde aos filtros selecionados</p>
                   )}
                 </div>
               </div>
             )}
             
             {/* Selected Restaurants */}
             <div className="mb-6">
               <h3 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">
                 Restaurantes Selecionados ({selectedRestaurants.length})
               </h3>
               {selectedRestaurants.length > 0 ? (
                 <ul className="space-y-2 max-h-40 overflow-y-auto">
                   {selectedRestaurants.map(restaurant => (
                     <li key={restaurant.id} className="flex justify-between items-center bg-amber-50 p-2 sm:p-3 rounded-md">
                       <span className="text-sm line-clamp-1 mr-2">{restaurant.name}</span>
                       <button
                         type="button"
                         onClick={() => removeRestaurant(restaurant.id)}
                         className="text-gray-500 hover:text-red-500 flex-shrink-0"
                         aria-label="Remover restaurante"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-gray-500 text-xs sm:text-sm">
                   {creationMode === 'manual' 
                     ? 'Clique nos restaurantes acima para adicionar' 
                     : 'Ajuste os filtros para encontrar restaurantes'}
                 </p>
               )}
             </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push(`/lists/${listId}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
              >
                Cancelar
              </button>
               <button
                 type="submit"
                 className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                 disabled={saving}
               >
                 {saving ? 'Salvando...' : 'Salvar Alterações'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

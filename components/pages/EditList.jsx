// components/pages/EditList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';

export default function EditList({ listId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  
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
          description: list.description || ''
        });
        
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
      // Update the list data
      const { error: updateError } = await supabase
        .from('lists')
        .update({
          name: formData.name,
          description: formData.description
        })
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
        setError('Erro ao atualizar lista: ' + (err.message || 'Por favor, tente novamente.'));
      }
    } finally {
      setSaving(false);
    }
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                          <div className="text-xs sm:text-sm text-gray-500">€{restaurant.price_per_person.toFixed(2)} • {restaurant.rating.toFixed(1)}★</div>
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
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Restaurantes Selecionados ({selectedRestaurants.length})</h3>
                {selectedRestaurants.length > 0 ? (
                  <ul className="space-y-2">
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
                  <p className="text-gray-500 text-xs sm:text-sm">Nenhum restaurante selecionado</p>
                )}
              </div>
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
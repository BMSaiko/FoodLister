// components/pages/EditList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'libs/supabase/client';
import { useAuth } from 'contexts';
import Navbar from 'components/ui/navigation/Navbar';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { VisibilityToggle, SelectedRestaurants } from 'components/ui/lists/ListFormFields';

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Você precisa estar logado para editar listas.', { position: "top-center", autoClose: 3000, theme: "light" });
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}

export default function EditList({ listId }) {
  return (
    <AuthGuard>
      <EditListContent listId={listId} />
    </AuthGuard>
  );
}

function EditListContent({ listId }) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch list data and its restaurants
  useEffect(() => {
    async function fetchList() {
      if (!listId) return;
      
      try {
        setLoading(true);
        
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId);
          
        if (listError) throw listError;
        
        if (!listData || listData.length === 0) {
          setError('Lista não encontrada.');
          setLoading(false);
          return;
        }
        
        const list = listData[0];
        
        setFormData({
          name: list.name,
          description: list.description || '',
          isPublic: list.is_public !== false
        });
        
        // Fetch restaurants in this list
        const { data: listRestaurantsData, error: relError } = await supabase
          .from('list_restaurants')
          .select('restaurant_id')
          .eq('list_id', listId);
          
        if (relError) throw relError;
        
        if (listRestaurantsData && listRestaurantsData.length > 0) {
          const restaurantIds = listRestaurantsData.map(item => item.restaurant_id);
          
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

  // Fetch all restaurants for manual selection
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data, error } = await supabase.from('restaurants').select('*');
        if (!error && data) {
          setRestaurants(data);
        }
      } catch (err) {
        console.error('Error fetching all restaurants:', err);
      }
    }
    
    fetchRestaurants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    if (!formData.name) {
      setError('Por favor, preencha o nome da lista.');
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        is_public: formData.isPublic
      };
      
      const { error: updateError } = await supabase
        .from('lists')
        .update(updateData)
        .eq('id', listId);
      
      if (updateError) throw updateError;
      
      // Get current restaurant relations
      const { data: currentRelations, error: relError } = await supabase
        .from('list_restaurants')
        .select('restaurant_id')
        .eq('list_id', listId);
      
      if (relError) throw relError;
      
      const currentRestaurantIds = currentRelations.map(rel => rel.restaurant_id);
      const newRestaurantIds = selectedRestaurants.map(r => r.id);
      
      // Remove restaurants no longer in the list
      const restaurantsToRemove = currentRestaurantIds.filter(id => !newRestaurantIds.includes(id));
      if (restaurantsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('list_restaurants')
          .delete()
          .eq('list_id', listId)
          .in('restaurant_id', restaurantsToRemove);
        
        if (removeError) throw removeError;
      }
      
      // Add new restaurants
      const restaurantsToAdd = newRestaurantIds.filter(id => !currentRestaurantIds.includes(id));
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
      
      toast.success('Lista atualizada com sucesso!', { position: "top-center", autoClose: 3000, theme: "light" });
      router.push(`/lists/${listId}`);
    } catch (err) {
      console.error('Error updating list:', err);
      if (err.code === '42501' || err.message?.includes('row-level security policy')) {
        setError('Erro de permissão: O usuário atual não tem permissões para editar listas.');
      } else {
        setError('Erro ao atualizar lista. Por favor, tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href={`/lists/${listId}`} className="inline-flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes da Lista
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-2xl font-bold text-white">Editar Lista</h1>
            <p className="text-amber-100 text-sm mt-1">Atualize os detalhes e restaurantes da sua lista</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
                {error}
              </div>
            )}
            
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Nome da Lista *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                required
              />
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Visibility Toggle */}
            <VisibilityToggle 
              isPublic={formData.isPublic} 
              onChange={(isPublic) => setFormData(prev => ({ ...prev, isPublic }))} 
            />
            
            {/* Content based on mode */}
            <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Buscar Restaurantes</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
                  {restaurants.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {restaurants
                        .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .filter(r => !selectedRestaurants.some(s => s.id === r.id))
                        .slice(0, 20)
                        .map(restaurant => (
                          <li
                            key={restaurant.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{restaurant.name}</p>
                              {restaurant.location && (
                                <p className="text-sm text-gray-500 truncate">{restaurant.location}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => addRestaurant(restaurant)}
                              className="ml-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                            >
                              Adicionar
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-center text-gray-500">Nenhum restaurante disponível</p>
                  )}
                </div>
              </div>
            
            {/* Selected Restaurants */}
            <SelectedRestaurants 
              restaurants={selectedRestaurants} 
              onRemove={removeRestaurant} 
            />
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/lists/${listId}`)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
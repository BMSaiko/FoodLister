// components/pages/CreateList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/ui/navigation/Navbar';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useListFilters } from '@/hooks/lists/useListFilters';
import {
  VisibilityToggle,
  ModeSelector,
  FilterChips,
  PriceRangeSlider,
  RatingSlider,
  RestaurantSearch,
  SelectedRestaurants,
  FilterPreview
} from '@/components/ui/lists/ListFormFields';

export default function CreateList() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [creationMode, setCreationMode] = useState('manual');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    filters,
    filterOptions,
    filterPreview,
    loadingPreview,
    toggleFilter,
    updatePriceRange,
    updateMinRating
  } = useListFilters();

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Você precisa estar logado para criar listas.', {
        position: "top-center",
        autoClose: 3000,
        theme: "light"
      });
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Fetch all restaurants for manual selection
  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (!error && data) {
        setRestaurants(data);
      }
    }
    fetchRestaurants();
  }, []);

  // Auto-select all filtered restaurants when in filter mode
  useEffect(() => {
    if (creationMode === 'filters' && filterPreview.length > 0) {
      setSelectedRestaurants(filterPreview);
    }
  }, [filterPreview, creationMode]);

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

    if (!user) {
      toast.error('Você precisa estar logado para criar uma lista.', { position: "top-center", autoClose: 4000, theme: "light" });
      router.push('/auth/signin');
      return;
    }

    if (!formData.name) {
      toast.error('Por favor, preencha o nome da lista.', { position: "top-center", autoClose: 4000, theme: "light" });
      return;
    }

    setLoading(true);

    try {
      // Get user display name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const displayName = profileData?.display_name || user.email;

      // Create the list
      const listDataToInsert = {
        name: formData.name,
        description: formData.description || '',
        creator_id: user.id,
        creator_name: displayName,
        is_public: formData.isPublic
      };

      if (creationMode === 'filters') {
        listDataToInsert.filters = filters;
      }

      const { data: listData, error: listError } = await supabase
        .from('lists')
        .insert([listDataToInsert])
        .select();

      if (listError) throw listError;

      const listId = listData[0].id;

      // Add restaurants to the list
      if (selectedRestaurants.length > 0) {
        const restaurantRelations = selectedRestaurants.map(restaurant => ({
          list_id: listId,
          restaurant_id: restaurant.id
        }));

        const { error: relationError } = await supabase
          .from('list_restaurants')
          .insert(restaurantRelations);

        if (relationError) throw relationError;
      }

      toast.success('Lista criada com sucesso!', { position: "top-center", autoClose: 3000, theme: "light" });
      router.push(`/lists/${listId}`);
    } catch (err) {
      console.error('Error creating list:', err);
      toast.error('Erro ao criar lista. Por favor, tente novamente.', { position: "top-center", autoClose: 5000, theme: "light" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href="/lists" className="inline-flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Listas
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-2xl font-bold text-white">Criar Nova Lista</h1>
            <p className="text-amber-100 text-sm mt-1">Adicione seus restaurantes favoritos a uma lista personalizada</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
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
                placeholder="Ex: Melhores restaurantes italianos"
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
                placeholder="Descreva o tema desta lista..."
              />
            </div>
            
            {/* Visibility Toggle */}
            <VisibilityToggle 
              isPublic={formData.isPublic} 
              onChange={(isPublic) => setFormData(prev => ({ ...prev, isPublic }))} 
            />
            
            {/* Mode Selector */}
            <ModeSelector 
              mode={creationMode} 
              onChange={(mode) => {
                setCreationMode(mode);
                setSelectedRestaurants([]);
              }} 
            />
            
            {/* Content based on mode */}
            {creationMode === 'manual' ? (
              <div className="mb-6">
                <RestaurantSearch
                  restaurants={restaurants}
                  selectedRestaurants={selectedRestaurants}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onAdd={addRestaurant}
                />
              </div>
            ) : (
              <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-xl">
                <FilterChips
                  options={filterOptions.cuisineTypes}
                  selected={filters.cuisineTypes}
                  onToggle={(id) => toggleFilter('cuisineTypes', id)}
                  title="Tipo de Cozinha"
                />
                <PriceRangeSlider value={filters.priceRange} onChange={updatePriceRange} />
                <RatingSlider value={filters.minRating} onChange={updateMinRating} />
                <FilterChips
                  options={filterOptions.features}
                  selected={filters.features}
                  onToggle={(id) => toggleFilter('features', id)}
                  title="Características"
                />
                <FilterChips
                  options={filterOptions.dietaryOptions}
                  selected={filters.dietaryOptions}
                  onToggle={(id) => toggleFilter('dietaryOptions', id)}
                  title="Opções Dietéticas"
                />
                <FilterPreview restaurants={filterPreview} loading={loadingPreview} />
              </div>
            )}
            
            {/* Selected Restaurants */}
            <SelectedRestaurants 
              restaurants={selectedRestaurants} 
              onRemove={removeRestaurant} 
            />
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/lists')}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Criar Lista</span>
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
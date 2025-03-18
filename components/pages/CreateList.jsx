// components/pages/CreateList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { useCreatorName } from '@/hooks/useCreatorName';

export default function CreateList() {
  const router = useRouter();
  const { creatorName } = useCreatorName();
  const [loading, setLoading] = useState(false);
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
  
  // Fetch all restaurants for selection
  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
        
      if (!error && data) {
        setRestaurants(data);
        setFilteredRestaurants(data);
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
    
    setLoading(true);
    
    try {
      // Create the list first
      const { data: listData, error: listError } = await supabase
        .from('lists')
        .insert([
          {
            name: formData.name,
            description: formData.description || '',
            creator: creatorName || 'Anônimo'
          }
        ])
        .select();
      
      if (listError) {
        throw listError;
      }
      
      const listId = listData[0].id;
      
      // If there are selected restaurants, add them to the list
      if (selectedRestaurants.length > 0) {
        const restaurantRelations = selectedRestaurants.map(restaurant => ({
          list_id: listId,
          restaurant_id: restaurant.id
        }));
        
        const { error: relationError } = await supabase
          .from('list_restaurants')
          .insert(restaurantRelations);
        
        if (relationError) {
          throw relationError;
        }
      }
      
      // Redirect to the new list's page
      router.push(`/lists/${listId}`);
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Erro ao criar lista. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/lists" className="flex items-center text-amber-600 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Listas
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Criar Nova Lista</h1>
          
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Adicionar Restaurantes
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
              
              <div className="mb-4 max-h-48 overflow-y-auto bg-gray-50 rounded-md border border-gray-200">
                {filteredRestaurants.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredRestaurants.map(restaurant => (
                      <li 
                        key={restaurant.id} 
                        className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        onClick={() => addRestaurant(restaurant)}
                      >
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">€{restaurant.price_per_person.toFixed(2)} • {restaurant.rating.toFixed(1)}★</div>
                        </div>
                        <Plus className="h-5 w-5 text-amber-600" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum restaurante encontrado
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Restaurantes Selecionados ({selectedRestaurants.length})</h3>
                {selectedRestaurants.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedRestaurants.map(restaurant => (
                      <li key={restaurant.id} className="flex justify-between items-center bg-amber-50 p-3 rounded-md">
                        <span>{restaurant.name}</span>
                        <button
                          type="button"
                          onClick={() => removeRestaurant(restaurant.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum restaurante selecionado</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/lists')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Criar Lista'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
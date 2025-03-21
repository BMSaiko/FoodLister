// components/pages/CreateRestaurant.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check, Tag, Search, Plus, X } from 'lucide-react';
import { useCreatorName } from '@/hooks/useCreatorName';

export default function CreateRestaurant() {
  const router = useRouter();
  const { creatorName } = useCreatorName();
  const [loading, setLoading] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loadingCuisineTypes, setLoadingCuisineTypes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_per_person: '',
    rating: '4.0',
    location: '',
    source_url: '',
    menu_url: '',
    visited: false,
    selectedCuisineTypes: []
  });
  
  const [error, setError] = useState('');
  
  const supabase = createClient();
  
  // Carregar tipos de cozinha do banco de dados
  useEffect(() => {
    async function fetchCuisineTypes() {
      try {
        setLoadingCuisineTypes(true);
        const { data, error } = await supabase
          .from('cuisine_types')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Erro ao buscar tipos de cozinha:', error);
        } else {
          setCuisineTypes(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar tipos de cozinha:', err);
      } finally {
        setLoadingCuisineTypes(false);
      }
    }
    
    fetchCuisineTypes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const toggleCuisineType = (cuisineTypeId) => {
    setFormData(prev => {
      const isSelected = prev.selectedCuisineTypes.includes(cuisineTypeId);
      
      if (isSelected) {
        // Remove o tipo selecionado
        return {
          ...prev,
          selectedCuisineTypes: prev.selectedCuisineTypes.filter(id => id !== cuisineTypeId)
        };
      } else {
        // Adiciona o tipo selecionado
        return {
          ...prev,
          selectedCuisineTypes: [...prev.selectedCuisineTypes, cuisineTypeId]
        };
      }
    });
  };
  
  // Filtra os tipos de cozinha com base no texto de pesquisa
  const filteredCuisineTypes = cuisineTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Retorna apenas os tipos selecionados na ordem original
  const selectedCuisineTypesInOrder = cuisineTypes.filter(type => 
    formData.selectedCuisineTypes.includes(type.id)
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.name || !formData.description || !formData.price_per_person) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    // Convert price and rating to numbers
    const priceAsNumber = parseFloat(formData.price_per_person);
    const ratingAsNumber = parseFloat(formData.rating);
    
    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      setError('O preço deve ser um número positivo.');
      return;
    }
    
    if (isNaN(ratingAsNumber) || ratingAsNumber < 0 || ratingAsNumber > 5) {
      setError('A avaliação deve ser um número entre 0 e 5.');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Criar o restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url || '/placeholder-restaurant.jpg',
            price_per_person: priceAsNumber,
            rating: ratingAsNumber,
            location: formData.location || '',
            source_url: formData.source_url || '',
            creator: creatorName || 'Anônimo',
            menu_url: formData.menu_url || '',
            visited: formData.visited
          }
        ])
        .select();
      
      if (restaurantError) {
        throw restaurantError;
      }
      
      // 2. Se houver tipos de cozinha selecionados, criar os relacionamentos
      if (formData.selectedCuisineTypes.length > 0 && restaurantData && restaurantData[0]) {
        const restaurantId = restaurantData[0].id;
        
        const cuisineRelations = formData.selectedCuisineTypes.map(cuisineTypeId => ({
          restaurant_id: restaurantId,
          cuisine_type_id: cuisineTypeId
        }));
        
        const { error: relationError } = await supabase
          .from('restaurant_cuisine_types')
          .insert(cuisineRelations);
        
        if (relationError) {
          console.error('Erro ao adicionar tipos de cozinha:', relationError);
          // Não lançamos o erro aqui para que o usuário ainda seja redirecionado
          // para a página do restaurante
        }
      }
      
      // Redirect to the new restaurant's page
      if (restaurantData && restaurantData[0]) {
        router.push(`/restaurants/${restaurantData[0].id}`);
      } else {
        router.push('/restaurants');
      }
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError('Erro ao criar restaurante. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href="/restaurants" className="flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Restaurantes
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-2xl mx-auto">
   
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Restaurante</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Nome *
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
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            {/* Seção de categorias culinárias */}
            <div className="mb-4">
              <label className="flex items-center text-gray-700 font-medium mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Categorias Culinárias
              </label>
              
              {/* Campo de busca para categorias */}
              <div className="relative mb-2">
                <input 
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              {/* Lista de categorias disponíveis */}
              {loadingCuisineTypes ? (
                <div className="text-center py-4 text-gray-500">Carregando categorias...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
                  {filteredCuisineTypes.length > 0 ? (
                    filteredCuisineTypes.map(cuisineType => (
                      <div 
                        key={cuisineType.id}
                        className={`flex items-center px-2 py-1.5 rounded ${
                          formData.selectedCuisineTypes.includes(cuisineType.id) 
                            ? 'bg-amber-100 border border-amber-300' 
                            : 'bg-white border border-gray-200 hover:bg-gray-100'
                        } cursor-pointer transition-colors`}
                        onClick={() => toggleCuisineType(cuisineType.id)}
                      >
                        <span className="text-sm flex-grow truncate">{cuisineType.name}</span>
                        {formData.selectedCuisineTypes.includes(cuisineType.id) ? (
                          <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Plus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-gray-500 col-span-full">
                      Nenhuma categoria encontrada
                    </div>
                  )}
                </div>
              )}
              
              {/* Categorias selecionadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorias Selecionadas ({formData.selectedCuisineTypes.length})
                </label>
                
                {formData.selectedCuisineTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCuisineTypesInOrder.map(cuisineType => (
                      <div 
                        key={cuisineType.id}
                        className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-full"
                      >
                        <span className="text-sm">{cuisineType.name}</span>
                        <button 
                          type="button"
                          onClick={() => toggleCuisineType(cuisineType.id)}
                          className="ml-1 text-amber-600 hover:text-amber-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Nenhuma categoria selecionada
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="image_url" className="block text-gray-700 font-medium mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Deixe em branco para usar uma imagem padrão</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="price_per_person" className="block text-gray-700 font-medium mb-2">
                Preço por Pessoa (€) *
              </label>
              <input
                type="number"
                id="price_per_person"
                name="price_per_person"
                value={formData.price_per_person}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="rating" className="block text-gray-700 font-medium mb-2">
                Avaliação (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            
            {/* Outros campos */}
            <div className="mb-4">
              <label htmlFor="location" className="flex items-center text-gray-700 font-medium mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Localização
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Endereço ou coordenadas GPS"
              />
              <p className="text-sm text-gray-500 mt-1">Endereço ou coordenadas para abrir no Google Maps</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="source_url" className="flex items-center text-gray-700 font-medium mb-2">
                <Globe className="h-4 w-4 mr-2" />
                Fonte
              </label>
              <input
                type="url"
                id="source_url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://exemplo.com"
              />
              <p className="text-sm text-gray-500 mt-1">Link de onde você encontrou este restaurante</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="menu_url" className="flex items-center text-gray-700 font-medium mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Menu
              </label>
              <input
                type="url"
                id="menu_url"
                name="menu_url"
                value={formData.menu_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://exemplo.com/menu"
              />
              <p className="text-sm text-gray-500 mt-1">Link para o menu do restaurante</p>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center text-gray-700 font-medium">
                <input
                  type="checkbox"
                  name="visited"
                  checked={formData.visited}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-400 mr-2"
                />
                <Check className={`h-4 w-4 mr-2 ${formData.visited ? 'text-amber-500' : 'text-gray-300'}`} />
                Já visitei este restaurante
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push('/restaurants')}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Restaurante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
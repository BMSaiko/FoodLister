// components/pages/CreateRestaurant.jsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check } from 'lucide-react';
import { useCreatorName } from '@/hooks/useCreatorName';

export default function CreateRestaurant() {
  const router = useRouter();
  const { creatorName } = useCreatorName();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_per_person: '',
    rating: '4.0',
    location: '',
    source_url: '',
    menu_url: '',
    visited: false
  });
  
  const [error, setError] = useState('');
  
  const supabase = createClient();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
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
      const { data, error: supabaseError } = await supabase
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
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Redirect to the new restaurant's page
      if (data && data[0]) {
        router.push(`/restaurants/${data[0].id}`);
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
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/restaurants" className="flex items-center text-amber-600 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Restaurantes
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
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
            
            {/* Novos campos */}
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
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/restaurants')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
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
// components/pages/EditRestaurant.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check } from 'lucide-react';

export default function EditRestaurant({ restaurantId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_per_person: '',
    rating: '',
    location: '',
    source_url: '',
    menu_url: '',
    visited: false,
    creator: ''
  });
  
  const [error, setError] = useState('');
  
  const supabase = createClient();
  
  // Fetch restaurant data
  useEffect(() => {
    async function fetchRestaurant() {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        
        // Changed from .single() to regular select with eq() to avoid potential errors
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId);
          
        if (error) throw error;
        
        // Check if we got data back
        if (!data || data.length === 0) {
          setError('Restaurante não encontrado.');
          setLoading(false);
          return;
        }
        
        // Use first item instead of .single()
        const restaurant = data[0];
        
        setFormData({
          name: restaurant.name,
          description: restaurant.description,
          image_url: restaurant.image_url || '',
          price_per_person: restaurant.price_per_person.toString(),
          rating: restaurant.rating.toString(),
          location: restaurant.location || '',
          source_url: restaurant.source_url || '',
          menu_url: restaurant.menu_url || '',
          visited: restaurant.visited || false,
          creator: restaurant.creator || 'Anônimo'
        });
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Erro ao carregar detalhes do restaurante: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurant();
  }, [restaurantId]);
  
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
    
    setSaving(true);
    
    try {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || '/placeholder-restaurant.jpg',
          price_per_person: priceAsNumber,
          rating: ratingAsNumber,
          location: formData.location,
          source_url: formData.source_url,
          menu_url: formData.menu_url,
          visited: formData.visited
          // Não atualizamos o creator para preservar quem criou originalmente
        })
        .eq('id', restaurantId);
      
      if (updateError) {
        console.error('Error updating restaurant:', updateError);
        throw updateError;
      }
      
      // Redirect back to the restaurant details page
      router.push(`/restaurants/${restaurantId}`);
    } catch (err) {
      console.error('Error updating restaurant:', err);
      
      // Specific message for RLS error
      if (err.code === '42501' || err.message?.includes('row-level security policy')) {
        setError('Erro de permissão: O usuário atual não tem permissões para editar restaurantes. Verifique as políticas de segurança no Supabase.');
      } else {
        setError('Erro ao atualizar restaurante: ' + (err.message || 'Por favor, tente novamente.'));
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
      
      <div className="container mx-auto px-4 py-8">
        <Link href={`/restaurants/${restaurantId}`} className="flex items-center text-amber-600 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes do Restaurante
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Restaurante</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-4 text-sm text-gray-500">
            Adicionado por: {formData.creator}
          </div>
          
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
                onClick={() => router.push(`/restaurants/${restaurantId}`)}
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
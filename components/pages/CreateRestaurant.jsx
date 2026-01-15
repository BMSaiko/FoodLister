// components/pages/CreateRestaurant.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import GoogleMapsModal from '@/components/ui/GoogleMapsModal';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import FormActions from '@/components/ui/FormActions';
import CuisineSelector from '@/components/ui/CuisineSelector';
import ImagePreview from '@/components/ui/ImagePreview';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check, Map } from 'lucide-react';
import { useCreatorName } from '@/hooks/useCreatorName';
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';
import { convertImgurUrl } from '@/utils/imgurConverter';

export default function CreateRestaurant() {
  const router = useRouter();
  const { creatorName } = useCreatorName();
  const [loading, setLoading] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loadingCuisineTypes, setLoadingCuisineTypes] = useState(true);
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ' ',
    image_url: '',
    price_per_person: '1',
    rating: '0',
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

  const handleGoogleMapsData = (data) => {
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      location: data.location || prev.location,
      source_url: data.source_url || prev.source_url
    }));
    setGoogleMapsModalOpen(false);
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
      // Converter URL do Imgur se necessário
      const processedImageUrl = convertImgurUrl(formData.image_url) || '/placeholder-restaurant.jpg';
      
      // 1. Criar o restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            image_url: processedImageUrl,
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
      
      <GoogleMapsModal 
        isOpen={googleMapsModalOpen}
        onClose={() => setGoogleMapsModalOpen(false)}
        onSubmit={handleGoogleMapsData}
      />
      
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
            {/* Informações Básicas */}
            <FormSection title="Informações Básicas">
              <div className="space-y-4">
                <FormField
                  label="Nome"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                >
                  <button
                    type="button"
                    onClick={() => setGoogleMapsModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 font-medium whitespace-nowrap transition-all shadow-sm hover:shadow-md"
                    title="Importar informações do Google Maps"
                  >
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Google Maps</span>
                    <span className="sm:hidden">Maps</span>
                  </button>
                </FormField>

                <FormField
                  label="Descrição"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>
            </FormSection>

            {/* Categorias Culinárias */}
            <FormSection title="Categorias Culinárias">
              <CuisineSelector
                cuisineTypes={cuisineTypes}
                selectedCuisineTypes={formData.selectedCuisineTypes}
                onToggleCuisine={toggleCuisineType}
                loading={loadingCuisineTypes}
              />
            </FormSection>

            {/* Imagem */}
            <FormSection title="Imagem do Restaurante">
              <ImagePreview
                imageUrl={formData.image_url}
                onImageUrlChange={(value) => setFormData(prev => ({ ...prev, image_url: value }))}
              />
            </FormSection>

            {/* Avaliações e Preços */}
            <FormSection title="Avaliações e Preços">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Preço por Pessoa (€)"
                  name="price_per_person"
                  type="number"
                  value={formData.price_per_person}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

                <FormField
                  label="Avaliação (0-5)"
                  name="rating"
                  type="number"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </FormSection>

            {/* Informações Adicionais */}
            <FormSection title="Informações Adicionais">
              <div className="space-y-4">
                <FormField
                  label="Localização"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  icon={MapPin}
                  helperText="Endereço ou coordenadas para abrir no Google Maps"
                  placeholder="Endereço ou coordenadas GPS"
                />

                <FormField
                  label="Fonte"
                  name="source_url"
                  type="url"
                  value={formData.source_url}
                  onChange={handleChange}
                  icon={Globe}
                  helperText="Link de onde você encontrou este restaurante"
                  placeholder="https://exemplo.com"
                />

                <FormField
                  label="Menu"
                  name="menu_url"
                  type="url"
                  value={formData.menu_url}
                  onChange={handleChange}
                  icon={FileText}
                  helperText="Link para o menu do restaurante"
                  placeholder="https://exemplo.com/menu"
                />

                <div className="flex items-center space-x-3 py-2">
                  <input
                    type="checkbox"
                    id="visited"
                    name="visited"
                    checked={formData.visited}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="visited" className="flex items-center text-gray-700 font-medium cursor-pointer">
                    <Check className={`h-4 w-4 mr-2 ${formData.visited ? 'text-primary' : 'text-gray-300'}`} />
                    Já visitei este restaurante
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Ações */}
            <FormActions
              onCancel={() => router.push('/restaurants')}
              onSubmit={handleSubmit}
              submitText="Salvar Restaurante"
              loading={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

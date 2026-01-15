// components/pages/EditRestaurant.jsx
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
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';
import { convertImgurUrl } from '@/utils/imgurConverter';

export default function EditRestaurant({ restaurantId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loadingCuisineTypes, setLoadingCuisineTypes] = useState(true);
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
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
    creator: '',
    selectedCuisineTypes: []
  });

  const [error, setError] = useState('');

  const supabase = createClient();

  // Carregar dados do restaurante e categorias
  useEffect(() => {
    async function fetchRestaurantAndCategories() {
      if (!restaurantId) return;

      try {
        setLoading(true);

        // 1. Buscar dados do restaurante
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();

        if (restaurantError) throw restaurantError;

        // 2. Buscar tipos de cozinha relacionados
        const { data: relationData, error: relationError } = await supabase
          .from('restaurant_cuisine_types')
          .select('cuisine_type_id')
          .eq('restaurant_id', restaurantId);

        if (relationError) throw relationError;

        // 3. Buscar todos os tipos de cozinha disponíveis
        const { data: allCuisineTypes, error: cuisineTypesError } = await supabase
          .from('cuisine_types')
          .select('*')
          .order('name');

        if (cuisineTypesError) throw cuisineTypesError;

        // Atualizar estados
        if (restaurantData) {
          setFormData({
            name: restaurantData.name,
            description: restaurantData.description,
            image_url: restaurantData.image_url || '',
            price_per_person: restaurantData.price_per_person.toString(),
            rating: restaurantData.rating.toString(),
            location: restaurantData.location || '',
            source_url: restaurantData.source_url || '',
            menu_url: restaurantData.menu_url || '',
            visited: restaurantData.visited || false,
            creator: restaurantData.creator || 'Anônimo',
            selectedCuisineTypes: relationData ? relationData.map(rel => rel.cuisine_type_id) : []
          });
        }

        setCuisineTypes(allCuisineTypes || []);

      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Erro ao carregar detalhes do restaurante: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
        setLoadingCuisineTypes(false);
      }
    }

    fetchRestaurantAndCategories();
  }, [restaurantId]);

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

    setSaving(true);

    try {
      // Converter URL do Imgur se necessário
      const processedImageUrl = convertImgurUrl(formData.image_url) || '/placeholder-restaurant.jpg';

      // 1. Atualizar dados básicos do restaurante
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          description: formData.description,
          image_url: processedImageUrl,
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
        throw updateError;
      }

      // 2. Atualizar categorias culinárias
      // 2.1 Remover todas as relações existentes
      const { error: deleteError } = await supabase
        .from('restaurant_cuisine_types')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (deleteError) {
        throw deleteError;
      }

      // 2.2 Adicionar as novas relações selecionadas
      if (formData.selectedCuisineTypes.length > 0) {
        const cuisineRelations = formData.selectedCuisineTypes.map(cuisineTypeId => ({
          restaurant_id: restaurantId,
          cuisine_type_id: cuisineTypeId
        }));

        const { error: insertError } = await supabase
          .from('restaurant_cuisine_types')
          .insert(cuisineRelations);

        if (insertError) {
          throw insertError;
        }
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

      <GoogleMapsModal
        isOpen={googleMapsModalOpen}
        onClose={() => setGoogleMapsModalOpen(false)}
        onSubmit={handleGoogleMapsData}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href={`/restaurants/${restaurantId}`} className="flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes do Restaurante
        </Link>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-2xl mx-auto">

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
              onCancel={() => router.push(`/restaurants/${restaurantId}`)}
              onSubmit={handleSubmit}
              submitText="Salvar Alterações"
              loading={saving}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

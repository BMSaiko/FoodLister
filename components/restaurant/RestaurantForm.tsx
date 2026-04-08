"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navigation/Navbar';
import GoogleMapsModal from '@/components/ui/RestaurantDetails/GoogleMapsModal';
import CuisineSelector from '@/components/ui/Filters/CuisineSelector';
import DietaryOptionsSelector from '@/components/ui/Filters/DietaryOptionsSelector';
import FeaturesSelector from '@/components/ui/Filters/FeaturesSelector';
import RestaurantImageManager from '@/components/ui/RestaurantManagement/RestaurantImageManager';
import MenuManager from '@/components/ui/RestaurantManagement/MenuManager';
import FormSection from '@/components/ui/common/FormSection';
import FormField from '@/components/ui/common/FormField';
import MultiplePhoneInput from '@/components/ui/common/MultiplePhoneInput';
import FormActions from '@/components/ui/common/FormActions';
import { ArrowLeft, MapPin, Globe, Map, Save } from 'lucide-react';
import { useRestaurantForm, RestaurantFormData } from '@/hooks/forms/useRestaurantForm';
import Link from 'next/link';

export interface RestaurantFormProps {
  restaurantId?: string;
  backUrl: string;
  backLabel: string;
  onSuccess?: (restaurant: any) => void;
}

export default function RestaurantForm({ restaurantId, backUrl, backLabel, onSuccess }: RestaurantFormProps) {
  const router = useRouter();
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const isEdit = !!restaurantId;

  const {
    formData,
    cuisineTypes,
    dietaryOptions,
    features,
    loading,
    loadingOptions,
    saving,
    handleChange,
    setFieldValue,
    setFormData,
    toggleCuisineType,
    toggleDietaryOption,
    toggleFeature,
    handleGoogleMapsData,
    saveRestaurant
  } = useRestaurantForm({
    restaurantId,
    onSuccess
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveRestaurant(isEdit);
    
    if (result) {
      if (onSuccess) {
        onSuccess(result);
      } else if (isEdit) {
        router.push(backUrl);
      } else {
        router.push(`/restaurants/${result.id}`);
      }
    }
  };

  if (loading || loadingOptions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[var(--background-tertiary)] rounded w-1/2"></div>
              <div className="h-4 bg-[var(--background-tertiary)] rounded w-full"></div>
              <div className="h-4 bg-[var(--background-tertiary)] rounded w-3/4"></div>
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
        <Link href={backUrl} className="flex items-center text-primary mb-4 sm:mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {isEdit ? 'Editar Restaurante' : 'Adicionar Novo Restaurante'}
          </h1>

          {isEdit && formData.creator && (
            <div className="mb-4 text-sm text-gray-500">
              Adicionado por: {formData.creator}
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
                  </button>
                </FormField>

                <FormField
                  label="Descrição"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleChange}
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
                loading={loadingOptions}
              />
            </FormSection>

            {/* Opções Dietéticas */}
            <FormSection title="Opções Dietéticas">
              <DietaryOptionsSelector
                dietaryOptions={dietaryOptions}
                selectedDietaryOptions={formData.selectedDietaryOptions}
                onToggleDietaryOption={toggleDietaryOption}
                loading={loadingOptions}
              />
            </FormSection>

            {/* Características do Restaurante */}
            <FormSection title="Características do Restaurante">
              <FeaturesSelector
                features={features}
                selectedFeatures={formData.selectedFeatures}
                onToggleFeature={toggleFeature}
                loading={loadingOptions}
              />
            </FormSection>

            {/* Imagens do Restaurante */}
            <FormSection title="Imagens do Restaurante">
              <RestaurantImageManager
                images={formData.images}
                displayImageIndex={formData.display_image_index}
                onImagesChange={(images) => setFieldValue('images', images)}
                onDisplayImageIndexChange={(index) => setFieldValue('display_image_index', index)}
                disabled={saving}
              />
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

                <MultiplePhoneInput
                  values={formData.phone_numbers}
                  onChange={(values) => setFieldValue('phone_numbers', values)}
                  label="Números de Telefone"
                  helperText="Selecione o país e digite o número no formato internacional"
                  error=""
                  required={false}
                  disabled={saving}
                  maxPhones={5}
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
              </div>
            </FormSection>

            {/* Menu */}
            <FormSection title="Menu do Restaurante">
              <MenuManager
                menuLinks={formData.menu_links}
                menuImages={formData.menu_images}
                onMenuLinksChange={(links) => setFieldValue('menu_links', links)}
                onMenuImagesChange={(images) => setFieldValue('menu_images', images)}
                disabled={saving}
              />
            </FormSection>

            {/* Ações */}
            <FormActions
              onCancel={() => router.push(backUrl)}
              onSubmit={handleSubmit}
              submitText={isEdit ? 'Salvar Alterações' : 'Salvar Restaurante'}
              loading={saving}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
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
import { ArrowLeft, MapPin, Globe, Map, Save, ChevronRight, ChevronLeft, Info, Tag, Utensils, Image, Check } from 'lucide-react';
import { useRestaurantForm } from '@/hooks/forms/useRestaurantForm';
import Link from 'next/link';
import RestaurantFormProgress from './RestaurantFormProgress';
import RestaurantFormPreview from './RestaurantFormPreview';
import RestaurantFormCelebration from './RestaurantFormCelebration';

export interface RestaurantFormProps {
  restaurantId?: string;
  backUrl: string;
  backLabel: string;
  onSuccess?: (restaurant: any) => void;
}

const SECTION_ICONS = {
  basic: Info,
  categories: Tag,
  dietary: Utensils,
  features: MapPin,
  images: Image,
  details: Check,
};

export default function RestaurantForm({ restaurantId, backUrl, backLabel, onSuccess }: RestaurantFormProps) {
  const router = useRouter();
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [createdRestaurant, setCreatedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const isEdit = !!restaurantId;
  const formRef = useRef<HTMLDivElement>(null);

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
  } = useRestaurantForm({ restaurantId, onSuccess });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveRestaurant(isEdit);

    if (result) {
      if (onSuccess) {
        onSuccess(result);
      } else if (isEdit) {
        router.push(backUrl);
      } else {
        setCreatedRestaurant({ id: result.id, name: result.name });
        setShowCelebration(true);
      }
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading || loadingOptions) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/[0.03] rounded w-1/2" />
              <div className="h-4 bg-white/[0.03] rounded w-full" />
              <div className="h-4 bg-white/[0.03] rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]" ref={formRef}>
      <Navbar />

      <GoogleMapsModal
        isOpen={googleMapsModalOpen}
        onClose={() => setGoogleMapsModalOpen(false)}
        onSubmit={handleGoogleMapsData}
      />

      <RestaurantFormCelebration
        show={showCelebration}
        restaurantId={createdRestaurant?.id || ''}
        restaurantName={createdRestaurant?.name || ''}
        onClose={() => {
          setShowCelebration(false);
          router.push(`/restaurants/${createdRestaurant?.id}`);
        }}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 md:pb-8">
        {/* Back link */}
        <Link href={backUrl} className="inline-flex items-center text-[var(--foreground-secondary)] hover:text-[var(--primary)] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tighter">
            {isEdit ? 'Editar Restaurante' : 'Novo Restaurante'}
          </h1>
          <p className="text-[var(--foreground-secondary)] mt-2">
            {isEdit ? 'Atualiza as informações do restaurante.' : 'Conta a história do teu restaurante.'}
          </p>
        </div>

        {/* Progress */}
        <RestaurantFormProgress currentStep={currentStep} onStepClick={goToStep} />

        {/* Main content: Form + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="wizard-step-enter">
                  <FormSection title="Informações Básicas"  icon={<SECTION_ICONS.basic className="w-5 h-5" />}>
                    <div className="space-y-4">
                      <FormField label="Nome" name="name" type="text" value={formData.name} onChange={handleChange} required>
                        <button
                          type="button"
                          onClick={() => setGoogleMapsModalOpen(true)}
                          className="px-4 py-2 bg-[var(--primary)] text-black rounded-full hover:bg-[var(--primary-hover)] flex items-center gap-2 font-medium text-sm transition-colors"
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
                        helperText="Conta a história do restaurante. O que o torna especial?"
                      />

                      <FormField
                        label="Localização"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        icon={MapPin}
                        helperText="Endereço ou coordenadas GPS"
                      />
                    </div>
                  </FormSection>
                </div>
              )}

              {/* Step 2: Categories */}
              {currentStep === 2 && (
                <div className="wizard-step-enter">
                  <FormSection title="Categorias Culinárias"  icon={<SECTION_ICONS.categories className="w-5 h-5" />}>
                    <CuisineSelector
                      cuisineTypes={cuisineTypes}
                      selectedCuisineTypes={formData.selectedCuisineTypes}
                      onToggleCuisine={toggleCuisineType}
                      loading={loadingOptions}
                    />
                  </FormSection>
                </div>
              )}

              {/* Step 3: Dietary */}
              {currentStep === 3 && (
                <div className="wizard-step-enter">
                  <FormSection title="Opções Dietéticas"  icon={<SECTION_ICONS.dietary className="w-5 h-5" />}>
                    <DietaryOptionsSelector
                      dietaryOptions={dietaryOptions}
                      selectedDietaryOptions={formData.selectedDietaryOptions}
                      onToggleDietaryOption={toggleDietaryOption}
                      loading={loadingOptions}
                    />
                  </FormSection>
                </div>
              )}

              {/* Step 4: Features */}
              {currentStep === 4 && (
                <div className="wizard-step-enter">
                  <FormSection title="Características"  icon={<SECTION_ICONS.features className="w-5 h-5" />}>
                    <FeaturesSelector
                      features={features}
                      selectedFeatures={formData.selectedFeatures}
                      onToggleFeature={toggleFeature}
                      loading={loadingOptions}
                    />
                  </FormSection>
                </div>
              )}

              {/* Step 5: Images */}
              {currentStep === 5 && (
                <div className="wizard-step-enter">
                  <FormSection title="Imagens"  icon={<SECTION_ICONS.images className="w-5 h-5" />}>
                    <RestaurantImageManager
                      images={formData.images}
                      displayImageIndex={formData.display_image_index}
                      onImagesChange={(images) => setFieldValue('images', images)}
                      onDisplayImageIndexChange={(index) => setFieldValue('display_image_index', index)}
                      disabled={saving}
                    />
                  </FormSection>
                </div>
              )}

              {/* Step 6: Additional */}
              {currentStep === 6 && (
                <div className="wizard-step-enter">
                  <FormSection title="Informações Adicionais"  icon={<SECTION_ICONS.details className="w-5 h-5" />}>
                    <div className="space-y-4">
                      <FormField
                        label="Website"
                        name="source_url"
                        type="url"
                        value={formData.source_url}
                        onChange={handleChange}
                        icon={Globe}
                        placeholder="https://..."
                        helperText="Link para o website do restaurante"
                      />

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Links do Menu</label>
                        <MenuManager
                          menuLinks={formData.menu_links}
                          menuImages={formData.menu_images}
                          onMenuLinksChange={(links) => setFieldValue('menu_links', links)}
                          onMenuImagesChange={(images) => setFieldValue('menu_images', images)}
                          disabled={saving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Telefones</label>
                        <MultiplePhoneInput label="Telefones"
                          values={formData.phone_numbers || []}
                          onChange={(phones) => setFieldValue('phone_numbers', phones)}
                        />
                      </div>
                    </div>
                  </FormSection>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <span className="text-sm text-[var(--foreground-muted)]">
                  {currentStep} de 6
                </span>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => goToStep(currentStep + 1)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black text-sm font-medium rounded-full hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar Restaurante'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Preview (desktop only) */}
          <div className="hidden lg:block">
            <RestaurantFormPreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}

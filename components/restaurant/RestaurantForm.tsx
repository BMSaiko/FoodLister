'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navigation/Navbar';
import GoogleMapsModal from '@/components/ui/RestaurantDetails/GoogleMapsModal';
import GoogleMapsBatchImport from '@/components/restaurant/GoogleMapsBatchImport';
import CuisineSelector from '@/components/ui/Filters/CuisineSelector';
import DietaryOptionsSelector from '@/components/ui/Filters/DietaryOptionsSelector';
import FeaturesSelector from '@/components/ui/Filters/FeaturesSelector';
import RestaurantImageManager from '@/components/ui/RestaurantManagement/RestaurantImageManager';
import MenuManager from '@/components/ui/RestaurantManagement/MenuManager';
import FormSection from '@/components/ui/common/FormSection';
import FormField from '@/components/ui/common/FormField';
import MultiplePhoneInput from '@/components/ui/common/MultiplePhoneInput';
import { useRestaurantForm } from '@/hooks/forms/useRestaurantForm';
import Link from 'next/link';
import { FormStepper, WizardNav, type WizardStep } from '@/components/ui/FormWizard';
import RestaurantFormPreview from './RestaurantFormPreview';
import RestaurantFormCelebration from './RestaurantFormCelebration';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/icons/Icon';

export interface RestaurantFormProps {
  restaurantId?: string;
  backUrl: string;
  backLabel: string;
  /** Apenas mostrar batch import (admin + create). */
  enableBatchImport?: boolean;
  onSuccess?: (restaurant: { id: string; name: string } | { count: number }) => void;
}

const STEPS: WizardStep[] = [
  { id: 1, label: 'Básico', icon: 'info' },
  { id: 2, label: 'Categorias', icon: 'etiqueta' },
  { id: 3, label: 'Dietética', icon: 'restaurantes' },
  { id: 4, label: 'Características', icon: 'pin' },
  { id: 5, label: 'Imagens', icon: 'imagem' },
  { id: 6, label: 'Detalhes', icon: 'visto' },
];

const SECTION_ICONS = {
  basic: 'info',
  categories: 'etiqueta',
  dietary: 'restaurantes',
  features: 'pin',
  images: 'imagem',
  details: 'visto',
} as const;

export default function RestaurantForm({ restaurantId, backUrl, backLabel, enableBatchImport, onSuccess }: RestaurantFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const [batchImportOpen, setBatchImportOpen] = useState(false);
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

      <GoogleMapsBatchImport
        isOpen={batchImportOpen}
        onClose={() => setBatchImportOpen(false)}
        onImportComplete={(_count) => {
          setBatchImportOpen(false);
          router.push('/restaurants');
        }}
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-48 md:pb-8">
        {/* Back link */}
        <Link href={backUrl} className="inline-flex items-center text-[var(--foreground-secondary)] hover:text-[var(--primary)] mb-6 transition-colors">
          <Icon name="seta-esq" className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tighter">
              {isEdit ? 'Editar Restaurante' : 'Novo Restaurante'}
            </h1>
            <p className="text-[var(--foreground-secondary)] mt-2">
              {isEdit ? 'Atualiza as informações do restaurante.' : 'Conta a história do teu restaurante.'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <FormStepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

        {/* Main content: Form + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="wizard-step-enter">
                  <FormSection title={t('Informações Básicas')}  icon={<Icon name={SECTION_ICONS.basic} className="w-5 h-5" />}>
                    <div className="space-y-4">
                      {enableBatchImport && (
                        <button
                          type="button"
                          onClick={() => setBatchImportOpen(true)}
                          className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                        >
                          <Icon name="pin" className="h-4 w-4" />
                          Importar lista do Google Maps
                        </button>
                      )}

                      <FormField label={t('Nome')} name="name" type="text" value={formData.name} onChange={handleChange} required>
                        <button
                          type="button"
                          onClick={() => setGoogleMapsModalOpen(true)}
                          className="px-4 py-2 bg-[var(--primary)] text-black rounded-full hover:bg-[var(--primary-hover)] flex items-center gap-2 font-medium text-sm transition-colors"
                        >
                          <Icon name="mapa" className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('Google Maps')}</span>
                        </button>
                      </FormField>

                      <FormField
                        label={t('Descrição')}
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        helperText="Conta a história do restaurante. O que o torna especial?"
                      />

                      <FormField
                        label={t('Localização')}
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        icon="pin"
                        helperText="Endereço ou coordenadas GPS"
                      />
                    </div>
                  </FormSection>
                </div>
              )}

              {/* Step 2: Categories */}
              {currentStep === 2 && (
                <div className="wizard-step-enter">
                  <FormSection title={t('Categorias Culinárias')}  icon={<Icon name={SECTION_ICONS.categories} className="w-5 h-5" />}>
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
                  <FormSection title={t('Opções Dietéticas')}  icon={<Icon name={SECTION_ICONS.dietary} className="w-5 h-5" />}>
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
                  <FormSection title={t('Características')}  icon={<Icon name={SECTION_ICONS.features} className="w-5 h-5" />}>
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
                  <FormSection title={t('Imagens')}  icon={<Icon name={SECTION_ICONS.images} className="w-5 h-5" />}>
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
                  <FormSection title={t('Informações Adicionais')}  icon={<Icon name={SECTION_ICONS.details} className="w-5 h-5" />}>
                    <div className="space-y-4">
                      <FormField
                        label={t('Website')}
                        name="source_url"
                        type="url"
                        value={formData.source_url}
                        onChange={handleChange}
                        icon="globo"
                        placeholder="https://..."
                        helperText="Link para o website do restaurante"
                      />

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">{t('Links do Menu')}</label>
                        <MenuManager
                          menuLinks={formData.menu_links}
                          menuImages={formData.menu_images}
                          onMenuLinksChange={(links) => setFieldValue('menu_links', links)}
                          onMenuImagesChange={(images) => setFieldValue('menu_images', images)}
                          disabled={saving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">{t('Telefones')}</label>
                        <MultiplePhoneInput label={t('Telefones')}
                          values={formData.phone_numbers || []}
                          onChange={(phones) => setFieldValue('phone_numbers', phones)}
                        />
                      </div>
                    </div>
                  </FormSection>
                </div>
              )}

              <WizardNav
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onPrevious={() => goToStep(currentStep - 1)}
                onNext={() => goToStep(currentStep + 1)}
                onCancel={() => router.push(backUrl)}
                saving={saving}
                submitLabel={isEdit ? 'Guardar' : 'Criar Restaurante'}
              />
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

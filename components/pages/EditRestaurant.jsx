// components/pages/EditRestaurant.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/ui/navigation/Navbar';
import GoogleMapsModal from '@/components/ui/RestaurantDetails/GoogleMapsModal';
import CuisineSelector from '@/components/ui/Filters/CuisineSelector';
import DietaryOptionsSelector from '@/components/ui/Filters/DietaryOptionsSelector';
import FeaturesSelector from '@/components/ui/Filters/FeaturesSelector';
import ImagePreview from '@/components/ui/RestaurantManagement/ImagePreview';
import ImageUploader from '@/components/ui/RestaurantManagement/ImageUploader';
import MenuManager from '@/components/ui/RestaurantManagement/MenuManager';
import RestaurantImageManager from '@/components/ui/RestaurantManagement/RestaurantImageManager';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check, Map, Phone, Plus, X, Smartphone, Home } from 'lucide-react';
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { validateAndNormalizePhoneNumbers, validatePhoneNumber } from '@/utils/formatters';
import { toast } from 'react-toastify';
import FormSection from '@/components/ui/common/FormSection';
import FormField from '@/components/ui/common/FormField';
import MultiplePhoneInput from '@/components/ui/common/MultiplePhoneInput';
import FormActions from '@/components/ui/common/FormActions';

// Componente de proteção de autenticação
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Você precisa estar logado para editar restaurantes.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base",
        bodyClassName: "text-sm sm:text-base"
      });
      router.push('/auth/signin');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return children;
}

export default function EditRestaurant({ restaurantId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loadingCuisineTypes, setLoadingCuisineTypes] = useState(true);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [loadingDietaryOptions, setLoadingDietaryOptions] = useState(true);
  const [features, setFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    images: [],
    display_image_index: -1,
    location: '',
    source_url: '',
    menu_links: [],
    menu_images: [],
    phone_numbers: [],
    creator: '',
    selectedCuisineTypes: [],
    selectedDietaryOptions: [],
    selectedFeatures: []
  });

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
        const { data: cuisineRelationData, error: cuisineRelationError } = await supabase
          .from('restaurant_cuisine_types')
          .select('cuisine_type_id')
          .eq('restaurant_id', restaurantId);

        if (cuisineRelationError) throw cuisineRelationError;

        // 3. Buscar opções dietéticas relacionadas
        const { data: dietaryRelationData, error: dietaryRelationError } = await supabase
          .from('restaurant_dietary_options_junction')
          .select('dietary_option_id')
          .eq('restaurant_id', restaurantId);

        if (dietaryRelationError) throw dietaryRelationError;

        // 4. Buscar características relacionadas
        const { data: featureRelationData, error: featureRelationError } = await supabase
          .from('restaurant_restaurant_features')
          .select('feature_id')
          .eq('restaurant_id', restaurantId);

        if (featureRelationError) throw featureRelationError;

        // 5. Buscar todos os tipos de cozinha disponíveis
        const { data: allCuisineTypes, error: cuisineTypesError } = await supabase
          .from('cuisine_types')
          .select('*')
          .order('name');

        if (cuisineTypesError) throw cuisineTypesError;

        // 6. Buscar todas as opções dietéticas disponíveis
        const { data: allDietaryOptions, error: dietaryOptionsError } = await supabase
          .from('restaurant_dietary_options')
          .select('*')
          .order('name');

        if (dietaryOptionsError) throw dietaryOptionsError;

        // 7. Buscar todas as características disponíveis
        const { data: allFeatures, error: featuresError } = await supabase
          .from('restaurant_features')
          .select('*')
          .order('name');

        if (featuresError) throw featuresError;

        // Atualizar estados
        if (restaurantData) {
          setFormData({
            name: restaurantData.name,
            description: restaurantData.description,
            image_url: restaurantData.image_url || '',
            images: restaurantData.images || [],
            display_image_index: restaurantData.display_image_index ?? -1,
            location: restaurantData.location || '',
            source_url: restaurantData.source_url || '',
            menu_links: restaurantData.menu_links || [],
            menu_images: restaurantData.menu_images || [],
            phone_numbers: restaurantData.phone_numbers || [],
            creator: restaurantData.creator || 'Anônimo',
            selectedCuisineTypes: cuisineRelationData ? cuisineRelationData.map(rel => rel.cuisine_type_id) : [],
            selectedDietaryOptions: dietaryRelationData ? dietaryRelationData.map(rel => rel.dietary_option_id) : [],
            selectedFeatures: featureRelationData ? featureRelationData.map(rel => rel.feature_id) : []
          });
        }

        setCuisineTypes(allCuisineTypes || []);
        setDietaryOptions(allDietaryOptions || []);
        setFeatures(allFeatures || []);

      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        toast.error('Erro ao carregar detalhes do restaurante: ' + (err.message || 'Erro desconhecido'), {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base",
          bodyClassName: "text-sm sm:text-base"
        });
      } finally {
        setLoading(false);
        setLoadingCuisineTypes(false);
        setLoadingDietaryOptions(false);
        setLoadingFeatures(false);
      }
    }

    fetchRestaurantAndCategories();
  }, [restaurantId]);

  // Carregar opções dietéticas do banco de dados
  useEffect(() => {
    async function fetchDietaryOptions() {
      try {
        setLoadingDietaryOptions(true);
        const { data, error } = await supabase
          .from('restaurant_dietary_options')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Erro ao buscar opções dietéticas:', error);
        } else {
          setDietaryOptions(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar opções dietéticas:', err);
      } finally {
        setLoadingDietaryOptions(false);
      }
    }
    
    fetchDietaryOptions();
  }, []);

  // Carregar características do banco de dados
  useEffect(() => {
    async function fetchFeatures() {
      try {
        setLoadingFeatures(true);
        const { data, error } = await supabase
          .from('restaurant_features')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Erro ao buscar características:', error);
        } else {
          setFeatures(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar características:', err);
      } finally {
        setLoadingFeatures(false);
      }
    }
    
    fetchFeatures();
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

  const toggleDietaryOption = (dietaryOptionId) => {
    setFormData(prev => {
      const isSelected = prev.selectedDietaryOptions.includes(dietaryOptionId);
      
      if (isSelected) {
        // Remove a opção selecionada
        return {
          ...prev,
          selectedDietaryOptions: prev.selectedDietaryOptions.filter(id => id !== dietaryOptionId)
        };
      } else {
        // Adiciona a opção selecionada
        return {
          ...prev,
          selectedDietaryOptions: [...prev.selectedDietaryOptions, dietaryOptionId]
        };
      }
    });
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => {
      const isSelected = prev.selectedFeatures.includes(featureId);
      
      if (isSelected) {
        // Remove a característica selecionada
        return {
          ...prev,
          selectedFeatures: prev.selectedFeatures.filter(id => id !== featureId)
        };
      } else {
        // Adiciona a característica selecionada
        return {
          ...prev,
          selectedFeatures: [...prev.selectedFeatures, featureId]
        };
      }
    });
  };

  const handleGoogleMapsData = (data) => {
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      location: data.location || prev.location,
      source_url: data.source_url || prev.source_url,
      latitude: data.latitude || prev.latitude,
      longitude: data.longitude || prev.longitude
    }));
    setGoogleMapsModalOpen(false);
  };

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phone_numbers: [...prev.phone_numbers, '']
    }));
  };

  const updatePhoneNumber = (index, value) => {
    setFormData(prev => ({
      ...prev,
      phone_numbers: prev.phone_numbers.map((phone, i) => i === index ? value : phone)
    }));
  };

  const removePhoneNumber = (index) => {
    setFormData(prev => ({
      ...prev,
      phone_numbers: prev.phone_numbers.filter((_, i) => i !== index)
    }));
  };

  // Stable callback functions to prevent recreation on every render
  const handleMenuLinksChange = useCallback((links) => {
    setFormData(prev => ({ ...prev, menu_links: links }));
  }, []);

  const handleMenuImagesChange = useCallback((images) => {
    setFormData(prev => ({ ...prev, menu_images: images }));
  }, []);

  const handleRestaurantImagesChange = useCallback((images) => {
    setFormData(prev => ({ ...prev, images: images }));
  }, []);

  const handleDisplayImageIndexChange = useCallback((index) => {
    setFormData(prev => ({ ...prev, display_image_index: index }));
  }, []);

  // Função para detectar se um número é móvel ou fixo
  const detectPhoneType = (phoneNumber) => {
    // Limpa o número removendo espaços, hífens, parênteses
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Remove o código do país se existir (+351 ou 351)
    let numberWithoutCountry = cleanNumber;
    if (cleanNumber.startsWith('+351')) {
      numberWithoutCountry = cleanNumber.substring(4);
    } else if (cleanNumber.startsWith('351')) {
      numberWithoutCountry = cleanNumber.substring(3);
    }

    // Verifica os primeiros 2 dígitos (código de área)
    const areaCode = numberWithoutCountry.substring(0, 2);

    // Códigos móveis em Portugal: 91, 92, 93, 96
    const mobileCodes = ['91', '92', '93', '96'];
    return mobileCodes.includes(areaCode) ? 'mobile' : 'landline';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name) {
      toast.error('Por favor, preencha o nome do restaurante.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base",
        bodyClassName: "text-sm sm:text-base"
      });
      return;
    }

    // Validate phone numbers
    const nonEmptyPhones = formData.phone_numbers.filter(phone => phone.trim().length > 0);
    if (nonEmptyPhones.length > 0) {
      const invalidPhones = nonEmptyPhones.filter(phone => !validatePhoneNumber(phone.trim()));

      if (invalidPhones.length > 0) {
        toast.error(
          `Número(s) de telefone inválido(s): ${invalidPhones.join(', ')}. Use o formato internacional: +351 912 345 678`,
          {
            position: "top-center",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            className: "text-sm sm:text-base",
            bodyClassName: "text-sm sm:text-base"
          }
        );
        return;
      }
    }

    setSaving(true);

    try {
      // Converter URL do Cloudinary se necessário
      const processedImageUrl = convertCloudinaryUrl(formData.image_url) || '/placeholder-restaurant.jpg';

      // 1. Atualizar dados básicos do restaurante
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          description: formData.description,
          image_url: processedImageUrl,
          images: formData.images,
          display_image_index: formData.display_image_index,
          location: formData.location,
          source_url: formData.source_url,
          menu_links: formData.menu_links,
          menu_images: formData.menu_images,
          phone_numbers: validateAndNormalizePhoneNumbers(formData.phone_numbers),
          latitude: formData.latitude || null,
          longitude: formData.longitude || null
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

      // 3. Atualizar opções dietéticas
      // 3.1 Remover todas as relações existentes
      const { error: dietaryDeleteError } = await supabase
        .from('restaurant_dietary_options_junction')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (dietaryDeleteError) {
        throw dietaryDeleteError;
      }

      // 3.2 Adicionar as novas relações selecionadas
      if (formData.selectedDietaryOptions.length > 0) {
        const dietaryRelations = formData.selectedDietaryOptions.map(dietaryOptionId => ({
          restaurant_id: restaurantId,
          dietary_option_id: dietaryOptionId
        }));

        const { error: dietaryInsertError } = await supabase
          .from('restaurant_dietary_options_junction')
          .insert(dietaryRelations);

        if (dietaryInsertError) {
          throw dietaryInsertError;
        }
      }

      // 4. Atualizar características
      // 4.1 Remover todas as relações existentes
      const { error: featureDeleteError } = await supabase
        .from('restaurant_restaurant_features')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (featureDeleteError) {
        throw featureDeleteError;
      }

      // 4.2 Adicionar as novas relações selecionadas
      if (formData.selectedFeatures.length > 0) {
        const featureRelations = formData.selectedFeatures.map(featureId => ({
          restaurant_id: restaurantId,
          feature_id: featureId
        }));

        const { error: featureInsertError } = await supabase
          .from('restaurant_restaurant_features')
          .insert(featureRelations);

        if (featureInsertError) {
          throw featureInsertError;
        }
      }

      // Show success message and redirect back to the restaurant details page
      toast.success('Restaurante atualizado com sucesso!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base",
        bodyClassName: "text-sm sm:text-base"
      });
      router.push(`/restaurants/${restaurantId}`);
    } catch (err) {
      console.error('Error updating restaurant:', err);

      // Specific message for RLS error
      if (err.code === '42501' || err.message?.includes('row-level security policy')) {
        toast.error('Erro de permissão: O usuário atual não tem permissões para editar restaurantes. Verifique as políticas de segurança no Supabase.', {
          position: "top-center",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base",
          bodyClassName: "text-sm sm:text-base"
        });
      } else {
        toast.error('Erro ao atualizar restaurante. Por favor, tente novamente.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base",
          bodyClassName: "text-sm sm:text-base"
        });
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
    <AuthGuard>
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

            <div className="mb-4 text-sm text-gray-500">
              Adicionado por: {formData.creator}
            </div>

            <form>
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
                loading={loadingCuisineTypes}
              />
            </FormSection>

            {/* Opções Dietéticas */}
            <FormSection title="Opções Dietéticas">
              <DietaryOptionsSelector
                dietaryOptions={dietaryOptions}
                selectedDietaryOptions={formData.selectedDietaryOptions}
                onToggleDietaryOption={toggleDietaryOption}
                loading={loadingDietaryOptions}
              />
            </FormSection>

            {/* Características do Restaurante */}
            <FormSection title="Características do Restaurante">
              <FeaturesSelector
                features={features}
                selectedFeatures={formData.selectedFeatures}
                onToggleFeature={toggleFeature}
                loading={loadingFeatures}
              />
            </FormSection>

            {/* Imagens do Restaurante */}
            <FormSection title="Imagens do Restaurante">
              <RestaurantImageManager
                images={formData.images}
                displayImageIndex={formData.display_image_index}
                onImagesChange={handleRestaurantImagesChange}
                onDisplayImageIndexChange={handleDisplayImageIndexChange}
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

                  {/* Números de Telefone */}
                  <MultiplePhoneInput
                    values={formData.phone_numbers}
                    onChange={(values) => setFormData(prev => ({ ...prev, phone_numbers: values }))}
                    label="Números de Telefone"
                    helperText="Selecione o país e digite o número no formato internacional"
                    error=""
                    required={false}
                    disabled={saving}
                    className=""
                    inputClassName="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                    labelClassName=""
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
                  onMenuLinksChange={handleMenuLinksChange}
                  onMenuImagesChange={handleMenuImagesChange}
                  disabled={saving}
                />
              </FormSection>

              {/* Continuação das Informações Adicionais */}
              <FormSection title="">
                <div className="space-y-4">
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
    </AuthGuard>
  );
}

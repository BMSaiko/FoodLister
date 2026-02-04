// components/pages/CreateRestaurant.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/layouts/Navbar';
import GoogleMapsModal from '@/components/ui/RestaurantDetails/GoogleMapsModal';
import FormField from '@/components/ui/Forms/FormField';
import FormSection from '@/components/ui/Forms/FormSection';
import FormActions from '@/components/ui/Forms/FormActions';
import CuisineSelector from '@/components/ui/Filters/CuisineSelector';
import DietaryOptionsSelector from '@/components/ui/Filters/DietaryOptionsSelector';
import FeaturesSelector from '@/components/ui/Filters/FeaturesSelector';
import ImagePreview from '@/components/ui/RestaurantManagement/ImagePreview';
import ImageUploader from '@/components/ui/RestaurantManagement/ImageUploader';
import MenuManager from '@/components/ui/RestaurantManagement/MenuManager';
import RestaurantImageManager from '@/components/ui/RestaurantManagement/RestaurantImageManager';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check, Map, Phone, Plus, X, Smartphone, Home, Lock } from 'lucide-react';
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { validateAndNormalizePhoneNumbers, validatePhoneNumber } from '@/utils/formatters';
import { toast } from 'react-toastify';

export default function CreateRestaurant() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
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
    selectedCuisineTypes: [],
    selectedDietaryOptions: [],
    selectedFeatures: []
  });
  
  const supabase = createClient();

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Você precisa estar logado para criar restaurantes.', {
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
  }, [user, authLoading, router]);

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

    // Check if user is authenticated
    if (!user) {
      toast.error('Você precisa estar logado para criar um restaurante.', {
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
      router.push('/auth/signin');
      return;
    }

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

    setLoading(true);
    
    try {
      // Converter URL do Cloudinary se necessário
      const processedImageUrl = convertCloudinaryUrl(formData.image_url) || '/placeholder-restaurant.jpg';
      
      // Use the Next.js API route instead of direct Supabase calls
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image_url: processedImageUrl,
          images: formData.images,
          display_image_index: formData.display_image_index,
          location: formData.location || '',
          source_url: formData.source_url || '',
          menu_links: formData.menu_links,
          menu_images: formData.menu_images,
          phone_numbers: validateAndNormalizePhoneNumbers(formData.phone_numbers),
          latitude: formData.latitude || null,
          longitude: formData.longitude || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create restaurant');
      }

      const { restaurant } = await response.json();
      
      // Create cuisine type relationships using direct Supabase call (since this is a separate operation)
      if (formData.selectedCuisineTypes.length > 0 && restaurant) {
        const { error: relationError } = await supabase
          .from('restaurant_cuisine_types')
          .insert(formData.selectedCuisineTypes.map(cuisineTypeId => ({
            restaurant_id: restaurant.id,
            cuisine_type_id: cuisineTypeId
          })));
        
        if (relationError) {
          console.error('Erro ao adicionar tipos de cozinha:', relationError);
          // Não lançamos o erro aqui para que o usuário ainda seja redirecionado
          // para a página do restaurante
        }
      }

      // 3. Se houver opções dietéticas selecionadas, criar os relacionamentos
      if (formData.selectedDietaryOptions.length > 0 && restaurantData && restaurantData[0]) {
        const restaurantId = restaurantData[0].id;
        
        const dietaryRelations = formData.selectedDietaryOptions.map(dietaryOptionId => ({
          restaurant_id: restaurantId,
          dietary_option_id: dietaryOptionId
        }));
        
        const { error: dietaryError } = await supabase
          .from('restaurant_dietary_options_junction')
          .insert(dietaryRelations);
        
        if (dietaryError) {
          console.error('Erro ao adicionar opções dietéticas:', dietaryError);
          // Não lançamos o erro aqui para que o usuário ainda seja redirecionado
          // para a página do restaurante
        }
      }

      // 4. Se houver características selecionadas, criar os relacionamentos
      if (formData.selectedFeatures.length > 0 && restaurantData && restaurantData[0]) {
        const restaurantId = restaurantData[0].id;
        
        const featureRelations = formData.selectedFeatures.map(featureId => ({
          restaurant_id: restaurantId,
          feature_id: featureId
        }));
        
        const { error: featureError } = await supabase
          .from('restaurant_restaurant_features')
          .insert(featureRelations);
        
        if (featureError) {
          console.error('Erro ao adicionar características:', featureError);
          // Não lançamos o erro aqui para que o usuário ainda seja redirecionado
          // para a página do restaurante
        }
      }
      
      // Show success message and redirect to the new restaurant's page
      if (restaurant) {
        toast.success('Restaurante criado com sucesso!', {
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
        router.push(`/restaurants/${restaurant.id}`);
      } else {
        toast.success('Restaurante criado com sucesso!', {
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
        router.push('/restaurants');
      }
    } catch (err) {
      console.error('Error creating restaurant:', err);
      toast.error('Erro ao criar restaurante. Por favor, tente novamente.', {
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
                disabled={loading}
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
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-amber-500" />
                      Números de Telefone
                    </label>
                    <button
                      type="button"
                      onClick={addPhoneNumber}
                      className="flex items-center justify-center px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Telefone
                    </button>
                  </div>

                  {formData.phone_numbers.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-amber-50 rounded-lg border-2 border-dashed border-amber-200">
                      <Phone className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                      <p className="text-sm text-amber-700 font-medium">Nenhum telefone adicionado</p>
                      <p className="text-xs text-amber-600 mt-1">Clique em "Adicionar Telefone" para incluir contatos</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.phone_numbers.map((phone, index) => {
                        const phoneType = detectPhoneType(phone);
                        const PhoneIcon = phoneType === 'mobile' ? Smartphone : Home;

                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
                            <div className="flex-shrink-0">
                              <PhoneIcon className="h-5 w-5 text-amber-500" />
                            </div>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => updatePhoneNumber(index, e.target.value)}
                              placeholder="Ex: +351 912 345 678"
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoneNumber(index)}
                              className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 min-h-[44px] min-w-[44px]"
                              title="Remover telefone"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

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
                disabled={loading}
              />
            </FormSection>

            {/* Continuação das Informações Adicionais */}
            <FormSection title="">
              <div className="space-y-4">
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

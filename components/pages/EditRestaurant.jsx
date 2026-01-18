// components/pages/EditRestaurant.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/layouts/Navbar';
import GoogleMapsModal from '@/components/ui/GoogleMapsModal';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import FormActions from '@/components/ui/FormActions';
import CuisineSelector from '@/components/ui/CuisineSelector';
import ImagePreview from '@/components/ui/ImagePreview';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, FileText, Check, Map, Phone, Plus, X, Smartphone, Home } from 'lucide-react';
import { extractGoogleMapsData } from '@/utils/googleMapsExtractor';
import { convertImgurUrl } from '@/utils/imgurConverter';
import { validateAndNormalizePhoneNumbers, validatePhoneNumber } from '@/utils/formatters';
import { toast } from 'react-toastify';

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
  const [googleMapsModalOpen, setGoogleMapsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_per_person: '',
    location: '',
    source_url: '',
    menu_url: '',
    phone_numbers: [],
    visited: false,
    creator: '',
    selectedCuisineTypes: []
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
            location: restaurantData.location || '',
            source_url: restaurantData.source_url || '',
            menu_url: restaurantData.menu_url || '',
            phone_numbers: restaurantData.phone_numbers || [],
            visited: restaurantData.visited || false,
            creator: restaurantData.creator || 'Anônimo',
            selectedCuisineTypes: relationData ? relationData.map(rel => rel.cuisine_type_id) : []
          });
        }

        setCuisineTypes(allCuisineTypes || []);

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
    if (!formData.name || !formData.description || !formData.price_per_person) {
      toast.error('Por favor, preencha os campos obrigatórios.', {
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

    // Convert price to numbers
    const priceAsNumber = parseFloat(formData.price_per_person);

    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      toast.error('O preço deve ser um número positivo.', {
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
          location: formData.location,
          source_url: formData.source_url,
          menu_url: formData.menu_url,
          phone_numbers: validateAndNormalizePhoneNumbers(formData.phone_numbers),
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

              {/* Preços */}
              <FormSection title="Preços">
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
    </AuthGuard>
  );
}

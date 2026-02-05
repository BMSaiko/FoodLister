'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Camera, 
  Save, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';
import PhoneInputField from '@/components/ui/Forms/PhoneInput';

interface FormErrors {
  display_name?: string;
  website?: string;
  bio?: string;
}

interface UserProfile {
  id: string;
  userIdCode: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  website?: string;
  phoneNumber?: string;
  publicProfile: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalRestaurantsVisited: number;
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
  recentReviews: any[];
  recentLists: any[];
  isOwnProfile: boolean;
}

const ProfileSettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { 
    profile, 
    loading: profileLoading, 
    error, 
    saveProfile, 
    uploadImage, 
    refreshProfile 
  } = useSettings();

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  // Initialize local profile when profile data loads
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load profile data on mount
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  const handleInputChange = (field: string, value: string) => {
    // Update local state for immediate feedback
    if (localProfile) {
      setLocalProfile({
        ...localProfile,
        [field]: value
      });
    }
  };

  const handlePrivacyToggle = async () => {
    if (!profile) return;

    try {
      const success = await saveProfile({
        publicProfile: !profile.publicProfile
      });
      
      if (success) {
        toast.success(profile.publicProfile ? 'Perfil agora é privado!' : 'Perfil agora é público!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar privacidade do perfil');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      // Update profile with new image
      await saveProfile({ profileImage: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!profile?.name || profile.name.trim() === '') {
      errors.display_name = 'Nome de exibição é obrigatório';
    }

    if (profile?.website && profile.website.trim() !== '') {
      try {
        new URL(profile.website);
      } catch {
        errors.website = 'Formato de URL do website inválido';
      }
    }

    if (profile?.bio && profile.bio.length > 500) {
      errors.bio = 'A biografia deve ter no máximo 500 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      const profileToSave = localProfile || profile;
      const success = await saveProfile({
        name: profileToSave?.name || '',
        bio: profileToSave?.bio || '',
        profileImage: profileToSave?.profileImage || '',
        phoneNumber: profileToSave?.phoneNumber || '',
        website: profileToSave?.website || '',
        location: profileToSave?.location || '',
        publicProfile: profileToSave?.publicProfile || true
      });

      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        // Redirect to restaurants page after successful save
        setTimeout(() => {
          router.push('/restaurants');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-amber-500" />
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Erro ao carregar perfil</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={refreshProfile}
            className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Perfil não encontrado</h1>
          <p className="text-gray-600 mt-2">Não foi possível carregar os dados do seu perfil.</p>
          <button
            onClick={refreshProfile}
            className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configurações da Conta</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/users/${user.id}`}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Perfil Público</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-6">
              <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white opacity-80" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
              <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                  <User className="h-4 w-4 mr-2" />
                  {profile.userIdCode}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2 text-amber-500" />
                  Nome de Exibição <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                    formErrors.display_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome de exibição"
                  required
                />
                {formErrors.display_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.display_name}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2 text-amber-500" />
                  Endereço de Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>

              {/* Phone Number */}
              <PhoneInputField
                value={profile.phoneNumber || ''}
                onChange={(value) => handleInputChange('phoneNumber', value)}
                label="Número de Telefone"
                helperText="Selecione o país e digite o número no formato internacional"
                error=""
                required={false}
                disabled={false}
                className=""
                inputClassName={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                  formErrors.display_name ? 'border-red-500' : 'border-gray-300'
                }`}
                labelClassName=""
              />

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2 text-amber-500" />
                  Localização
                </label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Lisboa, Portugal"
                />
                <p className="text-xs text-gray-500 mt-1">Sua localização para recomendações personalizadas</p>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-2 text-amber-500" />
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                    formErrors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://seusite.com"
                />
                {formErrors.website && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.website}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Seu site pessoal ou blog gastronômico</p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2 text-amber-500" />
                  Sobre Você
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none ${
                    formErrors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Conte um pouco sobre você, seus gostos culinários, etc..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Compartilhe informações sobre seus gostos culinários</p>
                  <span className="text-xs text-gray-400">{(profile.bio || '').length}/500</span>
                </div>
                {formErrors.bio && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>
                )}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacidade</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-900">Privacidade do Perfil</p>
                    <p className="text-sm text-gray-600">
                      {profile.publicProfile 
                        ? 'Seu perfil está público. Outros usuários podem encontrar e visualizar seu perfil.'
                        : 'Seu perfil está privado. Apenas você pode visualizar seu perfil.'
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePrivacyToggle}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    profile.publicProfile 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {profile.publicProfile ? 'Tornar Privado' : 'Tornar Público'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
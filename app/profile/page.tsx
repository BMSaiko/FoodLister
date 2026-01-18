'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { User, Mail, Phone, FileText, Camera, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { uploadToCloudinary } from '@/utils/cloudinaryConverter';

interface UserProfile {
  displayName: string;
  phoneNumber: string;
  description: string;
  profileImage: string;
  email: string;
}

const ProfileSettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = getClient();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    phoneNumber: '',
    description: '',
    profileImage: '',
    email: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // First try to get from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profileData) {
        // Use data from profiles table
        setProfile({
          displayName: (profileData as any).display_name || '',
          phoneNumber: (profileData as any).phone_number || '',
          description: (profileData as any).bio || '',
          profileImage: (profileData as any).avatar_url || '',
          email: user.email || ''
        });
      } else {
        // Fallback to user metadata if profile doesn't exist
        const metadata = user.user_metadata || {};

        setProfile({
          displayName: metadata.display_name || metadata.name || metadata.full_name || '',
          phoneNumber: metadata.phone_number || metadata.phone || '',
          description: metadata.description || metadata.bio || '',
          profileImage: metadata.profile_image || metadata.avatar_url || '',
          email: user.email || ''
        });

        // Create profile entry if it doesn't exist
        try {
          const { error: createError } = await (supabase as any)
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: metadata.display_name || metadata.name || metadata.full_name || null,
              bio: metadata.description || metadata.bio || null,
              avatar_url: metadata.profile_image || metadata.avatar_url || null,
              website: null,
              location: null,
              phone_number: metadata.phone_number || metadata.phone || null
            });

          if (createError && createError.code !== '23505') { // Ignore duplicate key error
            console.error('Error creating profile:', createError);
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const imageUrl = await uploadToCloudinary(file);
      handleInputChange('profileImage', imageUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update profiles table
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.displayName || null,
          bio: profile.description || null,
          avatar_url: profile.profileImage || null,
          phone_number: profile.phoneNumber || null,
          website: null,
          location: null
        });

      if (profileError) throw profileError;

      // Also update user metadata for consistency
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: profile.displayName,
          phone_number: profile.phoneNumber,
          description: profile.description,
          profile_image: profile.profileImage
        }
      });

      if (metadataError) {
        console.error('Error updating metadata:', metadataError);
        // Don't throw here as the profile was updated successfully
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/restaurants"
            className="inline-flex items-center text-amber-500 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Configurações da Conta</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Image Section - Full width on mobile, sidebar on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">Foto do Perfil</h2>

              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-gray-50">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Foto do perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full cursor-pointer transition-colors shadow-lg">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Clique no ícone da câmera para alterar sua foto de perfil
                </p>
                {saving && (
                  <div className="text-sm text-amber-600 font-medium">Enviando imagem...</div>
                )}
              </div>
            </div>
          </div>

          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>

              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <User className="h-4 w-4 inline mr-2 text-amber-500" />
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Seu nome de exibição"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">Este nome aparecerá em suas avaliações e publicações</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Mail className="h-4 w-4 inline mr-2 text-amber-500" />
                    Endereço de Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-2">O email não pode ser alterado</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Phone className="h-4 w-4 inline mr-2 text-amber-500" />
                    Número de Telefone
                  </label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="+351 912 345 678"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">Opcional - para contato e verificações</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FileText className="h-4 w-4 inline mr-2 text-amber-500" />
                    Sobre Você
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    placeholder="Conte um pouco sobre você, seus gostos culinários, etc..."
                    disabled={saving}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Compartilhe informações sobre seus gostos culinários</p>
                    <span className="text-xs text-gray-400">{profile.description.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Informações da Conta</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Account Creation Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta criada em
                  </label>
                  <p className="text-gray-900 font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>

                {/* Last Sign In */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Último acesso
                  </label>
                  <p className="text-gray-900 font-medium">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-PT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base min-h-[48px] w-full sm:w-auto"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

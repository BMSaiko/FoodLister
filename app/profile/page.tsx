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

      // Get user metadata from Supabase Auth
      const { data: userData, error } = await supabase.auth.getUser();

      if (error) throw error;

      const metadata = userData.user?.user_metadata || {};

      setProfile({
        displayName: metadata.display_name || metadata.name || metadata.full_name || '',
        phoneNumber: metadata.phone_number || metadata.phone || '',
        description: metadata.description || metadata.bio || '',
        profileImage: metadata.profile_image || metadata.avatar_url || '',
        email: userData.user?.email || ''
      });
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

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: profile.displayName,
          phone_number: profile.phoneNumber,
          description: profile.description,
          profile_image: profile.profileImage
        }
      });

      if (error) throw error;

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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/restaurants"
            className="inline-flex items-center text-amber-500 hover:text-amber-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full cursor-pointer hover:bg-amber-600 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Clique no ícone para alterar a foto</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nome de Exibição
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Seu nome de exibição"
              disabled={saving}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Número de Telefone
            </label>
            <input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+351 123 456 789"
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Descrição
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Conte um pouco sobre você..."
              disabled={saving}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações Adicionais</h2>
          <div className="space-y-4">
            {/* Account Creation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta criada em
              </label>
              <p className="text-gray-600">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT') : 'N/A'}
              </p>
            </div>

            {/* Last Sign In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Último acesso
              </label>
              <p className="text-gray-600">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-PT') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

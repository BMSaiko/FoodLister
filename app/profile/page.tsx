'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Globe, MapPin, FileText, Camera, Save, ArrowLeft, Sparkles, ChefHat, Apple, Coffee, Utensils, Calendar, Clock, Shield, Check, ArrowRight, Bell, X } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';

interface UserProfile {
  id: string | null;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  location: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

const ProfileSettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: null,
    user_id: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    phone_number: '',
    created_at: '',
    updated_at: ''
  });
  const [stats, setStats] = useState({
    restaurants: 0,
    reviews: 0,
    visited: 0
  });

  const { get, post, put, del } = useSecureApiClient();

  // Initialize animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

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

      // Fetch profile data from API using secure client
      const response = await get('/api/profile');
      const profileData = await response.json();
      setProfile(profileData);

      // Load user statistics
      await loadStats();

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch user statistics from the new stats endpoint
      const statsResponse = await get('/api/profile/stats');
      const statsData = await statsResponse.json();
      
      // Update stats with all three metrics: restaurants, reviews, and visited
      setStats({
        restaurants: statsData.restaurants || 0,
        reviews: statsData.reviews || 0,
        visited: statsData.visited || 0
      });

    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values if stats loading fails
      setStats({
        restaurants: 0,
        reviews: 0,
        visited: 0
      });
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
      // Import the upload function dynamically to avoid SSR issues
      const { uploadToCloudinary } = await import('@/utils/cloudinaryConverter');
      const imageUrl = await uploadToCloudinary(file);
      handleInputChange('avatar_url', imageUrl);
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

      // Validate required fields
      if (!profile.display_name || profile.display_name.trim() === '') {
        toast.error('Nome de exibição é obrigatório');
        setSaving(false);
        return;
      }

      // Validate website format if provided
      if (profile.website && profile.website.trim() !== '') {
        try {
          new URL(profile.website);
        } catch {
          toast.error('Formato de URL do website inválido');
          setSaving(false);
          return;
        }
      }

      // Save profile data via API using secure client
      const response = await put('/api/profile', profile);
      const result = await response.json();
      toast.success('Perfil atualizado com sucesso!');

      // Redirect to root page after toast disappears
      setTimeout(() => {
        router.push('/restaurants');
      }, 5000);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const getProfileCompletion = () => {
    const items = [
      user.email && user.email.length > 0, // Email verificado
      profile.display_name && profile.display_name.trim().length > 0, // Nome de exibição
      profile.avatar_url && profile.avatar_url.length > 0, // Foto de perfil
      profile.bio && profile.bio.trim().length > 0 // Biografia
    ];
    
    const completed = items.filter(Boolean).length;
    const total = items.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage, items };
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-amber-300 rounded-full animate-float opacity-50 shadow-lg"></div>
          <ChefHat className="absolute top-40 right-10 w-8 h-8 text-amber-600 animate-bounce opacity-70 drop-shadow-md" />
          <Apple className="absolute bottom-24 right-6 w-6 h-6 text-orange-600 animate-bounce opacity-55 drop-shadow-md" />
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Floating decorative elements - inspired by landing page and roulette */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        {/* Primary elements - visible on all devices */}
        <div className={`absolute top-10 left-5 w-20 h-20 bg-amber-600 rounded-full animate-float transition-all duration-1000 shadow-lg ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        <ChefHat className={`absolute top-32 right-8 w-8 h-8 text-amber-900 animate-bounce transition-all duration-1000 delay-700 drop-shadow-lg ${isVisible ? 'scale-100' : 'scale-0'}`} />
        <Apple className={`absolute bottom-24 right-6 w-6 h-6 text-orange-800 animate-bounce transition-all duration-1000 delay-1500 drop-shadow-lg ${isVisible ? 'translate-x-0' : 'translate-x-5'}`} />
        
        {/* Secondary elements - hidden on mobile for better performance */}
        <div className={`absolute top-40 right-16 w-16 h-16 bg-orange-600 rounded-full animate-float-delayed transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        <div className={`absolute bottom-32 left-16 w-12 h-12 bg-yellow-600 rounded-full animate-pulse transition-all duration-1000 delay-500 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        
        {/* Additional elements - hidden on mobile */}
        <div className={`absolute top-24 left-1/3 w-8 h-8 bg-amber-700 rounded-full animate-ping transition-all duration-1000 delay-900 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'}`}></div>
        <div className={`absolute bottom-24 right-1/3 w-6 h-6 bg-orange-700 rounded-full animate-pulse transition-all duration-1000 delay-1100 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'}`}></div>
        <MapPin className={`absolute top-1/2 left-6 w-6 h-6 text-amber-900 animate-float-slow transition-all duration-1000 delay-1300 drop-shadow-lg hidden sm:block ${isVisible ? 'translate-x-0' : '-translate-x-5'}`} />
        
        {/* Additional decorative elements */}
        <div className={`absolute top-1/4 left-1/4 w-16 h-16 bg-yellow-600/100 rounded-full blur-xl animate-float transition-all duration-1000 shadow-2xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-14 h-14 bg-orange-600/100 rounded-full blur-lg animate-float-delayed transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute top-1/2 right-1/2 w-10 h-10 bg-amber-600/100 rounded-full blur-md animate-pulse transition-all duration-1000 delay-500 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-1/2 left-1/2 w-8 h-8 bg-red-600/100 rounded-full blur-lg animate-bounce transition-all duration-1000 delay-700 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        
        {/* Additional icons */}
        <Coffee className={`absolute top-1/3 left-1/4 w-5 h-5 text-yellow-700 animate-bounce drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'}`} />
        <Utensils className={`absolute bottom-1/4 right-1/4 w-4 h-4 text-orange-700 animate-spin drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-x-0' : 'opacity-0 translate-x-5'}`} />
        
        {/* Particles for more dynamism */}
        <div className={`absolute top-16 right-12 w-3 h-3 bg-amber-800 rounded-full animate-ping transition-all duration-1000 delay-200 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-16 left-12 w-3 h-3 bg-orange-800 rounded-full animate-pulse transition-all duration-1000 delay-400 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
      </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className={`mb-6 sm:mb-8 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Configurações da Conta
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Header - Full Width Section */}
        <div className={`bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-100 p-6 sm:p-8 mb-6 sm:mb-8 transition-all duration-1000 shadow-xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
            {/* Profile Image Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white group-hover:ring-amber-200 transition-all duration-300 transform group-hover:scale-105">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto do perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-white opacity-80" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{profile.display_name || 'Usuário'}</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-2">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    <User className="h-4 w-4 mr-2" />
                    Perfil Pessoal
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <FileText className="h-4 w-4 mr-2" />
                    {profile.bio ? 'Bio Ativa' : 'Bio Pendente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-amber-600">{user.last_sign_in_at ? 'Online' : 'Offline'}</div>
                <div className="text-xs text-gray-500 mt-1">Status</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT', { year: 'numeric' }) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Membro desde</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.restaurants}</div>
                <div className="text-xs text-gray-500 mt-1">Restaurantes</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.reviews}</div>
                <div className="text-xs text-gray-500 mt-1">Avaliações</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.visited}</div>
                <div className="text-xs text-gray-500 mt-1">Visitados</div>
              </div>
            </div>
          </div>
          
          {saving && (
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                🔄 Enviando imagem...
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Personal Information - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-3 text-amber-500" />
                  Informações Pessoais
                </h2>
                <div className="flex items-center text-amber-600 text-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Campo obrigatório
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <User className="h-4 w-4 inline mr-2 text-amber-500" />
                    Nome de Exibição <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Seu nome de exibição (obrigatório)"
                    disabled={saving}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Este nome aparecerá em suas avaliações e publicações. Campo obrigatório.</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Mail className="h-4 w-4 inline mr-2 text-amber-500" />
                    Endereço de Email
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
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
                    value={profile.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="+351 912 345 678"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">Opcional - para contato e verificações</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <MapPin className="h-4 w-4 inline mr-2 text-amber-500" />
                    Localização
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Lisboa, Portugal"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">Sua localização para recomendações personalizadas</p>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Globe className="h-4 w-4 inline mr-2 text-amber-500" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="https://seusite.com"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">Seu site pessoal ou blog gastronômico</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FileText className="h-4 w-4 inline mr-2 text-amber-500" />
                    Sobre Você
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    placeholder="Conte um pouco sobre você, seus gostos culinários, etc..."
                    disabled={saving}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Compartilhe informações sobre seus gostos culinários</p>
                    <span className="text-xs text-gray-400">{profile.bio.length}/500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-3 text-amber-500" />
                Informações da Conta
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2 text-amber-500" />
                    ID da Conta
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{user.id || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                    Conta criada em
                  </label>
                  <p className="text-gray-900 font-medium">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="h-4 w-4 mr-2 text-amber-500" />
                    Tipo de Conta
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="h-4 w-4 mr-2" />
                    Verificada
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Sparkles className="h-5 w-5 mr-3 text-amber-500" />
                Ações Rápidas
              </h2>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <span className="flex items-center text-gray-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <span className="flex items-center text-gray-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Segurança
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <span className="flex items-center text-gray-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Progresso do Perfil</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completude</span>
                  <span className="font-medium text-amber-600">{getProfileCompletion().percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getProfileCompletion().percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div className="flex items-center">
                    {getProfileCompletion().items[0] ? (
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 mr-2" />
                    )}
                    <span>Email verificado</span>
                  </div>
                  <div className="flex items-center">
                    {getProfileCompletion().items[1] ? (
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 mr-2" />
                    )}
                    <span>Nome de exibição</span>
                  </div>
                  <div className="flex items-center">
                    {getProfileCompletion().items[2] ? (
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 mr-2" />
                    )}
                    <span>Foto de perfil</span>
                  </div>
                  <div className="flex items-center">
                    {getProfileCompletion().items[3] ? (
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 mr-2" />
                    )}
                    <span>Biografia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area - Fixed at Bottom */}
        <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 font-medium text-sm min-h-[44px] w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            
            <button 
              onClick={handleCancel}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg transition-colors text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
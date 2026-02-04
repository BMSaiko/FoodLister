'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Globe, MapPin, FileText, Camera, Save, ArrowLeft, Sparkles, ChefHat, Apple, Coffee, Utensils, Calendar, Clock, Shield, Check, ArrowRight, Bell, X } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';
import PhoneInputField from '@/components/ui/Forms/PhoneInput';

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
  const [activeTab, setActiveTab] = useState('progress');
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
      user?.email && user.email.length > 0, // Email verificado
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
        
        <div className="relative z-10 text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto" aria-hidden="true"></div>
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

        {/* Floating decorative elements - optimized for mobile performance */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        {/* Primary elements - visible on all devices with optimized animations */}
        <div className={`absolute top-10 left-5 w-16 h-16 bg-amber-600 rounded-full animate-float-slow transition-all duration-1000 shadow-lg ${isVisible ? 'translate-y-0' : 'translate-y-10'} will-change-transform`}></div>
        <ChefHat className={`absolute top-28 right-6 w-6 h-6 text-amber-900 animate-bounce-subtle transition-all duration-1000 delay-700 drop-shadow-lg ${isVisible ? 'scale-100' : 'scale-0'} will-change-transform`} />
        <Apple className={`absolute bottom-20 right-4 w-5 h-5 text-orange-800 animate-bounce-subtle transition-all duration-1000 delay-1500 drop-shadow-lg ${isVisible ? 'translate-x-0' : 'translate-x-5'} will-change-transform`} />
        
        {/* Secondary elements - hidden on mobile for better performance */}
        <div className={`absolute top-32 right-12 w-12 h-12 bg-orange-600 rounded-full animate-float-delayed transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'} will-change-transform`}></div>
        <div className={`absolute bottom-28 left-12 w-10 h-10 bg-yellow-600 rounded-full animate-pulse-strong transition-all duration-1000 delay-500 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'} will-change-transform`}></div>
        
        {/* Additional elements - hidden on mobile */}
        <div className={`absolute top-20 left-1/3 w-6 h-6 bg-amber-700 rounded-full animate-ping transition-all duration-1000 delay-900 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'} will-change-transform`}></div>
        <div className={`absolute bottom-20 right-1/3 w-5 h-5 bg-orange-700 rounded-full animate-pulse-strong transition-all duration-1000 delay-1100 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'} will-change-transform`}></div>
        <MapPin className={`absolute top-1/2 left-4 w-5 h-5 text-amber-900 animate-float-slow transition-all duration-1000 delay-1300 drop-shadow-lg hidden sm:block ${isVisible ? 'translate-x-0' : '-translate-x-5'} will-change-transform`} />
        
        {/* Additional decorative elements */}
        <div className={`absolute top-1/4 left-1/4 w-12 h-12 bg-yellow-600/100 rounded-full blur-xl animate-float-slow transition-all duration-1000 shadow-2xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-10 h-10 bg-orange-600/100 rounded-full blur-lg animate-float-delayed transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
        <div className={`absolute top-1/2 right-1/2 w-8 h-8 bg-amber-600/100 rounded-full blur-md animate-pulse-strong transition-all duration-1000 delay-500 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
        <div className={`absolute bottom-1/2 left-1/2 w-6 h-6 bg-red-600/100 rounded-full blur-lg animate-bounce-subtle transition-all duration-1000 delay-700 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
        
        {/* Additional icons */}
        <Coffee className={`absolute top-1/3 left-1/4 w-4 h-4 text-yellow-700 animate-bounce-subtle drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'} will-change-transform`} />
        <Utensils className={`absolute bottom-1/4 right-1/4 w-3 h-3 text-orange-700 animate-spin-slow drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-x-0' : 'opacity-0 translate-x-5'} will-change-transform`} />
        
        {/* Particles for more dynamism */}
        <div className={`absolute top-12 right-8 w-2 h-2 bg-amber-800 rounded-full animate-ping transition-all duration-1000 delay-200 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
        <div className={`absolute bottom-12 left-8 w-2 h-2 bg-orange-800 rounded-full animate-pulse-strong transition-all duration-1000 delay-400 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'} will-change-transform`}></div>
      </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10 pb-32 sm:pb-36 lg:pb-8 ios-safe-padding-bottom">
        {/* Header */}
        <div className={`mb-4 sm:mb-6 lg:mb-8 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Configurações da Conta
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Header - Mobile Optimized */}
        <div className={`bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-100 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 transition-all duration-1000 shadow-xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Mobile: Stack vertically, Desktop: side by side */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6">
            {/* Profile Image Section */}
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white group-hover:ring-amber-200 transition-all duration-300 transform group-hover:scale-105">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto do perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white opacity-80" />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-amber-500 hover:bg-amber-600 text-white p-2 sm:p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{profile.display_name || 'Usuário'}</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-2 truncate">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-100 text-amber-800">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Perfil Pessoal</span>
                    <span className="sm:hidden">Perfil</span>
                  </span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {profile.bio ? 'Bio Ativa' : 'Bio Pendente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats - Mobile: Scrollable, Desktop: Grid */}
            <div className="w-full sm:w-auto overflow-x-auto sm:overflow-visible">
              <div className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-4 min-w-max sm:min-w-0">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 text-center min-w-[80px]">
                  <div className="text-lg sm:text-xl font-bold text-amber-600">{user ? 'Online' : 'Offline'}</div>
                  <div className="text-xs text-gray-500 mt-1">Status</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 text-center min-w-[100px]">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT', { year: 'numeric' }) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Membro desde</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 text-center min-w-[80px]">
                  <div className="text-lg sm:text-xl font-bold text-amber-600">{stats.restaurants}</div>
                  <div className="text-xs text-gray-500 mt-1">Restaurantes</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 text-center min-w-[80px]">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">{stats.reviews}</div>
                  <div className="text-xs text-gray-500 mt-1">Avaliações</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 text-center min-w-[80px]">
                  <div className="text-lg sm:text-xl font-bold text-yellow-600">{stats.visited}</div>
                  <div className="text-xs text-gray-500 mt-1">Visitados</div>
                </div>
              </div>
            </div>
          </div>
          
          {saving && (
            <div className="mt-3 sm:mt-4 flex items-center justify-center">
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-3 sm:px-4 py-2 rounded-lg text-sm">
                🔄 Enviando imagem...
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Mobile First Layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-amber-500" />
                Informações Pessoais
              </h2>
              <div className="flex items-center text-amber-600 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-1 sm:mr-2"></span>
                Campo obrigatório
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2 text-amber-500" />
                  Nome de Exibição <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Seu nome de exibição (obrigatório)"
                  disabled={saving}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Este nome aparecerá em suas avaliações e publicações. Campo obrigatório.</p>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2 text-amber-500" />
                  Endereço de Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-2">O email não pode ser alterado</p>
              </div>

              {/* Phone Number */}
              <PhoneInputField
                value={profile.phone_number || ''}
                onChange={(value) => handleInputChange('phone_number', value)}
                label="Número de Telefone"
                helperText="Selecione o país e digite o número no formato internacional"
                error=""
                required={false}
                disabled={saving}
                className=""
                inputClassName="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                labelClassName=""
              />

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2 text-amber-500" />
                  Localização
                </label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Lisboa, Portugal"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-2">Sua localização para recomendações personalizadas</p>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2 text-amber-500" />
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="https://seusite.com"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-2">Seu site pessoal ou blog gastronômico</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2 text-amber-500" />
                  Sobre Você
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
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

          {/* Right Column - Tabs */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8 pb-32 sm:pb-40">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`flex-1 px-4 sm:px-6 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'progress' 
                      ? 'text-amber-600 bg-amber-50 border-b-2 border-amber-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('progress')}
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                  Progresso
                </button>
                <button 
                  className={`flex-1 px-4 sm:px-6 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'account' 
                      ? 'text-amber-600 bg-amber-50 border-b-2 border-amber-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('account')}
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                  Conta
                </button>
                <button 
                  className={`flex-1 px-4 sm:px-6 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'actions' 
                      ? 'text-amber-600 bg-amber-50 border-b-2 border-amber-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('actions')}
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                  Ações
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'progress' && (
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Progresso do Perfil</h3>
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
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
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
                )}

                {activeTab === 'account' && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Informações da Conta</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-500" />
                          ID da Conta
                        </label>
                        <p className="text-gray-900 font-mono text-sm">{user.id || 'N/A'}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-500" />
                          Conta criada em
                        </label>
                        <p className="text-gray-900 font-medium text-sm sm:text-base">
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-500" />
                          Último acesso
                        </label>
                        <p className="text-gray-900 font-medium text-sm sm:text-base">
                          {user ? 'Informação disponível' : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-500" />
                          Tipo de Conta
                        </label>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Verificada
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 min-h-[48px]">
                        <span className="flex items-center text-gray-700 text-sm sm:text-base">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Exportar Dados
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 min-h-[48px]">
                        <span className="flex items-center text-gray-700 text-sm sm:text-base">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Segurança
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 min-h-[48px]">
                        <span className="flex items-center text-gray-700 text-sm sm:text-base">
                          <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Notificações
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Area - Mobile Optimized */}
        <div className={`fixed bottom-4 right-4 left-4 lg:bottom-6 lg:right-6 lg:left-auto bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col gap-2 sm:gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-3 sm:px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 font-medium text-sm min-h-[44px] w-full"
              aria-label={saving ? 'Salvando...' : 'Salvar Alterações'}
            >
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline ml-2">{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
            
            <button 
              onClick={handleCancel}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 px-3 sm:px-6 py-2 rounded-lg transition-colors text-sm"
              aria-label="Cancelar"
            >
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline ml-2">Cancelar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
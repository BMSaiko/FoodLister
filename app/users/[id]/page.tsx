'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useUserData } from '@/hooks/data/useUserData';
import { useProfileActions } from '@/hooks/forms/useProfileActions';
import { useSmartBackNavigation } from '@/hooks/navigation/useSmartBackNavigation';
import { toast } from 'react-toastify';
import { 
  Star, 
  List, 
  Utensils, 
  Clock,
  Edit,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  MapPin,
  Globe,
  Calendar,
  Copy,
  Share2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import UserProfileHeader from '@/components/ui/profile/UserProfileHeader';
import ProfileTabs from '@/components/ui/profile/ProfileTabs';
import UserReviewsSection from '@/components/ui/profile/sections/UserReviewsSection';
import UserListsSection from '@/components/ui/profile/sections/UserListsSection';
import UserRestaurantsSection from '@/components/ui/profile/sections/UserRestaurantsSection';

interface UserProfile {
  id: string;
  userIdCode: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  website?: string;
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
  recentReviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    amountSpent?: number;
    createdAt: string;
    restaurant: {
      id: string;
      name: string;
      imageUrl?: string;
      rating?: number;
    };
  }>;
  recentLists: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    restaurantCount: number;
  }>;
  isOwnProfile: boolean;
}

const UserProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  // Check if the current URL uses user_id_code format
  const isUserCode = /^[A-Z]{2}\d{6}$/.test(userId);

  // Handle special case for "settings" URL - redirect to user's own profile settings
  useEffect(() => {
    if (userId === 'settings') {
      if (!authLoading) {
        if (user) {
          router.push('/users/settings');
        } else {
          router.push('/auth/signin');
        }
      }
    }
  }, [userId, user, authLoading, router]);

  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'lists' | 'restaurants' | 'activity'>('reviews');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  // Use the new caching hook
  const {
    profile,
    reviews,
    lists,
    restaurants,
    loading,
    error,
    fetchUserRestaurants,
    hasCachedData,
    refreshProfile
  } = useUserData({
    userId,
    enableReviews: true,
    enableLists: true,
    enableRestaurants: activeTab === 'restaurants',
    autoFetch: true,
    cacheTTL: 5 * 60 * 1000 // 5 minutes cache
  });

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

  // Check if user is trying to access their own profile
  const isOwnProfile = user && userId === user.id;

  // Enhanced error validation
  const shouldShowNotFoundError = () => {
    // If we have an error and it's not a network/auth error, show not found
    if (error) {
      const isNotFoundError = error.includes('not found') || 
                              error.includes('private') ||
                              error.includes('404');
      const isAuthError = error.includes('unauthorized') ||
                          error.includes('authentication') ||
                          error.includes('401') ||
                          error.includes('403');
            
      return isNotFoundError || (!isAuthError && !loading);
    }
    return false;
  };

  // Load restaurants when restaurants tab is active
  useEffect(() => {
    if (activeTab === 'restaurants' && profile) {
      fetchUserRestaurants();
    }
  }, [activeTab, profile, fetchUserRestaurants]);

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/users/${userId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopySuccess(true);
      toast.success('Link do perfil copiado!');
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name} - Perfil FoodList`,
          text: `Confira o perfil de ${profile?.name} no FoodList!`,
          url: `${window.location.origin}/users/${userId}`,
        });
      } catch (error) {
      }
    } else {
      handleCopyProfileLink();
    }
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrivacyToggle = async () => {
    if (!profile) return;

    const newPrivacy = !profile.publicProfile;
    setIsUpdatingPrivacy(true);

    try {
      const response = await fetch(`/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: profile.name,
          bio: profile.bio,
          avatar_url: profile.profileImage,
          phone_number: profile.phoneNumber,
          website: profile.website,
          location: profile.location,
          public_profile: newPrivacy
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the profile in the cache and refresh the profile data
        toast.success(newPrivacy ? 'Perfil agora é público!' : 'Perfil agora é privado!');
        
        // Refresh the profile data to update the UI
        await refreshProfile();
      } else {
        throw new Error(data.error || 'Erro ao atualizar privacidade');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar privacidade do perfil');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const getPrivacyStatus = () => {
    if (profile?.publicProfile) {
      return { icon: Eye, text: 'Perfil Público', color: 'text-green-600' };
    } else {
      return { icon: EyeOff, text: 'Perfil Privado', color: 'text-red-600' };
    }
  };

  // Update privacy status after toggle
  const [privacyStatus, setPrivacyStatus] = useState(getPrivacyStatus());

  // Smart back navigation
  const { navigateBack } = useSmartBackNavigation({
    fallbackRoute: '/restaurants',
    userContext: user ? 'authenticated' : 'anonymous'
  });


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    
    // Use the enhanced error validation
    if (shouldShowNotFoundError()) {
      // If user is trying to access their own profile but it shows as private,
      // this shouldn't happen - they should always be able to access their own profile
      if (isOwnProfile) {
        // Show a specific error for own profile with retry options
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar seu perfil</h1>
              <p className="text-gray-600 mb-6">Ocorreu um erro ao carregar seu próprio perfil. Por favor, tente novamente.</p>
              <div className="space-x-4">
                <button
                  onClick={() => refreshProfile()}
                  className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => router.push('/users/settings')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Ir para Perfil
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        // Import and render the not-found component for private profiles
        const ProfileNotFound = React.lazy(() => import('./not-found'));
        return (
          <React.Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando...</p>
              </div>
            </div>
          }>
            <ProfileNotFound />
          </React.Suspense>
        );
      }
    }
    
    // For other errors (network, auth, etc.), show a generic error message
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Perfil não encontrado</h1>
          <p className="text-gray-600 mb-6">O usuário que você está procurando não existe.</p>
          <button
            onClick={() => router.push('/restaurants')}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Explorar Restaurantes
          </button>
        </div>
      </div>
    );
  }

  // Add null safety check for stats property with better error handling
  if (!profile.stats) {
    
    // Try to create stats object from available data as fallback
    const fallbackStats = {
      totalRestaurantsVisited: profile.total_restaurants_visited || 0,
      totalReviews: profile.total_reviews || 0,
      totalLists: profile.total_lists || 0,
      totalRestaurantsAdded: 0, // Will be fetched separately
      joinedDate: profile.created_at
    };
        
    // Update the profile with fallback stats
    const profileWithFallbackStats = {
      ...profile,
      stats: fallbackStats
    };
    
    // Return a component that uses the fallback stats
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Estatísticas temporariamente indisponíveis</h1>
          <p className="text-gray-600 mb-6">As estatísticas do perfil estão sendo carregadas. Por favor, aguarde um momento.</p>
          <div className="space-x-4">
            <button
              onClick={() => refreshProfile()}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Atualizar Perfil
            </button>
            <button
              onClick={() => router.push('/restaurants')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Voltar para Restaurantes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const PrivacyIcon = getPrivacyStatus().icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <div className={`absolute top-10 left-5 w-16 h-16 bg-amber-600 rounded-full animate-float-slow transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'} will-change-transform`}></div>
        <Utensils className={`absolute top-28 right-6 w-6 h-6 text-amber-900 animate-bounce-subtle transition-all duration-1000 delay-700 drop-shadow-lg ${isVisible ? 'scale-100' : 'scale-0'} will-change-transform`} />
        <List className={`absolute bottom-20 right-4 w-5 h-5 text-orange-800 animate-bounce-subtle transition-all duration-1000 delay-1500 drop-shadow-lg ${isVisible ? 'translate-x-0' : 'translate-x-5'} will-change-transform`} />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={navigateBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <div className="flex items-center gap-2">
              {profile.isOwnProfile && (
                <Link href="/users/settings" className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                  <Edit className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </Link>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Perfil de {profile.name}</h1>
          <p className="text-gray-600 mt-2">Descubra as avaliações e listas deste usuário</p>
        </div>

      {/* Profile Header */}
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image and Basic Info */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="lg:w-32 lg:h-32 w-24 h-24 relative flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-80" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      <User className="h-4 w-4 mr-1.5" />
                      {profile.userIdCode}
                    </span>
                    <button
                      onClick={handlePrivacyToggle}
                      disabled={isUpdatingPrivacy}
                      className={`h-8 w-8 ${getPrivacyStatus().color} transition-all duration-200 hover:scale-110 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                        isUpdatingPrivacy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title={profile.publicProfile ? 'Tornar perfil privado' : 'Tornar perfil público'}
                    >
                      <PrivacyIcon className={`h-5 w-5 ${getPrivacyStatus().color}`} />
                    </button>
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-3 line-clamp-3 text-sm sm:text-base">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {profile.location && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-700">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      Website
                    </a>
                  )}
                  {profile?.stats?.joinedDate && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      Membro desde {formatJoinedDate(profile.stats.joinedDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats - Mobile optimized */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-amber-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Restaurantes Visitados</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{profile.stats?.totalRestaurantsVisited ?? 0}</p>
                  </div>
                  <Utensils className="h-6 sm:h-8 w-6 sm:w-8 text-amber-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Avaliações</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{profile.stats?.totalReviews ?? 0}</p>
                  </div>
                  <Star className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-yellow-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Listas Criadas</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{profile.stats?.totalLists ?? 0}</p>
                  </div>
                  <List className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-green-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Restaurantes Adicionados</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{profile.stats?.totalRestaurantsAdded ?? 0}</p>
                  </div>
                  <Utensils className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Mobile optimized */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              onClick={handleCopyProfileLink}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[40px] min-w-[44px] sm:min-w-[140px]"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{copySuccess ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
            
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[40px] min-w-[44px] sm:min-w-[140px]"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { key: 'reviews', label: 'Avaliações', icon: Star, count: profile.stats?.totalReviews ?? 0 },
                { key: 'lists', label: 'Listas', icon: List, count: profile.stats?.totalLists ?? 0 },
                { key: 'restaurants', label: 'Restaurantes', icon: Utensils, count: profile.stats?.totalRestaurantsAdded ?? 0 },
                { key: 'activity', label: 'Atividade', icon: Clock, count: (profile.stats?.totalReviews ?? 0) + (profile.stats?.totalLists ?? 0) }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-amber-500 text-amber-600 bg-amber-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'reviews' && (
              <UserReviewsSection
                userId={userId}
                initialReviews={profile.recentReviews}
                initialTotal={profile.stats?.totalReviews ?? 0}
                isOwnProfile={profile.isOwnProfile}
              />
            )}

            {activeTab === 'lists' && (
              <UserListsSection
                userId={userId}
                initialLists={profile.recentLists}
                initialTotal={profile.stats?.totalLists ?? 0}
                isOwnProfile={profile.isOwnProfile}
              />
            )}

            {activeTab === 'restaurants' && (
              <UserRestaurantsSection
                userId={userId}
                initialRestaurants={restaurants}
                initialTotal={profile.stats?.totalRestaurantsAdded ?? 0}
                isOwnProfile={profile.isOwnProfile}
              />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-600" />
                      Últimas Avaliações
                    </h3>
                    {profile.recentReviews.length > 0 ? (
                      <div className="space-y-4">
                        {profile.recentReviews.slice(0, 3).map((review: any) => (
                          <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/restaurants/${review.restaurant.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                                  {review.restaurant.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-amber-600 font-semibold">{review.rating}/5</span>
                                  <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString('pt-PT')}</span>
                                </div>
                              </div>
                              {review.restaurant.imageUrl && (
                                <img
                                  src={review.restaurant.imageUrl}
                                  alt={review.restaurant.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Nenhuma avaliação encontrada.</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <List className="h-5 w-5 mr-2 text-blue-600" />
                      Últimas Listas
                    </h3>
                    {profile.recentLists.length > 0 ? (
                      <div className="space-y-4">
                        {profile.recentLists.slice(0, 3).map((list: any) => (
                          <div key={list.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/lists/${list.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                  {list.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-blue-600 font-semibold">{list.restaurantCount} restaurantes</span>
                                  <span className="text-gray-500 text-sm">{new Date(list.createdAt).toLocaleDateString('pt-PT')}</span>
                                </div>
                              </div>
                            </div>
                            {list.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">{list.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Nenhuma lista encontrada.</p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Estatísticas de Atividade
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">{profile.stats?.totalReviews ?? 0}</div>
                      <div className="text-sm text-gray-600">Avaliações</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{profile.stats?.totalLists ?? 0}</div>
                      <div className="text-sm text-gray-600">Listas</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{profile.stats?.totalRestaurantsVisited ?? 0}</div>
                      <div className="text-sm text-gray-600">Restaurantes Visitados</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
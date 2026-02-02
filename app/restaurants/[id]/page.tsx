// app/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { usePublicApiClient } from '@/hooks/usePublicApiClient';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import { Review, ReviewFormData } from '@/libs/types';

// Extend Review type to handle null profileImage
interface ExtendedReview extends Review {
  user: Review['user'] & {
    profileImage: string | null | undefined;
  };
}
import Image from 'next/image';
import ReviewForm from '@/components/ui/ReviewForm';
import Link from 'next/link';
import {
  Star, ListChecks, Edit, MapPin, Globe,
  FileText, Check, X, User, Euro, Tag, Clock, Share2, Calendar, Phone, Smartphone, Home, Plus, Image as ImageIcon
} from 'lucide-react';
import { formatPrice, categorizePriceLevel, getRatingClass, formatDate, formatDescription } from '@/utils/formatters';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { logError, logWarn, logInfo } from '@/utils/logger';
import { toast } from 'react-toastify';
import MapSelectorModal from '@/components/ui/MapSelectorModal';
import ScheduleMealModal from '@/components/ui/ScheduleMealModal';
import RestaurantImagePlaceholder from '@/components/ui/RestaurantImagePlaceholder';
import MenuCarousel from '@/components/ui/MenuCarousel';
import RestaurantCarousel from '@/components/ui/RestaurantCarousel';
import { Navigation } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: any[];
  review_count?: number;
  display_image_index?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  dietary_options?: any[];
  features?: any[];
}

export default function RestaurantDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { get, post, patch, del } = useSecureApiClient();
  const { get: getPublic } = usePublicApiClient();
  const supabase = createClient();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [visitData, setVisitData] = useState({ visited: false, visitCount: 0 });
  const [lists, setLists] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userProfile, setUserProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Memoize functions to prevent infinite re-renders
  const fetchRestaurantDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      // Fetch restaurant details using the updated API route that includes features and dietary options
      const response = await getPublic(`/api/restaurants/${id}`);
      const data = await response.json();

      if (response.ok && data.restaurant) {
        setRestaurant(data.restaurant);
        
        // Extract cuisine types from the joined data
        if (data.restaurant.cuisine_types) {
          setCuisineTypes(data.restaurant.cuisine_types);
        }
        
        // Debug logs to check data structure
        console.log('Restaurant data:', data.restaurant);
        console.log('Cuisine types:', data.restaurant.cuisine_types);
        console.log('Dietary options:', data.restaurant.dietary_options);
        console.log('Features:', data.restaurant.features);
      } else {
        throw new Error(data.error || 'Failed to fetch restaurant details');
      }

      // Fetch lists containing this restaurant
      const { data: listRelations, error: listRelationsError } = await supabase
        .from('list_restaurants')
        .select('list_id')
        .eq('restaurant_id', id);

      if (listRelationsError) throw listRelationsError;

      if (listRelations && listRelations.length > 0) {
        const listIds = (listRelations as any[]).map((item: any) => item.list_id);

        const { data: listDetails, error: listDetailsError } = await supabase
          .from('lists')
          .select('*')
          .in('id', listIds);

        if (listDetailsError) throw listDetailsError;

        if (listDetails) {
          setLists(listDetails);
        }
      }

      // Fetch reviews for this restaurant
      await fetchReviews();

      // Fetch review count for this restaurant using public API
      try {
        const response = await getPublic(`/api/reviews?restaurant_id=${id}`);
        const data = await response.json();
        setReviewCount(data.reviews?.length || 0);
      } catch (error) {
        logError('Error fetching review count', error);
      }
    } catch (error) {
      logError('Error fetching restaurant details', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;

    setLoadingReviews(true);
    try {
      const response = await getPublic(`/api/reviews?restaurant_id=${id}`);
      const data = await response.json();

      if (response.ok) {
        // Inject current user's profile image if they have a review and it's missing
        const processedReviews = (data.reviews || []).map((review: any) => {
          if (review.user_id === user?.id && !review.user.profileImage && userProfile?.avatar_url) {
            return {
              ...review,
              user: {
                ...review.user,
                profileImage: userProfile.avatar_url
              }
            };
          }
          return review;
        });

        setReviews(processedReviews);
      } else {
        logError('Error fetching reviews', new Error(data.error || 'Unknown error'));
      }
    } catch (error) {
      logError('Error fetching reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id, user, userProfile, getPublic]);

  // Helper function to sanitize and validate external URLs
  const sanitizeUrl = (urlString: string): string | null => {
    if (!urlString || typeof urlString !== 'string') {
      logWarn('sanitizeUrl: Invalid input - not a string or empty', {
        input: urlString,
        type: typeof urlString,
        length: urlString?.length
      });
      return null;
    }

    try {
      // Remove any potential script injection attempts
      const sanitized = urlString.trim().replace(/[<>'"&]/g, '');

      // Log if input was modified during sanitization
      if (sanitized !== urlString.trim()) {
        logWarn('sanitizeUrl: Input contained potentially dangerous characters', {
          original: urlString.substring(0, 100),
          sanitized: sanitized.substring(0, 100),
          dangerousChars: urlString.match(/[<>'"&]/g)?.join('') || 'none'
        });
      }

      const url = new URL(sanitized);

      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        logWarn('sanitizeUrl: Invalid protocol', {
          protocol: url.protocol,
          hostname: url.hostname,
          href: url.href.substring(0, 100)
        });
        return null;
      }

      // Basic length check to prevent extremely long URLs
      if (url.href.length > 2048) {
        logWarn('sanitizeUrl: URL too long', {
          length: url.href.length,
          hostname: url.hostname,
          href: url.href.substring(0, 100)
        });
        return null;
      }

      // Additional security checks for common attack vectors
      const hostname = url.hostname.toLowerCase();

      // Prevent localhost/private IP access
      if (hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        logWarn('sanitizeUrl: Blocked localhost/private IP access', {
          hostname: hostname,
          href: url.href.substring(0, 100)
        });
        return null;
      }

      return url.href;
    } catch (error) {
      logWarn('sanitizeUrl: URL parsing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        originalUrl: urlString.substring(0, 100),
        errorType: error instanceof Error ? error.name : typeof error
      });
      return null;
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await get(`/api/profile`);
          if (response.ok) {
            const profileData = await response.json();
            setUserProfile({
              display_name: profileData.display_name || undefined,
              avatar_url: profileData.avatar_url || undefined
            });
        } else if (response.status === 401) {
          // Handle unauthorized access gracefully
          logWarn('User not authenticated for profile access');
        }
        } catch (error) {
          logError('Error fetching user profile', error);
          // Don't show error toast for authentication issues
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage !== 'No authentication token found') {
            logWarn('Non-authentication error occurred');
          }
        }
      }
    };

    fetchUserProfile();
  }, [user?.id, get]);

  // Fetch visit data for authenticated users
  useEffect(() => {
    const fetchVisitData = async () => {
      if (!user) return;

      try {
        const response = await get(`/api/restaurants/${id}/visits`);
        const data = await response.json();
        setVisitData({ visited: data.visited, visitCount: data.visitCount });
      } catch (error) {
        logError('Error fetching visit data', error);
      }
    };

    fetchVisitData();
  }, [user, id, get]);

  // Ensure visit count is updated when visited becomes true
  useEffect(() => {
    if (visitData.visited && visitData.visitCount === 0) {
      // If visited is true but visitCount is still 0, refetch the data
      const refetchVisitData = async () => {
        try {
          const response = await get(`/api/restaurants/${id}/visits`);
          const data = await response.json();
          setVisitData(prev => ({ ...prev, visitCount: data.visitCount }));
        } catch (error) {
          logError('Error refetching visit data', error);
        }
      };

      refetchVisitData();
    }
  }, [visitData.visited, visitData.visitCount, id, get]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sanitizedUrl = sanitizeUrl(window.location.href);
      if (sanitizedUrl) {
        setShareUrl(sanitizedUrl);
      } else {
        logWarn('Failed to sanitize share URL from window.location.href');
        // Fallback to a safe default or disable sharing
        setShareUrl('');
      }
    }

    fetchRestaurantDetails();
  }, [id, fetchRestaurantDetails]);



  // Function to show notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000); // Auto-hide after 4 seconds
  };

  // Helper function to validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      logWarn('isValidUrl: URL validation failed', {
        urlString: urlString?.substring(0, 100),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const handleShareClick = async () => {
    // Security-first validation: check if URL was properly sanitized during initialization
    if (!shareUrl || shareUrl.trim() === '') {
      logWarn('Share URL is empty - likely failed sanitization during initialization');
      showNotification('error', 'Não foi possível compartilhar: URL não disponível');
      return;
    }

    // Additional runtime validation with security checks
    const sanitizedUrl = sanitizeUrl(shareUrl);
    if (!sanitizedUrl) {
      logWarn('Share URL failed runtime sanitization', { originalUrl: shareUrl?.substring(0, 100) });
      showNotification('error', 'Não foi possível compartilhar: URL inválida');
      return;
    }

    const shareData = {
      title: restaurant?.name || 'Restaurante',
      text: `Confira este restaurante: ${restaurant?.name || ''}`,
      url: sanitizedUrl
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        logInfo('Restaurant shared successfully using Web Share API');
      } else {
        // Web Share API not supported - copy to clipboard as fallback
        logWarn('Web Share API not supported, falling back to clipboard');

        if (!navigator.clipboard) {
          logWarn('Clipboard API also not supported');
          showNotification('error', 'Compartilhamento não suportado neste navegador. Copie o link manualmente.');
          return;
        }

        // Final security validation before clipboard write
        if (!sanitizedUrl || sanitizedUrl.trim() === '') {
          logWarn('Sanitized URL is empty before clipboard operation');
          showNotification('error', 'Erro interno: URL inválida para cópia');
          return;
        }

        await navigator.clipboard.writeText(sanitizedUrl);
        logInfo('Link copied to clipboard as fallback for share');
        showNotification('success', 'Link copiado para a área de transferência!');
      }
    } catch (error) {
      logError('Failed to share restaurant', error, { shareData });

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showNotification('error', 'Compartilhamento não permitido. Verifique as permissões do navegador.');
        } else if (error.name === 'AbortError') {
          // User cancelled the share - don't show error
          logWarn('User cancelled share operation');
        } else if (error.name === 'InvalidStateError') {
          // Another share operation is already in progress
          showNotification('error', 'Uma operação de compartilhamento já está em andamento. Aguarde e tente novamente.');
        } else {
          showNotification('error', 'Erro ao compartilhar. Tente novamente.');
        }
      } else {
        showNotification('error', 'Erro desconhecido ao compartilhar.');
      }
    }
  };
  
  const handleToggleVisited = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const response = await patch(`/api/restaurants/${id}/visits`, { action: 'toggle_visited' });
      const data = await response.json();
      setVisitData({ visited: data.visited, visitCount: data.visitCount });

      // Show success toast
      toast.success(
        data.visited
          ? 'Restaurante marcado como visitado!'
          : 'Restaurante marcado como não visitado!',
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base"
        }
      );
    } catch (err) {
      logError('Erro ao atualizar status de visitado', err);

      // Show error toast
      toast.error('Erro ao atualizar status de visita. Tente novamente.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddVisit = async () => {
    try {
      const response = await post(`/api/restaurants/${id}/visits`);
      const data = await response.json();
      setVisitData(prev => ({ ...prev, visitCount: data.visitCount }));

      // Show success toast
      toast.success('Visita adicionada com sucesso!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    } catch (err) {
      logError('Erro ao adicionar visita', err);

      // Show error toast
      toast.error('Erro ao adicionar visita. Tente novamente.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    }
  };

  const handleRemoveVisit = async () => {
    try {
      const response = await patch(`/api/restaurants/${id}/visits`, { action: 'remove_visit' });
      const data = await response.json();
      setVisitData(prev => ({ ...prev, visitCount: data.visitCount, visited: data.visited }));

      // Show success toast
      toast.success('Visita removida com sucesso!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    } catch (err) {
      logError('Erro ao remover visita', err);

      // Show error toast
      toast.error('Erro ao remover visita. Tente novamente.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    }
  };
  


  // Get color class based on price level
  const getPriceColorClass = (level: number): string => {
    // Classes para os ícones - variação de cores mantendo legibilidade
    switch(level) {
      case 1: return 'text-amber-400';
      case 2: return 'text-amber-500';
      case 3: return 'text-amber-600';
      case 4: return 'text-amber-800';
      default: return 'text-amber-400';
    }
  };
  
  // Classe para o texto do label - garantindo melhor legibilidade
  const getPriceLabelClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  // Renderiza o nível de preço com ícones de Euro
  const renderPriceLevel = (price: number): React.ReactNode => {
    const priceCategory = categorizePriceLevel(price);
    const priceColorClass = getPriceColorClass(priceCategory.level);
    
    return (
      <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i} className={`h-4 w-4 ${priceColorClass}`} fill="currentColor" />
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i + priceCategory.level} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        <span className={`ml-2 text-sm ${getPriceLabelClass(priceCategory.level)}`}>{priceCategory.label}</span>
        <div className="ml-auto text-amber-600 font-semibold">
          {formatPrice(price)}
          <span className="text-sm text-gray-500 ml-1">por pessoa</span>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-xl shadow-md h-96 mb-6"></div>
          <div className="animate-pulse bg-white p-6 rounded-lg shadow-md h-24 mb-6"></div>
        </div>
      </div>
    );
  }
  
    if (!restaurant) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Restaurante não encontrado</h2>
            <Link href="/restaurants" className="mt-4 inline-block text-amber-600 hover:underline">
              Voltar para a página de restaurantes
            </Link>
          </div>
        </div>
      );
    }

  // Função para detectar se um número é móvel ou fixo
  const detectPhoneType = (phoneNumber: string): string => {
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

  // Obtém a classe de estilo para a avaliação
  const ratingClass = getRatingClass(restaurant.rating || 0);

  // Handle review submission
  const handleReviewSubmitted = async (newReview: Review) => {
    if (editingReview) {
      // Update existing review - refetch reviews to ensure profile image is updated
      await fetchReviews();
    } else {
      // Add new review - inject current user's profile image
      const reviewWithImage = {
        ...newReview,
        user: {
          ...newReview.user,
          profileImage: userProfile?.avatar_url || undefined
        }
      };
      setReviews(prev => [reviewWithImage, ...prev]);
      setReviewCount(prev => prev + 1);
    }
    setShowReviewForm(false);
    setEditingReview(null);

    // Update restaurant rating after successful review submission/update
    await updateRestaurantRating(id || '');

    // Fetch updated restaurant data to get the new rating and price_per_person
    try {
      const response = await get(`/api/restaurants/${id}`);
      const data = await response.json();
      if (response.ok && data.restaurant) {
        setRestaurant(data.restaurant);
      }
    } catch (error) {
      logError('Error fetching updated restaurant data', error);
    }

    toast.success(editingReview ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!');
  };

  // Handle review edit
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta avaliação?')) {
      return;
    }

    try {
      const response = await del(`/api/reviews/${reviewId}`);
      
      if (response.ok) {
        // Update local state
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setReviewCount(prev => prev - 1);

    // Update restaurant rating after successful review deletion
    if (id) {
      await updateRestaurantRating(id);
    }

    // Fetch updated restaurant data to get the new rating and price_per_person
    try {
      const response = await get(`/api/restaurants/${id}`);
      const data = await response.json();
      if (response.ok && data.restaurant) {
        setRestaurant(data.restaurant);
      }
    } catch (error) {
      logError('Error fetching updated restaurant data', error);
    }

        toast.success('Avaliação eliminada com sucesso!');
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao eliminar avaliação. Tente novamente.');
    }
  };

  // Helper function to update restaurant rating based on reviews
  const updateRestaurantRating = async (restaurantId: string) => {
    try {
      // Calculate average rating from all reviews for this restaurant
      const response = await get(`/api/reviews?restaurant_id=${restaurantId}`);
      const data = await response.json();
      
      let averageRating = 0;
      if (data.reviews && data.reviews.length > 0) {
        const totalRating = data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
        averageRating = totalRating / data.reviews.length;
      }
      // If no reviews, rating should be 0

      // Update the restaurant's rating via API
      try {
        const updateResponse = await patch(`/api/restaurants/${restaurantId}`, { rating: averageRating });
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Error updating restaurant rating via API:', errorText);
          // Don't throw error, just log it - rating update is not critical for user experience
        }
      } catch (error) {
        console.error('Error updating restaurant rating:', error);
        // Don't throw error, just log it - rating update is not critical for user experience
      }
    } catch (error) {
      console.error('Error in updateRestaurantRating:', error);
      // Don't throw error, just log it - rating update is not critical for user experience
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`px-4 py-3 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-1 text-sm font-medium">
                {notification.message}
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`ml-3 text-sm font-medium hover:underline ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-end mb-4 sm:mb-6">
          <div className="flex w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={handleShareClick}
              disabled={!shareUrl || shareUrl.trim() === ''}
              className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              aria-label="Compartilhar"
              title={!shareUrl || shareUrl.trim() === '' ? 'Compartilhamento não disponível' : 'Compartilhar'}
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Compartilhar</span>
              <span className="sm:hidden">Compartilhar</span>
            </button>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
              aria-label="Agendar refeição"
              title="Agendar refeição"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Agendar Refeição</span>
              <span className="sm:hidden">Agendar</span>
            </button>
            {user && restaurant?.creator_id === user.id && (
              <Link
                href={`/restaurants/${id}/edit`}
                className="flex items-center justify-center bg-amber-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                <Edit className="h-4 w-4 mr-1.5 sm:mr-1" />
                <span className="text-sm sm:text-base">Editar</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
          {/* Restaurant Images Carousel */}
          <div className="relative">
            {(() => {
              // Check if restaurant has images array with content
              const hasImages = restaurant.images && restaurant.images.length > 0;

              if (hasImages) {
                // Process images: if display_image_index is valid, move that image to front
                let processedImages = [...(restaurant.images || [])];

                if (restaurant.display_image_index !== undefined &&
                    restaurant.display_image_index >= 0 &&
                    restaurant.display_image_index < (restaurant.images?.length || 0) &&
                    restaurant.display_image_index !== 0) {
                  // Move display image to front
                  const displayImage = processedImages.splice(restaurant.display_image_index, 1)[0];
                  processedImages.unshift(displayImage);
                }

                // Convert Cloudinary URLs and filter out any undefined/null values
                const carouselImages = processedImages
                  .map(img => convertCloudinaryUrl(img))
                  .filter((url): url is string => typeof url === 'string' && url.length > 0) as string[];

                return (
                  <RestaurantCarousel
                    images={carouselImages}
                    className="w-full"
                  />
                );
              } else {
                // Fallback to single image logic for backward compatibility
                const imageUrl = restaurant.image_url ? convertCloudinaryUrl(restaurant.image_url) : null;
                const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && restaurant.image_url;

                return (
                  <div className="relative h-48 sm:h-56 md:h-[24rem] lg:h-[28rem] w-full">
                    {hasImage ? (
                      <Image
                        src={imageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 1200px"
                        priority
                      />
                    ) : (
                      <RestaurantImagePlaceholder
                        iconSize="80"
                        textSize="text-lg"
                        showText={true}
                      />
                    )}
                  </div>
                );
              }
            })()}

            {/* Visit controls for authenticated users - positioned over carousel */}
            {user && (
              <>
                {/* Badge com Switch Button */}
                <button
                  onClick={handleToggleVisited}
                  disabled={isUpdating}
                  className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:shadow-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    visitData.visited
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  title={visitData.visited ? 'Clique para marcar como não visitado' : 'Clique para marcar como visitado'}
                >
                  {visitData.visited ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Visitado</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Não visitado</span>
                    </>
                  )}
                </button>

                {/* Visit counter and +1/-1 buttons - positioned below the toggle button */}
                {visitData.visited && (
                  <div className="absolute top-16 right-2 sm:right-4 z-10 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 px-2.5 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">Visitas</span>
                    </div>
                    <div className="flex items-center bg-amber-50 rounded-lg px-2 py-0.5">
                      <span className="text-xs sm:text-sm font-bold text-amber-700 tabular-nums">{visitData.visitCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleRemoveVisit}
                        disabled={visitData.visitCount <= 0}
                        className="group flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-500 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                        title="Remover -1 visita"
                      >
                        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 group-hover:rotate-90 transition-transform duration-200" />
                      </button>
                      <button
                        onClick={handleAddVisit}
                        className="group flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                        title="Adicionar +1 visita"
                      >
                        <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              {restaurant.rating !== null && restaurant.rating !== undefined && (
                <div className={`flex items-center ${ratingClass} px-3 py-2 rounded self-start`}>
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="currentColor" />
                  <span className="font-semibold text-base sm:text-lg">{(restaurant.rating || 0).toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Seção de Categorias - Culinária, Dietéticas e Recursos */}
            {(cuisineTypes && cuisineTypes.length > 0) || 
             (restaurant.dietary_options && restaurant.dietary_options.length > 0) || 
             (restaurant.features && restaurant.features.length > 0) ? (
              <div className="mt-4 bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-amber-500" />
                  Categorias & Características
                </h3>
                
                <div className="space-y-4">
                  {/* Culinária */}
                  {cuisineTypes && cuisineTypes.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 mr-2">
                          🍽️ Culinária
                        </span>
                        <span className="text-xs text-gray-500">Tipos de cozinha</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cuisineTypes.map((type: any, index: number) => (
                          <span 
                            key={type.cuisine_type?.id || `cuisine-${index}`} 
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200 hover:shadow-sm transition-all duration-200 hover:scale-105"
                          >
                            <Tag className="h-3 w-3 mr-2 text-amber-600" />
                            {type.cuisine_type?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opções Dietéticas */}
                  {restaurant.dietary_options && restaurant.dietary_options.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 mr-2">
                          🥗 Opções Dietéticas
                        </span>
                        <span className="text-xs text-gray-500">Restrições alimentares</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {restaurant.dietary_options.map((option: any, index: number) => (
                          <div 
                            key={option.dietary_option?.id || `dietary-${index}`} 
                            className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-green-300"
                            title={option.dietary_option?.description || option.dietary_option?.name}
                          >
                            <div className="flex-shrink-0 bg-white rounded-full p-1.5 shadow-sm mr-3">
                              <span className="text-lg">{option.dietary_option?.icon || '🥗'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-green-800">{option.dietary_option?.name}</span>
                              {option.dietary_option?.description && (
                                <p className="text-xs text-green-600 mt-1 italic line-clamp-2">{option.dietary_option.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recursos do Restaurante */}
                  {restaurant.features && restaurant.features.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          ⭐ Recursos Disponíveis
                        </span>
                        <span className="text-xs text-gray-500">Comodidades e serviços</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {restaurant.features.map((feature: any, index: number) => (
                          <div 
                            key={feature.feature?.id || `feature-${index}`} 
                            className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-blue-300 group"
                            title={feature.feature?.description || feature.feature?.name}
                          >
                            <div className="flex-shrink-0 bg-white rounded-full p-1.5 shadow-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                              <span className="text-lg">{feature.feature?.icon || '⭐'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-blue-800">{feature.feature?.name}</span>
                              {feature.feature?.description && (
                                <p className="text-xs text-blue-600 mt-1 italic line-clamp-2">{feature.feature.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Este restaurante ainda não possui categorias ou características definidas
                </div>
              </div>
            )}
            
            {(() => {
              const formattedDescription = formatDescription(restaurant.description || '');
              if (!formattedDescription || formattedDescription.length === 0) return null;

              if (formattedDescription.length === 1) {
                return <p className="text-gray-600 mt-4">{formattedDescription[0]}</p>;
              }

              return (
                <div className="text-gray-600 mt-4 space-y-3">
                  {formattedDescription.map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              );
            })()}
            
            {/* Informações de preço mais destacadas - apenas se visitado e houver preço positivo definido */}
            {visitData.visited && restaurant.price_per_person && restaurant.price_per_person > 0 && renderPriceLevel(restaurant.price_per_person)}
            
            {/* Campos adicionais agora com cards estilizados */}
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {restaurant.location && (
                <div
                  className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                  onClick={() => setIsMapModalOpen(true)}
                >
                  <MapPin className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">{restaurant.location}</span>
                  <span className="text-xs sm:text-sm text-amber-600 ml-2">Abrir no mapa</span>
                </div>
              )}

              {restaurant.phone_numbers && restaurant.phone_numbers.length > 0 && (
                <div className="flex items-start text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0">
                  <Phone className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-grow">
                    <div className="text-sm sm:text-base font-medium mb-2">Telefones para contato</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {restaurant.phone_numbers.map((phone, index) => {
                        const phoneType = detectPhoneType(phone);
                        const PhoneIcon = phoneType === 'mobile' ? Smartphone : Home;

                        return (
                          <div
                            key={index}
                            className="flex items-center p-2 bg-white rounded-md border border-gray-200 hover:border-amber-300 transition-colors"
                          >
                            <PhoneIcon className="h-4 w-4 mr-2 text-amber-500" />
                            <a
                              href={`tel:${phone}`}
                              className="text-sm text-amber-600 hover:text-amber-800 hover:underline flex-1"
                            >
                              {phone}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {restaurant.source_url && (
                <div 
                  className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                  onClick={() => window.open(restaurant.source_url || '', '_blank', 'noopener,noreferrer')}
                >
                  <Globe className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">Fonte Original</span>
                  <a 
                    href={restaurant.source_url || ''} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-800 hover:underline text-xs sm:text-sm ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visitar site
                  </a>
                </div>
              )}

              {/* Menu Links */}
              {restaurant.menu_links && restaurant.menu_links.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <Globe className="h-4 w-4 mr-2 text-amber-500" />
                    Links de Menus ({restaurant.menu_links.length})
                  </div>
                  {(restaurant.menu_links || []).map((link: string, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                      onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                    >
                      <FileText className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                      <span className="flex-grow text-sm sm:text-base truncate">{link}</span>
                      <span className="text-amber-600 hover:text-amber-800 hover:underline text-xs sm:text-sm ml-2">
                        Ver menu
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Menu Images Carousel */}
              {restaurant.menu_images && restaurant.menu_images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 mr-2 text-amber-500" />
                    Imagens do Menu ({restaurant.menu_images.length})
                  </div>
                  <MenuCarousel
                    images={(restaurant.menu_images || []).map((img: string) => convertCloudinaryUrl(img)).filter((url): url is string => typeof url === 'string' && url.length > 0) as string[]}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            {/* Informações do criador */}
            <div className="mt-3 text-sm flex items-center text-gray-500">
              <User className="h-4 w-4 mr-1" />
              Adicionado por: {restaurant.creator_name || 'Anônimo'}
            </div>
            {/* Data de adição */}
            {restaurant.created_at && (
              <div className="mt-3 text-sm flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Adicionado em: {formatDate(restaurant.created_at)}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-amber-500" />
            Listas que incluem este restaurante
          </h2>
          
              {lists.length === 0 ? (
                <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Este restaurante não está em nenhuma lista.</p>
              ) : (
                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                  {lists.map((list: any) => (
                    <Link key={list.id} href={`/lists/${list.id}`} className="block">
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[60px] sm:min-h-0">
                        <h3 className="font-medium text-gray-800 text-sm sm:text-base">{list.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{list.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <div className="bg-amber-500 rounded-full p-2 mr-3">
                  <Star className="h-5 w-5 text-white fill-current" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Avaliações
                  </h2>
                  <p className="text-sm text-gray-600">{reviewCount} avaliação{reviewCount !== 1 ? 'ões' : ''}</p>
                </div>
              </div>
              {user && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium min-h-[44px] sm:min-h-0"
                >
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  Avaliar Restaurante
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {(showReviewForm || editingReview) && (
              <div className="mb-6 sm:mb-8">
                <ReviewForm
                  restaurantId={Array.isArray(id) ? id[0] : id}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                  initialReview={editingReview}
                />
              </div>
            )}

            {loadingReviews ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-amber-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-10 w-10 text-amber-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Nenhuma avaliação ainda
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-4 max-w-sm mx-auto">
                  Este restaurante ainda não foi avaliado. Seja o primeiro a compartilhar sua experiência!
                </p>
                {user && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <Star className="h-5 w-5 mr-2 fill-current" />
                    Fazer primeira avaliação
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex-shrink-0">
                          {review.user.profileImage ? (
                            <img
                              src={review.user.profileImage}
                              alt={`${review.user.name}'s profile`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-amber-600 font-semibold text-sm">
                                {review.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">
                              {review.user.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {Array(5).fill(0).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                    i < review.rating
                                      ? 'text-amber-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs sm:text-sm text-gray-600 ml-1 font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mt-2">
                              {review.comment}
                            </p>
                          )}
                          {review.amount_spent && review.amount_spent > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Euro className="h-4 w-4 text-amber-500" />
                              <span>Valor gasto: <span className="font-semibold text-amber-600">{formatPrice(review.amount_spent)}</span></span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border">
                          {formatDate(review.created_at)}
                        </span>
                        {user && review.user_id === user.id && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingReview(review)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200 touch-feedback"
                              title="Editar avaliação"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 touch-feedback"
                              title="Eliminar avaliação"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MapSelectorModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        location={restaurant.location || ''}
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
      />

      <ScheduleMealModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        restaurantName={restaurant.name}
        restaurantLocation={restaurant.location || ''}
        restaurantDescription={restaurant.description || ''}
      />
    </div>
  );
}

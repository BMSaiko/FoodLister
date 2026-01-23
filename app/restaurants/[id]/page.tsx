// app/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import Navbar from '@/components/layouts/Navbar';
import { Review, ReviewFormData } from '@/libs/types';
import Image from 'next/image';
import ReviewForm from '@/components/ui/ReviewForm';
import Link from 'next/link';
import {
  ArrowLeft, Star, ListChecks, Edit, MapPin, Globe,
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

export default function RestaurantDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, getAccessToken } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
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

  const supabase = createClient();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Memoize functions to prevent infinite re-renders
  const fetchRestaurantDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;

      if (restaurantData) {
        setRestaurant(restaurantData as any);

        // Fetch cuisine types for this restaurant
        const { data: cuisineRelations, error: cuisineRelationsError } = await supabase
          .from('restaurant_cuisine_types')
          .select('cuisine_type_id')
          .eq('restaurant_id', id);

        if (cuisineRelationsError) throw cuisineRelationsError;

        if (cuisineRelations && cuisineRelations.length > 0) {
          const cuisineTypeIds = (cuisineRelations as any[]).map((item: any) => item.cuisine_type_id);

          const { data: cuisineTypeDetails, error: cuisineTypeError } = await supabase
            .from('cuisine_types')
            .select('*')
            .in('id', cuisineTypeIds);

          if (cuisineTypeError) throw cuisineTypeError;

          if (cuisineTypeDetails) {
            setCuisineTypes(cuisineTypeDetails);
          }
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

        // Fetch review count for this restaurant
        const { count: reviewCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', id);

        if (countError) {
          console.error('Error fetching review count:', countError);
        } else {
          setReviewCount(reviewCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;

    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?restaurant_id=${id}`);
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
        console.error('Error fetching reviews:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id, user, userProfile]);

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
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .single();

          if (!error && profileData) {
            setUserProfile({
              display_name: (profileData as any).display_name || undefined,
              avatar_url: (profileData as any).avatar_url || undefined
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Fetch visit data for authenticated users
  useEffect(() => {
    const fetchVisitData = async () => {
      if (!user) return;

      try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`/api/restaurants/${id}/visits`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setVisitData({ visited: data.visited, visitCount: data.visitCount });
        } else {
          console.error('Failed to fetch visit data');
        }
      } catch (error) {
        console.error('Error fetching visit data:', error);
      }
    };

    fetchVisitData();
  }, [user, id, getAccessToken]);

  // Ensure visit count is updated when visited becomes true
  useEffect(() => {
    if (visitData.visited && visitData.visitCount === 0) {
      // If visited is true but visitCount is still 0, refetch the data
      const refetchVisitData = async () => {
        try {
          const token = await getAccessToken();
          if (!token) return;

          const response = await fetch(`/api/restaurants/${id}/visits`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setVisitData(prev => ({ ...prev, visitCount: data.visitCount }));
          }
        } catch (error) {
          console.error('Error refetching visit data:', error);
        }
      };

      refetchVisitData();
    }
  }, [visitData.visited, visitData.visitCount, id, getAccessToken]);

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
  
  const handleToggleVisited = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/restaurants/${id}/visits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'toggle_visited' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visit status');
      }

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
      console.error('Erro ao atualizar status de visitado:', err);

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
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/restaurants/${id}/visits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to add visit');
      }

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
      console.error('Erro ao adicionar visita:', err);

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
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/restaurants/${id}/visits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'remove_visit' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove visit');
      }

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
      console.error('Erro ao remover visita:', err);

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
  const getPriceColorClass = (level) => {
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
  const getPriceLabelClass = (level) => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  // Renderiza o nível de preço com ícones de Euro
  const renderPriceLevel = (price) => {
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

  // Obtém a classe de estilo para a avaliação
  const ratingClass = getRatingClass(restaurant.rating);

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
          profileImage: userProfile?.avatar_url || null
        }
      };
      setReviews(prev => [reviewWithImage, ...prev]);
      setReviewCount(prev => prev + 1);
    }
    setShowReviewForm(false);
    setEditingReview(null);

    // Update restaurant rating after successful review submission/update
    await updateRestaurantRating(id);

    // Fetch updated restaurant data to get the new rating
    const { data: updatedRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('rating')
      .eq('id', id)
      .single();

    if (!fetchError && updatedRestaurant && restaurant) {
      // Update local restaurant state with new rating
      setRestaurant({ ...(restaurant as any), rating: (updatedRestaurant as any).rating });
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
      // Use Supabase client for authenticated request
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user can only delete their own reviews

      if (error) {
        console.error('Error deleting review:', error);
        toast.error('Erro ao eliminar avaliação');
        return;
      }

      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setReviewCount(prev => prev - 1);

      // Update restaurant rating after successful review deletion
      await updateRestaurantRating(id);

      // Fetch updated restaurant data to get the new rating
      const { data: updatedRestaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('rating')
        .eq('id', id)
        .single();

      if (!fetchError && updatedRestaurant && restaurant) {
        // Update local restaurant state with new rating
        setRestaurant({ ...(restaurant as any), rating: (updatedRestaurant as any).rating });
      }

      toast.success('Avaliação eliminada com sucesso!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao eliminar avaliação. Tente novamente.');
    }
  };

  // Helper function to update restaurant rating based on reviews
  const updateRestaurantRating = async (restaurantId: string) => {
    try {
      // Calculate average rating from all reviews for this restaurant
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId);

      if (reviewsError) {
        console.error('Error fetching reviews for rating calculation:', reviewsError);
        return;
      }

      let averageRating = 0;
      if (reviews && reviews.length > 0) {
        const totalRating = (reviews as any[]).reduce((sum, review: any) => sum + review.rating, 0);
        averageRating = totalRating / reviews.length;
      }
      // If no reviews, rating should be 0

      // Update the restaurant's rating
      const { error: updateError } = await (supabase as any)
        .from('restaurants')
        .update({ rating: averageRating })
        .eq('id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant rating:', updateError);
      }
    } catch (error) {
      console.error('Error in updateRestaurantRating:', error);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <Link href="/restaurants" className="flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 transition-colors min-h-[44px] sm:min-h-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Link>
          
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
          <div className="relative h-48 sm:h-56 md:h-[24rem] lg:h-[28rem] w-full">
            {(() => {
              const imageUrl = convertCloudinaryUrl(restaurant.image_url);
              const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && restaurant.image_url;

              return hasImage ? (
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
              );
            })()}
            
            {/* Visit controls for authenticated users */}
            {user && (
              <>
                {/* Badge com Switch Button */}
                <button
                  onClick={handleToggleVisited}
                  disabled={isUpdating}
                  className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:shadow-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  <div className="absolute top-16 right-2 sm:right-4 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 px-2.5 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 backdrop-blur-sm">
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
              {visitData.visited && (
                <div className={`flex items-center ${ratingClass} px-3 py-2 rounded self-start`}>
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="currentColor" />
                  <span className="font-semibold text-base sm:text-lg">{(restaurant.rating || 0).toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Mostrar categorias culinárias */}
            {cuisineTypes && cuisineTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cuisineTypes.map(type => (
                  <span 
                    key={type.id} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700"
                  >
                    <Tag className="h-4 w-4 mr-1.5 text-amber-500" />
                    {type.name}
                  </span>
                ))}
              </div>
            )}
            
            {(() => {
              const formattedDescription = formatDescription(restaurant.description);
              if (!formattedDescription || formattedDescription.length === 0) return null;

              if (formattedDescription.length === 1) {
                return <p className="text-gray-600 mt-4">{formattedDescription[0]}</p>;
              }

              return (
                <div className="text-gray-600 mt-4 space-y-3">
                  {formattedDescription.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              );
            })()}
            
            {/* Informações de preço mais destacadas - apenas se visitado */}
            {visitData.visited && renderPriceLevel(restaurant.price_per_person)}
            
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
                  onClick={() => window.open(restaurant.source_url, '_blank', 'noopener,noreferrer')}
                >
                  <Globe className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">Fonte Original</span>
                  <a 
                    href={restaurant.source_url} 
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
                  {restaurant.menu_links.map((link, index) => (
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
                    images={restaurant.menu_images.map(img => convertCloudinaryUrl(img))}
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
              {lists.map(list => (
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
                  restaurantId={id}
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
        location={restaurant.location}
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
      />

      <ScheduleMealModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        restaurantName={restaurant.name}
        restaurantLocation={restaurant.location || ''}
        restaurantDescription={restaurant.description}
      />
    </div>
  );
}

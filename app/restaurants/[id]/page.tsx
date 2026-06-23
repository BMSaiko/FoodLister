// app/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSecureApiClient } from "@/hooks/auth/useSecureApiClient";
import { usePublicApiClient } from "@/hooks/auth/usePublicApiClient";
import { createClient } from "@/libs/supabase/client";
import Navbar from "@/components/ui/navigation/Navbar";
import { Review } from "@/libs/types";

// New creative components
import HeroSection from "@/components/ui/RestaurantDetails/HeroSection";
import InfoBento from "@/components/ui/RestaurantDetails/InfoBento";
import CategoryChips from "@/components/ui/RestaurantDetails/CategoryChips";
import VisitIsland from "@/components/ui/RestaurantDetails/VisitIsland";
import ReviewsFeed from "@/components/ui/RestaurantDetails/ReviewsFeed";
import ListsSection from "@/components/ui/RestaurantDetails/ListsSection";
import ScrollToTopButton from "@/components/ui/common/ScrollToTopButton";

// Existing components
import ScheduleMealModal from "@/components/ui/RestaurantDetails/ScheduleMealModal";
import { useModal } from "@/contexts/ModalContext";

import Link from "next/link";
import { Share2, Calendar, Edit, MapPin, Globe, FileText, Phone, Check, X, Plus, Star, ListChecks, Smartphone, Euro } from "lucide-react";
import { categorizePriceLevel, getRatingClass, formatDate, formatPrice } from "@/utils/formatters";
import { logError, logWarn, logInfo } from "@/utils/logger";
import { toast } from "react-toastify";

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
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const reviewId = searchParams?.get('review');
  const { user } = useAuth();
  const { get, post, patch, del } = useSecureApiClient();
  const { get: getPublic } = usePublicApiClient();
  const supabase = createClient();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [visitData, setVisitData] = useState({ visited: false, visit_count: 0 });
  const [lists, setLists] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userProfile, setUserProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const { isMapModalOpen, mapModalData, closeMapModal } = useModal();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const reviewFormRef = useRef<HTMLDivElement>(null);

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
        // Handle different error types safely
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = JSON.stringify(error).substring(0, 200);
        }
        logError('Error fetching restaurant details', errorMessage);
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
          const response = await get(`/api/users/me`);
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
        setVisitData({ visited: data.visited, visit_count: data.visit_count });
      } catch (error) {
        logError('Error fetching visit data', error);
      }
    };

    fetchVisitData();
  }, [user, id, get]);

  // Ensure visit count is updated when visited becomes true
  useEffect(() => {
    if (visitData.visited && visitData.visit_count === 0) {
      // If visited is true but visitCount is still 0, refetch the data
      const refetchVisitData = async () => {
        try {
          const response = await get(`/api/restaurants/${id}/visits`);
          const data = await response.json();
          setVisitData(prev => ({ ...prev, visit_count: data.visit_count }));
        } catch (error) {
          logError('Error refetching visit data', error);
        }
      };

      refetchVisitData();
    }
  }, [visitData.visited, visitData.visit_count, id, get]);

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

  // Handle scroll to review when reviewId is present
  useEffect(() => {
    if (!reviewId || !allDataLoaded) return;

    const scrollToReview = () => {
      const reviewElement = document.getElementById(`review-${reviewId}`);
      if (reviewElement) {
        reviewElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        reviewElement.classList.add('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-2xl');
        setTimeout(() => {
          reviewElement.classList.remove('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-2xl');
        }, 3000);
        return true;
      }
      return false;
    };

    if (!scrollToReview()) {
      const t1 = setTimeout(() => scrollToReview(), 300);
      const t2 = setTimeout(() => scrollToReview(), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [reviewId, allDataLoaded]);

  // Track when all data is loaded
  useEffect(() => {
    if (!loading && !loadingReviews && restaurant) {
      setAllDataLoaded(true);
    }
  }, [loading, loadingReviews, restaurant]);



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
  
  const handleToggleVisited = async () => {
    setIsUpdating(true);
    try {
      const response = await patch(`/api/restaurants/${id}/visits`, { action: 'toggle_visited' });
      const data = await response.json();
      setVisitData({ visited: data.visited, visit_count: data.visit_count });

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
          theme: "dark",
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
        theme: "dark",
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
        setVisitData(prev => ({ ...prev, visit_count: data.visit_count }));

      // Show success toast
      toast.success('Visita adicionada com sucesso!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
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
        theme: "dark",
        className: "text-sm sm:text-base"
      });
    }
  };

  const handleRemoveVisit = async () => {
    try {
      const response = await patch(`/api/restaurants/${id}/visits`, { action: 'remove_visit' });
      const data = await response.json();
        setVisitData(prev => ({ ...prev, visit_count: data.visit_count, visited: data.visited }));

      // Show success toast
      toast.success('Visita removida com sucesso!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
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
        theme: "dark",
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
      <div className="flex items-center mt-4 bg-white/5 p-3 rounded-lg ring-1 ring-white/10">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i} className={`h-4 w-4 ${priceColorClass}`} fill="currentColor" />
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i + priceCategory.level} className="h-4 w-4 text-white/20" />
          ))}
        </div>
        <span className={`ml-2 text-sm ${getPriceLabelClass(priceCategory.level)}`}>{priceCategory.label}</span>
        <div className="ml-auto text-amber-600 font-semibold">
          {formatPrice(price)}
          <span className="text-sm text-white/40 ml-1">por pessoa</span>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse rounded-xl h-96 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}></div>
          <div className="animate-pulse p-6 rounded-lg h-24 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}></div>
        </div>
      </div>
    );
  }
  
    if (!restaurant) {
      return (
        <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
          <Navbar />
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-white/90">Restaurante não encontrado</h2>
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

  // Handle review submission (both create and edit)
  const handleReviewSubmitted = async (newReview: Review) => {
    // Use the review data as-is from the API response (which now includes user profile data)
    const reviewWithUserData = newReview;

    // Check if this is an edit (review already exists) or a new review
    setReviews(prev => {
      const existingReviewIndex = prev.findIndex(review => review.id === newReview.id);
      
      if (existingReviewIndex !== -1) {
        // This is an edit - update the existing review
        const updatedReviews = [...prev];
        updatedReviews[existingReviewIndex] = reviewWithUserData;
        return updatedReviews;
      } else {
        // This is a new review - add to the beginning
        return [reviewWithUserData, ...prev];
      }
    });

    // Only increment review count for new reviews, not edits
    const existingReviewIndex = reviews.findIndex(review => review.id === newReview.id);
    if (existingReviewIndex === -1) {
      setReviewCount(prev => prev + 1);
    }

    // Update restaurant rating after successful review submission
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

    toast.success('Avaliação enviada com sucesso!');
  };

  // Handle review edit - this is handled by RestaurantReviewsSection component
  const handleEditReview = (review: Review) => {
    // The RestaurantReviewsSection component handles the edit functionality internally
    // No additional action needed here
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
      // Use the new rating-specific endpoint that doesn't require restaurant ownership
      const response = await post(`/api/restaurants/${restaurantId}/rating`, {});
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating restaurant rating:', errorText);
        // Don't throw error, just log it - rating update is not critical for user experience
      } else {
        const data = await response.json();
        // Update local restaurant state with new rating
        if (data.restaurant) {
          setRestaurant(prev => prev ? { ...prev, rating: data.restaurant.rating } : null);
        }
      }
    } catch (error) {
      console.error('Error in updateRestaurantRating:', error);
      // Don't throw error, just log it - rating update is not critical for user experience
    }
  };
  

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`px-4 py-3 rounded-xl backdrop-blur-lg border ${
            notification.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center">
              <span className="flex-1 text-sm font-medium">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-3">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-[60dvh] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
            <div className="h-8 bg-white/[0.06] rounded-lg w-1/3" />
            <div className="h-64 bg-white/[0.06] rounded-2xl" />
            <div className="h-32 bg-white/[0.06] rounded-2xl" />
          </div>
        </div>
      ) : !restaurant ? (
        <div className="min-h-[60dvh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white/70 mb-4">Restaurante nao encontrado</h2>
            <Link href="/restaurants" className="text-amber-400 hover:text-amber-300 transition-colors">
              Voltar aos restaurantes
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <HeroSection
            restaurant={restaurant}
            onShare={handleShareClick}
            onSchedule={() => setIsScheduleModalOpen(true)}
            onEdit={user && restaurant?.creator_id === user.id ? () => window.location.href = `/restaurants/${id}/edit` : undefined}
            isOwner={!!(user && restaurant?.creator_id === user.id)}
          />

          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
            {/* Bento Info Grid */}
            <InfoBento
              location={restaurant.location}
              sourceUrl={restaurant.source_url}
              menuLinks={restaurant.menu_links}
              menuImages={restaurant.menu_images}
              phoneNumbers={restaurant.phone_numbers}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
            />

            {/* Category Chips */}
            <CategoryChips
              cuisineTypes={cuisineTypes}
              dietaryOptions={restaurant.dietary_options || []}
              features={restaurant.features || []}
            />

            {/* Visit Island */}
            {user && (
              <VisitIsland
                visited={visitData.visited}
                visitCount={visitData.visit_count}
                onToggleVisited={handleToggleVisited}
                onAddVisit={handleAddVisit}
                onRemoveVisit={handleRemoveVisit}
                isUpdating={isUpdating}
              />
            )}

            {/* Reviews Feed */}
            <ReviewsFeed
              ref={reviewsSectionRef}
              restaurantId={id}
              reviews={reviews}
              reviewCount={reviewCount}
              user={user}
              loading={loadingReviews}
              onReviewSubmitted={handleReviewSubmitted}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
              restaurantRating={restaurant.rating}
            />

            {/* Lists */}
            <ListsSection lists={lists} />
          </div>
        </>
      )}

      <ScheduleMealModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        restaurantName={restaurant?.name || ""}
        restaurantLocation={restaurant?.location || ""}
        restaurantDescription={restaurant?.description || ""}
        restaurantId={restaurant?.id}
      />

      <ScrollToTopButton />
    </div>
  );
}

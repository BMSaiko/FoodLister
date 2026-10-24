import { useCallback, useEffect, useState } from 'react';
import { usePublicApiClient } from '@/hooks/auth/usePublicApiClient';
import { Review } from '@/libs/types';
import { logError } from '@/utils/logger';

export interface RestaurantDetail {
  id: string;
  name: string;
  description?: string;
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
  lists?: any[];
}

export type RestaurantDetailStatus = 'loading' | 'ready' | 'notFound' | 'error';

/** Dados e mutações da página /restaurants/[id]: restaurante, avaliações, listas e cozinhas. */
export function useRestaurantDetail(id: string) {
  const { get, post, del } = usePublicApiClient();
  const [status, setStatus] = useState<RestaurantDetailStatus>('loading');
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus('loading');
    try {
      const [restaurantResponse, reviewsResponse] = await Promise.all([
        get(`/api/restaurants/${id}`),
        get(`/api/reviews?restaurant_id=${id}`).catch(() => null),
      ]);

      const data = await restaurantResponse.json();
      if (!restaurantResponse.ok || !data.restaurant) {
        setRestaurant(null);
        setStatus('notFound');
        return;
      }
      setRestaurant(data.restaurant);
      setCuisineTypes(data.restaurant.cuisine_types ?? []);
      setLists(Array.isArray(data.restaurant.lists) ? data.restaurant.lists : []);

      if (reviewsResponse) {
        const reviewsData = await reviewsResponse.json();
        if (reviewsResponse.ok && reviewsData.reviews) {
          setReviews(reviewsData.reviews);
          setReviewCount(reviewsData.reviews.length);
        }
      }
      setStatus('ready');
    } catch (error) {
      logError('Error fetching restaurant details', error instanceof Error ? error.message : String(error).substring(0, 200));
      setStatus('error');
    }
  }, [id, get]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshRestaurant = useCallback(async () => {
    try {
      const response = await get(`/api/restaurants/${id}`);
      const data = await response.json();
      if (response.ok && data.restaurant) setRestaurant(data.restaurant);
    } catch (error) {
      logError('Error fetching updated restaurant data', error);
    }
  }, [id, get]);

  /** A nota é recalculada no servidor; falhar aqui não é crítico. */
  const updateRating = useCallback(async () => {
    try {
      const response = await post(`/api/restaurants/${id}/rating`, {});
      if (!response.ok) return;
      const data = await response.json();
      if (data.restaurant) {
        setRestaurant(prev => (prev ? { ...prev, rating: data.restaurant.rating } : null));
      }
    } catch (error) {
      logError('Error updating restaurant rating', error);
    }
  }, [id, post]);

  const onReviewSubmitted = useCallback(async (review: Review) => {
    const isNew = !reviews.some(r => r.id === review.id);
    setReviews(prev => {
      const index = prev.findIndex(r => r.id === review.id);
      if (index === -1) return [review, ...prev];
      const next = [...prev];
      next[index] = review;
      return next;
    });
    if (isNew) setReviewCount(n => n + 1);
    await updateRating();
    await refreshRestaurant();
  }, [reviews, updateRating, refreshRestaurant]);

  /** Devolve true se a avaliação foi eliminada. */
  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      const response = await del(`/api/reviews/${reviewId}`);
      if (!response.ok) return false;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setReviewCount(n => n - 1);
      await updateRating();
      await refreshRestaurant();
      return true;
    } catch (error) {
      logError('Error deleting review', error);
      return false;
    }
  }, [del, updateRating, refreshRestaurant]);

  /** Devolve true se o restaurante foi eliminado. */
  const deleteRestaurant = useCallback(async () => {
    try {
      const response = await del(`/api/restaurants/${id}`);
      return response.ok;
    } catch (error) {
      logError('Error deleting restaurant', error);
      return false;
    }
  }, [id, del]);

  return {
    status,
    restaurant,
    lists,
    cuisineTypes,
    reviews,
    reviewCount,
    onReviewSubmitted,
    deleteReview,
    deleteRestaurant,
    reload: load,
  };
}

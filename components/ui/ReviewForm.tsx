// components/ui/ReviewForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { ReviewFormData, Review } from '@/libs/types';
import { getClient } from '@/libs/supabase/client';

// Helper function to update restaurant rating based on reviews
async function updateRestaurantRating(restaurantId: string) {
  const supabase = getClient();

  try {
    // Calculate average rating from all reviews for this restaurant
    const { data: reviews, error: reviewsError } = await (supabase as any)
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
}

interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted: (review: any) => void;
  onCancel?: () => void;
  initialReview?: Review | null;
}

export default function ReviewForm({ restaurantId, onReviewSubmitted, onCancel, initialReview }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialReview;

  // Initialize form with existing review data when editing
  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [initialReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const supabase = getClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Erro de autenticação. Faça login novamente.');
        setIsSubmitting(false);
        return;
      }

      try {
        let result;

        if (isEditing && initialReview) {
          // Update existing review
          result = await (supabase as any)
            .from('reviews')
            .update({
              rating,
              comment: comment.trim() || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', initialReview.id)
            .eq('user_id', user.id) // Ensure user can only update their own reviews
            .select('*')
            .single();
        } else {
          // Check if user already has a review for this restaurant (only for new reviews)
          const { data: existingReview, error: checkError } = await (supabase as any)
            .from('reviews')
            .select('id')
            .eq('restaurant_id', restaurantId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing review:', checkError);
            setError('Erro ao verificar avaliação existente.');
            return;
          }

          if (existingReview) {
            setError('Você já avaliou este restaurante.');
            return;
          }

          // Extract user name from metadata
          const userName = user.user_metadata?.name ||
                          user.user_metadata?.full_name ||
                          user.email ||
                          'Anonymous User';

          // Create new review
          result = await (supabase as any)
            .from('reviews')
            .insert({
              restaurant_id: restaurantId,
              user_id: user.id,
              user_name: userName,
              rating,
              comment: comment.trim() || null
            })
            .select('*')
            .single();
        }

        if (result.error) {
          console.error('Error saving review:', result.error);
          setError(isEditing ? 'Erro ao atualizar avaliação.' : 'Erro ao enviar avaliação.');
          return;
        }

        // Update restaurant rating after successful review creation/update
        await updateRestaurantRating(restaurantId);

        // Transform user data using stored user_name
        const transformedReview = {
          ...result.data,
          user: {
            id: user.id,
            name: result.data.user_name || 'Anonymous User'
          }
        };

        onReviewSubmitted(transformedReview);

        // Reset form only for new reviews
        if (!isEditing) {
          setRating(0);
          setComment('');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        setError(isEditing ? 'Erro ao atualizar avaliação. Tente novamente.' : 'Erro ao enviar avaliação. Tente novamente.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(isEditing ? 'Erro ao atualizar avaliação. Tente novamente.' : 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditing ? 'Editar avaliação' : 'Deixe sua avaliação'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && `${rating} estrela${rating > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentário (opcional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe sua experiência neste restaurante..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Atualizando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {isEditing ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

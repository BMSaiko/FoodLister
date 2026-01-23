// components/ui/ReviewForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Star, Send, X } from 'lucide-react';
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
  const [amountSpent, setAmountSpent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialReview;

  // Initialize form with existing review data when editing
  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment || '');
      setAmountSpent(initialReview.amount_spent ? initialReview.amount_spent.toString() : '');
    } else {
      setRating(0);
      setComment('');
      setAmountSpent('');
    }
  }, [initialReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação.');
      return;
    }

    // Validate amount spent if provided
    if (amountSpent.trim() !== '') {
      const amountValue = parseFloat(amountSpent);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('O valor gasto deve ser maior que 0.');
        return;
      }
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
        let currentProfileImage = null;

        if (isEditing && initialReview) {
          // Get user's current profile data
          const { data: currentProfile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .single();

          const currentDisplayName = (!profileError && (currentProfile as any)?.display_name) ? (currentProfile as any).display_name : (user.email?.split('@')[0] || 'Anonymous User');
          const currentProfileImage = (!profileError && (currentProfile as any)?.avatar_url) ? (currentProfile as any).avatar_url : null;

          // Update existing review with current user data
          const amountValue = amountSpent.trim() !== '' ? parseFloat(amountSpent) : null;
          const validAmount = (amountValue !== null && amountValue > 0) ? amountValue : null;

          result = await (supabase as any)
            .from('reviews')
            .update({
              rating,
              comment: comment.trim() || null,
              amount_spent: validAmount,
              user_name: currentDisplayName, // Update with current display name
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

          // Get user display name from profiles table or email
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();

          const userName = (!profileError && profileData && (profileData as any).display_name) ? (profileData as any).display_name : user.email;

          // Create new review
          const amountValue = amountSpent.trim() !== '' ? parseFloat(amountSpent) : null;
          const validAmount = (amountValue !== null && amountValue > 0) ? amountValue : null;

          result = await (supabase as any)
            .from('reviews')
            .insert({
              restaurant_id: restaurantId,
              user_id: user.id,
              user_name: userName,
              rating,
              comment: comment.trim() || null,
              amount_spent: validAmount
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

        // Transform user data using current profile data
        const transformedReview = {
          ...result.data,
          user: {
            id: user.id,
            name: result.data.user_name || 'Anonymous User',
            profileImage: isEditing ? currentProfileImage : null
          }
        };

        onReviewSubmitted(transformedReview);

        // Reset form only for new reviews
        if (!isEditing) {
          setRating(0);
          setComment('');
          setAmountSpent('');
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
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="bg-amber-500 rounded-full p-2 mr-3">
            <Star className="h-5 w-5 text-white fill-current" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {isEditing ? 'Editar avaliação' : 'Deixe sua avaliação'}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Avaliação *
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1 touch-feedback transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 sm:h-10 sm:w-10 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-300'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <span className="text-sm font-medium text-amber-800">
                  {rating} estrela{rating > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
            Comentário <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe sua experiência neste restaurante..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors text-sm sm:text-base"
            rows={4}
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Máximo 5000 caracteres
            </span>
            <span className={`text-xs font-medium ${
              comment.length > 4500 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {comment.length}/5000
            </span>
          </div>
        </div>

        {/* Amount Spent */}
        <div>
          <label htmlFor="amountSpent" className="block text-sm font-semibold text-gray-700 mb-3">
            Valor gasto <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <input
              id="amountSpent"
              type="number"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm sm:text-base"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              €
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Valor aproximado gasto na refeição (ajuda a calcular a média do restaurante)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium min-h-[44px] order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium min-h-[44px] order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Atualizando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2 fill-current" />
                {isEditing ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

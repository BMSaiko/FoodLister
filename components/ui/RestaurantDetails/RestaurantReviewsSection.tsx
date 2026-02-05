import React, { useState, useEffect } from 'react';
import { Star, Edit, X, User, Euro } from 'lucide-react';
import { Review } from '@/libs/types';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RestaurantReviewsSectionProps {
  restaurantId: string;
  reviews: Review[];
  reviewCount: number;
  user?: any;
  userProfile?: { display_name?: string; avatar_url?: string } | null;
  loading?: boolean;
  onReviewSubmitted: (newReview: Review) => void;
  onEditReview: (review: Review) => void;
  onDeleteReview: (reviewId: string) => void;
}

export default function RestaurantReviewsSection({
  restaurantId,
  reviews,
  reviewCount,
  user,
  userProfile,
  loading = false,
  onReviewSubmitted,
  onEditReview,
  onDeleteReview
}: RestaurantReviewsSectionProps) {
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const handleReviewSubmitted = (newReview: Review) => {
    onReviewSubmitted(newReview);
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta avaliação?')) {
      return;
    }

    try {
      onDeleteReview(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao eliminar avaliação. Tente novamente.');
    }
  };

  return (
    <div id="restaurant-reviews" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center">
            <div className="bg-amber-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
              <Star className="h-5 w-5 sm:h-6 w-6 text-white fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Avaliações</h2>
              <p className="text-xs sm:text-sm text-gray-600">{reviewCount} avaliação{reviewCount !== 1 ? 'ões' : ''}</p>
            </div>
          </div>
          
          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm min-h-[40px] sm:min-h-[48px]"
            >
              <Star className="h-4 w-4 sm:h-5 w-5 fill-current" />
              <span className="hidden sm:inline">Avaliar Restaurante</span>
              <span className="sm:hidden">Avaliar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Review Form */}
        {(showReviewForm || editingReview) && (
          <div className="mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600 text-sm">Formulário de avaliação não disponível</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <div className="bg-amber-50 rounded-full w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Star className="h-8 w-8 sm:h-10 w-10 text-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Nenhuma avaliação ainda
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
              Este restaurante ainda não foi avaliado. Seja o primeiro a compartilhar sua experiência!
            </p>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <Star className="h-4 w-4 sm:h-5 w-5 mr-2 fill-current" />
                <span className="hidden sm:inline">Fazer primeira avaliação</span>
                <span className="sm:hidden">Fazer avaliação</span>
              </button>
            )}
          </div>
        ) : (
          /* Reviews List */
          <div className="space-y-4 sm:space-y-6">
            {reviews.map(review => (
              <div 
                key={review.id} 
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex-shrink-0">
                          {review.user.profileImage ? (
                            <img
                              src={review.user.profileImage}
                              alt={`${review.user.name}'s profile`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-amber-600 font-semibold text-base sm:text-lg">
                                {review.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/users/${review.user.userIdCode || review.user.id}`}
                            className="font-semibold text-gray-800 text-sm sm:text-base hover:text-amber-600 transition-colors"
                          >
                            {review.user.name}
                          </Link>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1">
                            {Array(5).fill(0).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 sm:h-5 w-5 ${
                                  i < review.rating
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs sm:text-sm text-gray-600 font-medium ml-1">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount Spent */}
                      {review.amount_spent && review.amount_spent > 0 && (
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
                          <Euro className="h-3 w-3 sm:h-4 w-4 text-amber-500" />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">
                            Valor gasto: <span className="text-amber-600 font-bold">{formatPrice(review.amount_spent)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Comment */}
                    {review.comment && (
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 font-medium">
                      {formatDate(review.created_at)}
                    </span>
                    
                    {user && review.user_id === user.id && (
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                          title="Editar avaliação"
                        >
                          <Edit className="h-3 w-3 sm:h-4 w-4" />
                          <span className="text-xs sm:text-sm font-medium">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                          title="Eliminar avaliação"
                        >
                          <X className="h-3 w-3 sm:h-4 w-4" />
                          <span className="text-xs sm:text-sm font-medium">Eliminar</span>
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
  );
}

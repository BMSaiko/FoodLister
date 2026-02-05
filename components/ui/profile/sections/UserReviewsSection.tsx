import React, { useState, useEffect } from 'react';
import { Star, Utensils, Clock, MessageCircle, MapPin, Euro } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';

interface UserReviewsSectionProps {
  userId: string;
  initialReviews: Array<{
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
  initialTotal: number;
  isOwnProfile: boolean;
}

const UserReviewsSection: React.FC<UserReviewsSectionProps> = ({
  userId,
  initialReviews,
  initialTotal,
  isOwnProfile
}) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReviews.length < initialTotal);

  const { get } = useSecureApiClient();

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await get(`/api/users/${userId}/reviews?page=${page + 1}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setReviews(prev => [...prev, ...data.data]);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Star className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma avaliação encontrada</h3>
        <p className="text-gray-600">
          {isOwnProfile 
            ? 'Você ainda não avaliou nenhum restaurante. Comece a explorar e compartilhar suas experiências!'
            : 'Este usuário ainda não avaliou nenhum restaurante.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            {/* Restaurant Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>
                  {review.restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      <span>Nota média: {review.restaurant.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {review.restaurant.imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={review.restaurant.imageUrl}
                    alt={review.restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Review Content */}
            {review.comment && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.comment}</p>
              </div>
            )}

            {/* Review Footer */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between text-sm text-gray-500">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                {review.amountSpent && (
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    <span>{formatAmount(review.amountSpent)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Avaliação</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMoreReviews}
            disabled={loading}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg min-h-[48px] min-w-[180px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Carregando...
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Carregar mais avaliações
              </>
            )}
          </button>
        </div>
      )}

      {/* Total Count */}
      {total > reviews.length && (
        <div className="text-center text-gray-500 text-sm">
          Mostrando {reviews.length} de {total} avaliações
        </div>
      )}
    </div>
  );
};

export default UserReviewsSection;
import React, { useState, useEffect } from 'react';
import { Star, Utensils, Clock, MessageCircle, MapPin, Euro } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';
import { 
  ProfileCard, 
  RatingBadge, 
  AmountBadge, 
  DateBadge,
  TouchButton,
  SkeletonLoader,
  EmptyState 
} from '../shared/index';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { get } = useSecureApiClient();

  const loadMoreReviews = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
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
      setIsLoadingMore(false);
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
      <EmptyState
        icon={<Star className="h-8 w-8 text-gray-400" />}
        title="Nenhuma avaliação encontrada"
        description={isOwnProfile 
          ? 'Você ainda não avaliou nenhum restaurante. Comece a explorar e compartilhar suas experiências!'
          : 'Este usuário ainda não avaliou nenhum restaurante.'
        }
        action={isOwnProfile ? {
          label: 'Explorar restaurantes',
          onClick: () => window.location.href = '/restaurants',
          icon: <Utensils className="h-4 w-4" />
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {reviews.map((review) => (
          <ProfileCard
            key={review.id}
            className="touch-space"
            hoverEffect={true}
            touchTarget={true}
          >
            {/* Restaurant Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                  <RatingBadge rating={review.rating} type="review" />
                  {review.restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Nota média: {review.restaurant.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {review.restaurant.imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 touch-target">
                  <img
                    src={review.restaurant.imageUrl}
                    alt={review.restaurant.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Restaurant Name */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {review.restaurant.name}
              </h4>
            </div>

            {/* Review Content */}
            {review.comment && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4 ios-safe-padding-bottom">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-4">
                  {review.comment}
                </p>
              </div>
            )}

            {/* Review Footer */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-gray-500">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <DateBadge date={review.createdAt} prefix="Avaliado em" />
                <AmountBadge amount={review.amountSpent} />
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>Avaliação</span>
              </div>
            </div>
          </ProfileCard>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <TouchButton
            onClick={loadMoreReviews}
            loading={isLoadingMore}
            variant="primary"
            size="md"
            disabled={isLoadingMore}
            icon={isLoadingMore ? undefined : <Star className="h-4 w-4" />}
            fullWidth={false}
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais avaliações'}
          </TouchButton>
        </div>
      )}

      {/* Total Count */}
      {total > reviews.length && (
        <div className="text-center text-gray-500 text-sm ios-safe-padding-top">
          Mostrando {reviews.length} de {total} avaliações
        </div>
      )}
    </div>
  );
};

export default UserReviewsSection;

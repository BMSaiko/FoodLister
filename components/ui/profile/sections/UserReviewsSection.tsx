import React, { useState, useEffect } from 'react';
import { Star, Utensils, Clock, MessageCircle, MapPin, Euro, ExternalLink } from 'lucide-react';
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
import { toast } from 'react-toastify';
import ReviewCard from './ReviewCard';
import { useUserCache } from '@/hooks/data/useUserCache';

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
      location?: string;
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
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    rating: 0,
    comment: '',
    amountSpent: 0
  });

  const { get, put, del } = useSecureApiClient();
  const { invalidateCache } = useUserCache();

  const loadMoreReviews = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await get(`/api/users/${userId}/reviews?page=${page + 1}&limit=12`);
      const data = await response.json();

      if (response.ok) {
        // Filter out any duplicate reviews by ID to prevent React key conflicts
        const newReviews = data.data.filter((newReview: any) => 
          !reviews.some(existingReview => existingReview.id === newReview.id)
        );
        
        setReviews(prev => [...prev, ...newReviews]);
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

  const handleEditReview = (review: any) => {
    // Set the review to editing mode
    setEditingReviewId(review.id);
    setEditingData({
      rating: review.rating,
      comment: review.comment || '',
      amountSpent: review.amount_spent || 0
    });
  };

  const handleSaveEdit = async (reviewId: string) => {
    try {
      const response = await put(`/api/reviews/${reviewId}`, {
        rating: editingData.rating,
        comment: editingData.comment,
        amount_spent: editingData.amountSpent
      });

      if (response.ok) {
        // Update the review in the list with all fields including amount_spent
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                rating: editingData.rating, 
                comment: editingData.comment, 
                amount_spent: editingData.amountSpent,
                amountSpent: editingData.amountSpent, // Add camelCase version for ReviewCard
                // Ensure the updated_at timestamp is also updated
                updated_at: new Date().toISOString()
              }
            : review
        ));
        setEditingReviewId(null);
        
        // Invalidate cache to ensure fresh data is loaded on next fetch
        invalidateCache(userId);
        
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        throw new Error('Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Erro ao atualizar avaliação. Tente novamente.');
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingData({
      rating: 0,
      comment: '',
      amountSpent: 0
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await del(`/api/reviews/${reviewId}`);
      
      if (response.ok) {
        // Remove the review from the list
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setTotal(prev => prev - 1);
        
        // Invalidate cache to ensure fresh data is loaded on next fetch
        invalidateCache(userId);
        
        toast.success('Avaliação excluída com sucesso!');
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao excluir avaliação. Tente novamente.');
    }
  };

  const handleShareReview = (review: any) => {
    const reviewUrl = `${window.location.origin}/restaurants/${review.restaurant.id}?review=${review.id}`;
    
    if (navigator.share && !navigator.userAgent.includes('Firefox')) {
      navigator.share({
        title: `Avaliação de ${review.restaurant.name} - FoodList`,
        text: `Confira minha avaliação deste restaurante no FoodList!`,
        url: reviewUrl,
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(reviewUrl).then(() => {
          toast.success('Link da avaliação copiado!');
        });
      });
    } else {
      navigator.clipboard.writeText(reviewUrl).then(() => {
        toast.success('Link da avaliação copiado!');
      });
    }
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
        {reviews.map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            review={review}
            isOwnReview={isOwnProfile}
            onEdit={() => handleEditReview(review)}
            onDelete={() => handleDeleteReview(review.id)}
            onShare={() => handleShareReview(review)}
            editingReviewId={editingReviewId}
            editingData={editingData}
            onEditChange={(field, value) => {
              setEditingData(prev => ({ ...prev, [field]: value }));
            }}
            onSaveEdit={(e) => {
              e.stopPropagation();
              handleSaveEdit(review.id);
            }}
            onCancelEdit={(e) => {
              e.stopPropagation();
              handleCancelEdit();
            }}
          />
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

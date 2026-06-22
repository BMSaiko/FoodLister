import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { Star, Edit, X, User } from 'lucide-react';
import { Review } from '@/libs/types';
import { formatDate } from '@/utils/formatters';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReviewForm from './ReviewForm';

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
  onScrollToForm?: () => void;
}

const RestaurantReviewsSection = forwardRef<HTMLDivElement, RestaurantReviewsSectionProps>((
  {
    restaurantId,
    reviews,
    reviewCount,
    user,
    userProfile,
    loading = false,
    onReviewSubmitted,
    onEditReview,
    onDeleteReview,
    onScrollToForm
  },
  ref
) => {

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingReview && reviewFormRef.current) {
      try {
        reviewFormRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        reviewFormRef.current.classList.add('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-xl');
        setTimeout(() => {
          reviewFormRef.current?.classList.remove('ring-2', 'ring-amber-500', 'ring-opacity-50', 'rounded-xl');
        }, 3000);
      } catch (error) {
        console.warn('Scroll to form failed:', error);
      }
    }
  }, [editingReview]);

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
    if (!confirm('Tem certeza que deseja eliminar esta avaliacao?')) {
      return;
    }
    try {
      onDeleteReview(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao eliminar avaliacao. Tente novamente.');
    }
  };

  return (
    <div ref={ref} id="restaurant-reviews" className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden mb-4">
      {/* Section Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center">
            <div className="bg-amber-500/10 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
              <Star className="h-5 w-5 sm:h-6 w-6 text-amber-400 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Avaliacoes</h2>
              <p className="text-xs sm:text-sm text-white/40">{reviewCount} avaliacao{reviewCount !== 1 ? 'oes' : ''}</p>
            </div>
          </div>

          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors duration-150 font-medium text-sm min-h-[44px]"
            >
              <Star className="h-4 w-4 fill-current" />
              <span className="hidden sm:inline">Avaliar Restaurante</span>
              <span className="sm:hidden">Avaliar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Review Form */}
        {(showReviewForm || editingReview) && (
          <div ref={reviewFormRef} className="mb-6">
            <ReviewForm
              restaurantId={restaurantId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
              isEditing={!!editingReview}
              initialReview={editingReview || undefined}
            />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 w-12 bg-white/[0.06] rounded-full"></div>
                  <div className="h-4 bg-white/[0.06] rounded w-20 sm:w-24"></div>
                </div>
                <div className="h-4 bg-white/[0.06] rounded w-full mb-2"></div>
                <div className="h-4 bg-white/[0.06] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <div className="bg-amber-500/10 rounded-full w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Star className="h-8 w-8 sm:h-10 w-10 text-amber-400/50" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white/70 mb-2">
              Nenhuma avaliacao ainda
            </h3>
            <p className="text-white/40 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
              Este restaurante ainda nao foi avaliado. Seja o primeiro a compartilhar sua experiencia!
            </p>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors duration-150 font-medium text-sm"
              >
                <Star className="h-4 w-4 sm:h-5 w-5 mr-2 fill-current" />
                <span className="hidden sm:inline">Fazer primeira avaliacao</span>
                <span className="sm:hidden">Fazer avaliacao</span>
              </button>
            )}
          </div>
        ) : (
          /* Reviews List */
          <div className="space-y-3 sm:space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id + '-' + index}
                id={'review-' + review.id}
                className="bg-white/[0.03] rounded-xl p-4 sm:p-5 ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150 group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.user.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt={review.user.name + ' profile'}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-full flex items-center justify-center ring-1 ring-amber-500/20">
                        <span className="text-amber-400 font-semibold text-base sm:text-lg">
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-2">
                      <div>
                        <Link
                          href={'/users/' + review.user.userIdCode}
                          className="font-semibold text-white/90 text-sm sm:text-base hover:text-amber-400 transition-colors duration-150"
                        >
                          {review.user.name}
                        </Link>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={'h-3.5 w-3.5 sm:h-4 sm:w-4 ' + (i < review.rating ? 'text-amber-400 fill-current' : 'text-white/20')}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30">
                          {formatDate(review.created_at)}
                        </span>
                        {user && review.user_id === user.id && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="p-1.5 text-white/40 hover:text-amber-400 hover:bg-white/[0.05] rounded-lg transition-colors duration-150"
                              title="Editar avaliacao"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/[0.05] rounded-lg transition-colors duration-150"
                              title="Eliminar avaliacao"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-white/60 text-sm leading-relaxed">
                        {review.comment}
                      </p>
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
});

RestaurantReviewsSection.displayName = 'RestaurantReviewsSection';

export default RestaurantReviewsSection;

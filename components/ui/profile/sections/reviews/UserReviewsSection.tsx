import React, { useState, useEffect } from "react";
import { Star, Utensils } from "lucide-react";

import { useSecureApiClient } from "@/hooks/auth/useSecureApiClient";

import { SkeletonLoader, EmptyState, TouchButton } from "../shared";
import { toast } from "react-toastify";
import ReviewCard from "./ReviewCard";

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

  const { get, put } = useSecureApiClient();

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
      console.error("Error loading more reviews:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const handleShareReview = (review: any) => {
    const restaurant = review.restaurant || {};
    const reviewUrl = `${window.location.origin}/restaurants/${restaurant.id}?review=${review.id}`;
    
    if (navigator.share && !navigator.userAgent.includes("Firefox")) {
      navigator.share({
        title: `Avaliação de ${restaurant.name || "Restaurante"} - FoodList`,
        text: `Confira minha avaliação deste restaurante no FoodList!`,
        url: reviewUrl,
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(reviewUrl).then(() => {
          toast.success("Link da avaliação copiado!");
        });
      });
    } else {
      navigator.clipboard.writeText(reviewUrl).then(() => {
        toast.success("Link da avaliação copiado!");
      });
    }
  };

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<Star className="h-8 w-8 text-gray-400" />}
        title="Nenhuma avaliação encontrada"
        description={isOwnProfile 
          ? "Você ainda não avaliou nenhum restaurante. Comece a explorar e compartilhar suas experiências!"
          : "Este usuário ainda não avaliou nenhum restaurante."
        }
        action={isOwnProfile ? {
          label: "Explorar restaurantes",
          onClick: () => window.location.href = "/restaurants",
          icon: <Utensils className="h-4 w-4" />
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reviews.map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            review={review}
            isOwnReview={isOwnProfile}
            onShare={() => handleShareReview(review)}
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
            {isLoadingMore ? "Carregando..." : "Carregar mais avaliações"}
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

"use client";

import React from "react";
import { Star, MapPin, Euro, MessageCircle } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import Link from "next/link";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    amountSpent?: number;
    createdAt: string;
    restaurant: {
      id: string;
      name: string;
      imageUrl?: string;
      location?: string;
      price_per_person?: number;
      rating?: number;
    };
  };
  isOwnReview?: boolean;
  onShare?: () => void;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isOwnReview, onShare, className = "" }) => {
  // Normalize: API returns 'restaurants' (plural) from Supabase join, card expects 'restaurant' (singular)
  const raw = review.restaurant || (review as any).restaurants || {};
  const restaurant = Array.isArray(raw) ? raw[0] : raw;
  const hasImage = !!(restaurant as any).imageUrl;

  return (
    <div className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200 hover:scale-[1.01] ${className}`}>
      <div className="p-4 rounded-xl bg-white/[0.03] flex flex-col sm:flex-row gap-4">
        {/* Restaurant Image */}
        {restaurant?.id ? (
          <Link href={`/restaurants/${restaurant.id}?review=${review.id}`} className="flex-shrink-0">
            {hasImage ? (
              <img src={restaurant.imageUrl} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
          </Link>
        ) : (
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-white/[0.04] flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {restaurant?.id ? (
              <Link href={`/restaurants/${restaurant.id}?review=${review.id}`} className="font-medium text-white/80 hover:text-purple-400 transition-colors text-sm truncate">
                {restaurant?.name || "Restaurante"}
              </Link>
            ) : (
              <span className="font-medium text-white/80 text-sm truncate">{restaurant?.name || "Restaurante"}</span>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
              <span className="text-sm font-semibold text-amber-400">{review.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/30 mb-2">
            <span>{formatDate(review.createdAt)}</span>
            {restaurant?.location && (
              <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{restaurant.location}</span>
            )}
            {review.amountSpent != null && review.amountSpent > 0 && (
              <span className="flex items-center gap-1"><Euro className="h-3 w-3" />{review.amountSpent.toFixed(2)}</span>
            )}
          </div>

          {review.comment && (
            <p className="text-sm text-white/45 line-clamp-2 leading-relaxed">{review.comment}</p>
          )}

          {isOwnReview && onShare && (
            <div className="flex items-center gap-2 mt-3">
              <button onClick={onShare} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/45 hover:text-white/70 hover:bg-white/[0.08] transition-all text-xs font-medium">
                Partilhar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

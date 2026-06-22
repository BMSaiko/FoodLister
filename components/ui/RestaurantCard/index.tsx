'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Eye, Check } from 'lucide-react';
import { useAuth } from '@/contexts';
import { RestaurantWithDetails, VisitData } from '@/libs/types';

interface RestaurantCardProps {
  restaurant: RestaurantWithDetails;
  variant?: 'large' | 'small';
  centered?: boolean;
  visitsData?: VisitData | null;
  loadingVisits?: boolean;
  onVisitsDataUpdate?: (restaurantId: string, data: { visited: boolean; visit_count: number }) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  variant = 'small',
  centered = false,
  visitsData = null,
  loadingVisits = false,
  onVisitsDataUpdate = null,
}) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [visited, setVisited] = useState(visitsData?.visited || false);

  const isLarge = variant === 'large';
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed === '/placeholder-restaurant.jpg' || trimmed.startsWith('data:image')) return false;
    return trimmed.startsWith('http');
  };
  const hasImage = isValidUrl(restaurant.image_url) || (restaurant.images?.some(img => isValidUrl(img)) ?? false);
  const imageUrl = restaurant.images?.find(img => isValidUrl(img)) || (isValidUrl(restaurant.image_url) ? restaurant.image_url : '');

  return (
    <motion.article
      className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-150"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {/* Image */}
      <Link href={`/restaurants/${restaurant.id}`} className="block">
        <div className={`relative overflow-hidden ${isLarge ? 'h-52 md:h-60' : 'h-40'}`}>
          {hasImage ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Price badge */}
          {restaurant.price_per_person != null && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-white">
              €{restaurant.price_per_person}
            </div>
          )}

          {/* Rating */}
          {restaurant.rating != null && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-white">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Basic Info (always visible) */}
      <div className="p-4">
        <Link href={`/restaurants/${restaurant.id}`}>
          <h3 className={`font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1 ${isLarge ? 'text-lg md:text-xl' : 'text-base'}`}>
            {restaurant.name}
          </h3>
        </Link>

        <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--foreground-muted)]">
          {restaurant.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.location}
            </span>
          )}
        </div>
      </div>

      {/* Hover Reveal */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-4 space-y-3 bg-white/[0.02]">
              {/* Description */}
              {restaurant.description && (
                <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2">
                  {restaurant.description}
                </p>
              )}

              {/* Categories */}
              {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.cuisine_types.slice(0, 3).map((cuisine) => (
                    <span
                      key={cuisine.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400"
                    >
                      {cuisine.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/restaurants/${restaurant.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-black text-sm font-medium rounded-full hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </Link>
                {user && onVisitsDataUpdate && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newVisited = !visited;
                      setVisited(newVisited);
                      onVisitsDataUpdate(restaurant.id, {
                        visited: newVisited,
                        visit_count: (visitsData?.visit_count || 0) + (newVisited ? 1 : -1),
                      });
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                      visited
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/[0.03] text-[var(--foreground-secondary)] hover:bg-white/[0.06] border border-white/[0.08]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {visited ? 'Visitado' : 'Visitar'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default RestaurantCard;

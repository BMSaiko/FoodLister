"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Star, MapPin, Eye } from "lucide-react";
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { RestaurantWithDetails } from "@/libs/types";
import { extractPlaceParts } from "@/utils/googleMapsExtractor";
import { CreatorLink } from "@/components/ui/common/CreatorLink";

interface RestaurantCardProps {
  restaurant: RestaurantWithDetails;
  variant?: "large" | "small";
  centered?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  variant = "small",
  centered = false,
}) => {
  const { user } = useAuthUser();
  const [isHovered, setIsHovered] = useState(false);

  const isLarge = variant === "large";
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed === "/placeholder-restaurant.jpg" || trimmed.startsWith("data:image")) return false;
    return trimmed.startsWith("http");
  };
  // ponytail: display_image_index picks the "main" image; fallback first valid
  const validImgs = (restaurant.images || []).filter((img: string) => isValidUrl(img));
  const mainIndex = restaurant.display_image_index ?? 0;
  const hasImage = validImgs.length > 0;
  const imageUrl = validImgs[mainIndex] || validImgs[0] || "";

  return (
    <motion.article
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-150 h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {/* Image — fixed height, same for all cards */}
      <Link href={`/restaurants/${restaurant.id}`} className="block">
        <div className={`relative overflow-hidden ${isLarge ? "h-60 md:h-64" : "h-52"}`}>
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
              {restaurant.review_count != null && restaurant.review_count > 0 && (
                <span className="text-[10px] text-white/50 ml-1">({restaurant.review_count})</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Content — flex-1 fills remaining space, pushes footer down */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        <Link href={`/restaurants/${restaurant.id}`}>
          <h3 className={`font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1 ${isLarge ? "text-lg md:text-xl" : "text-base"}`}>
            {restaurant.name}
          </h3>
        </Link>

        {(restaurant.creator_display_name || restaurant.creator_name) && (
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            Adicionado por <CreatorLink creatorId={restaurant.creator_user_code || restaurant.creator_id} name={(restaurant.creator_display_name || restaurant.creator_name) || ""} />
          </p>
        )}

        <div className="flex-1" />

        {/* Hover Reveal */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/[0.06]"
            >
              <div className="pt-3 mt-3 space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 pb-3">
                {/* Local — T40: city, district, country on hover. ponytail: no
                    structured columns; extractPlaceParts is a best-effort tail parse. */}
                {(() => { const { city, district, country } = extractPlaceParts(restaurant.location);
                  const label = [city, district, country].filter(Boolean).join(', ');
                  return label ? (
                    <p className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {label}
                    </p>
                  ) : null; })()}



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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

export default RestaurantCard;

"use client";

import React from "react";
import { Star, MapPin } from "lucide-react";
import Link from "next/link";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    images?: string[];
    display_image_index?: number;
    location?: string;
    price_per_person?: number;
    rating?: number;
    cuisine_types?: any[];
    dietary_options?: any[];
    features?: any[];
  };
  isOwnRestaurant?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant, isOwnRestaurant, onEdit, onDelete, onShare, className = "",
}) => {
  const hasImage = !!restaurant.imageUrl;
  const hasCuisines = (restaurant.cuisine_types || []).length > 0;
  const hasFeatures = (restaurant.features || []).length > 0;

  return (
    <div className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:scale-[1.02] transition-all duration-200 group ${className}`}>
      <div className="rounded-xl bg-white/[0.03] overflow-hidden">
        {/* Image */}
        <Link href={`/restaurants/${restaurant.id}`}  className="block relative h-32 overflow-hidden">
          {hasImage ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          {/* Rating badge */}
          {restaurant.rating != null && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star className="h-3 w-3 text-amber-400 fill-current" />
              <span className="text-xs font-semibold text-white">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
          {/* Price badge */}
          {restaurant.price_per_person != null && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-xs font-semibold text-white">€{restaurant.price_per_person.toFixed(0)}</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4">
          <Link href={`/restaurants/${restaurant.id}`}  className="font-semibold text-white/85 hover:text-purple-400 transition-colors text-sm line-clamp-1">
            {restaurant.name}
          </Link>

          {restaurant.location && (
            <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />{restaurant.location}
            </p>
          )}

          {/* Tags */}
          {hasCuisines && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(restaurant.cuisine_types || []).slice(0, 3).map((c: any, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 border border-amber-500/10">
                  {c.cuisine_type?.name || c.name || "Outro"}
                </span>
              ))}
            </div>
          )}

          {hasFeatures && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(restaurant.features || []).slice(0, 2).map((f: any, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30 border border-white/[0.06]">
                  {f.feature?.name || f.name || "Outro"}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {isOwnRestaurant && (onEdit || onDelete || onShare) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
              {onEdit && (
                <button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/45 hover:text-white/70 hover:bg-white/[0.08] transition-all text-xs font-medium">
                  Editar
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium">
                  Eliminar
                </button>
              )}
              {onShare && (
                <button onClick={onShare} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/45 hover:text-white/70 hover:bg-white/[0.08] transition-all text-xs font-medium">
                  Partilhar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

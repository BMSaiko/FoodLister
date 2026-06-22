import React, { useState } from "react";
import Link from "next/link";
import { Share2, Calendar, Edit, Star, Euro, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getRatingClass, formatPrice, categorizePriceLevel } from "@/utils/formatters";

interface HeroSectionProps {
  restaurant: {
    id: string;
    name: string;
    images?: string[];
    image_url?: string;
    display_image_index?: number;
    rating?: number;
    price_per_person?: number;
    creator_name?: string;
    created_at?: string;
  };
  onShare: () => void;
  onSchedule: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
}

export default function HeroSection({
  restaurant,
  onShare,
  onSchedule,
  onEdit,
  isOwner
}: HeroSectionProps) {
  const ratingClass = getRatingClass(restaurant.rating || 0);
  const priceCategory = categorizePriceLevel(restaurant.price_per_person || 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Collect all valid images
  const allImages: string[] = [];
  if (restaurant.images && restaurant.images.length > 0) {
    for (const img of restaurant.images) {
      if (img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image")) {
        allImages.push(img);
      }
    }
  }
  if (restaurant.image_url && restaurant.image_url !== "/placeholder-restaurant.jpg" && !restaurant.image_url.startsWith("data:image") && !allImages.includes(restaurant.image_url)) {
    allImages.unshift(restaurant.image_url);
  }

  const hasImages = allImages.length > 0;
  const heroImage = allImages[restaurant.display_image_index ?? 0] || allImages[0] || null;

  // Generate gradient placeholder
  const getGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 15%), hsl(${hue + 60}, 60%, 10%))`;
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <>
      <section className="relative w-full h-[50dvh] md:h-[60dvh] lg:h-[70dvh] overflow-hidden group">
        {/* Background Image or Gradient */}
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{ background: getGradient(restaurant.name) }}
          >
            <span className="text-8xl md:text-9xl font-bold text-white/10 select-none">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Image count badge */}
        {hasImages && allImages.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-lg border border-white/[0.12] text-white/80 hover:bg-black/60 transition-colors duration-150 text-sm min-h-[40px]"
          >
            <ZoomIn className="h-4 w-4" />
            <span>{allImages.length} fotos</span>
          </button>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.12] text-white/80 hover:bg-white/[0.12] transition-colors duration-150 text-sm font-medium min-h-[44px]"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Partilhar</span>
              </button>
              <button
                onClick={onSchedule}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors duration-150 text-sm font-medium min-h-[44px]"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Agendar</span>
              </button>
              {isOwner && onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors duration-150 text-sm font-medium min-h-[44px]"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              )}
            </div>

            {/* Name + Rating + Price */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-3">
                  {restaurant.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                  {restaurant.creator_name && (
                    <span>Por <span className="text-white/70 font-medium">{restaurant.creator_name}</span></span>
                  )}
                  {restaurant.created_at && (
                    <span>Adicionado em {new Date(restaurant.created_at).toLocaleDateString("pt-PT")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {restaurant.rating !== null && restaurant.rating !== undefined && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-lg">
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                    <span className={"text-xl font-bold text-amber-400"}>
                      {(restaurant.rating || 0).toFixed(1)}
                    </span>
                  </div>
                )}
                {restaurant.price_per_person && restaurant.price_per_person > 0 && (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-lg">
                    {Array(priceCategory.level).fill(0).map((_, i) => (
                      <Euro key={i} className="h-4 w-4 text-amber-400" fill="currentColor" />
                    ))}
                    {Array(4 - priceCategory.level).fill(0).map((_, i) => (
                      <Euro key={`empty-${i}`} className="h-4 w-4 text-white/20" />
                    ))}
                    <span className="ml-1 text-sm text-white/60 font-medium">{priceCategory.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Thumbnail Strip */}
      {hasImages && allImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 mb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className={
                  "flex-shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden ring-2 transition-all duration-150 " +
                  (i === (restaurant.display_image_index ?? 0)
                    ? "ring-amber-500 scale-105"
                    : "ring-white/[0.08] hover:ring-white/20 opacity-70 hover:opacity-100")
                }
              >
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.12] text-white/80 hover:bg-white/[0.15] transition-colors duration-150 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Nav */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.12] text-white/80 hover:bg-white/[0.15] transition-colors duration-150 flex items-center justify-center"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.12] text-white/80 hover:bg-white/[0.15] transition-colors duration-150 flex items-center justify-center"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={allImages[lightboxIndex]}
              alt={`${restaurant.name} - Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium">
              {lightboxIndex + 1} de {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

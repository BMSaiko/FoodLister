import React, { useState, useEffect, useRef } from "react";
import { Share2, Calendar, Edit, Star, Euro, ChevronLeft, ChevronRight, X, ZoomIn, MapPin } from "lucide-react";
import { getRatingClass, categorizePriceLevel } from "@/utils/formatters";
import Modal from "@/components/ui/Modal";

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
    location?: string;
  };
  onShare: () => void;
  onSchedule: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
}

export default function HeroSection({ restaurant, onShare, onSchedule, onEdit, isOwner }: HeroSectionProps) {
  const ratingClass = getRatingClass(restaurant.rating || 0);
  const priceCategory = categorizePriceLevel(restaurant.price_per_person || 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Collect images
  const allImages: string[] = [];
  if (restaurant.images?.length) {
    for (const img of restaurant.images) {
      if (img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image")) allImages.push(img);
    }
  }
  if (restaurant.image_url && restaurant.image_url !== "/placeholder-restaurant.jpg" && !restaurant.image_url.startsWith("data:image") && !allImages.includes(restaurant.image_url)) {
    allImages.unshift(restaurant.image_url);
  }

  const hasImages = allImages.length > 0;
  const heroImage = allImages[restaurant.display_image_index ?? 0] || allImages[0] || null;

  const getGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue},70%,15%), hsl(${hue+60},60%,10%))`;
  };

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImg = () => setLightboxIndex(p => (p + 1) % allImages.length);
  const prevImg = () => setLightboxIndex(p => (p - 1 + allImages.length) % allImages.length);

  // Parallax offset (max 60px)
  const parallaxY = Math.min(scrollY * 0.4, 60);

  return (
    <>
      <div ref={heroRef} className="relative w-full h-[55dvh] md:h-[65dvh] lg:h-[75dvh] overflow-hidden">
        {/* Background with parallax */}
        <div className="absolute inset-0" style={{ transform: `translateY(${parallaxY}px)`, transition: "transform 0.1s linear" }}>
          {heroImage ? (
            <>
              <img src={heroImage} alt={restaurant.name} className="w-full h-[120%] object-cover -top-[10%] absolute" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/10" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: getGradient(restaurant.name) }}>
              <span className="text-[12rem] md:text-[16rem] font-bold text-white/[0.07] select-none">{restaurant.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Floating image count */}
        {hasImages && allImages.length > 1 && (
          <button onClick={() => openLightbox(0)} className="absolute top-5 left-5 sm:left-auto sm:right-5 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/[0.1] text-white/90 hover:bg-black/50 transition-all duration-200 text-sm font-medium min-h-[44px] hover:scale-105">
            <ZoomIn className="h-4 w-4" />
            <span>{allImages.length} fotos</span>
          </button>
        )}

        {/* Main content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Actions row */}
            <div className="flex flex-wrap items-center justify-end gap-2 mb-5">
              <button onClick={onShare} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.12] transition-all duration-200 text-sm font-medium min-h-[44px] hover:scale-105">
                <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Partilhar</span>
              </button>
              <button onClick={onSchedule} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-200 text-sm font-medium min-h-[44px] hover:scale-105">
                <Calendar className="h-4 w-4" /><span className="hidden sm:inline">Agendar</span>
              </button>
              {isOwner && onEdit && (
                <button onClick={onEdit} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-200 text-sm font-medium min-h-[44px] hover:scale-105">
                  <Edit className="h-4 w-4" /><span className="hidden sm:inline">Editar</span>
                </button>
              )}
            </div>

            {/* Hero Card — floating glass */}
            <div className="p-5 md:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.05] mb-2">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/45">
                    {restaurant.creator_name && (
                      <span>Por <span className="text-white/70 font-medium">{restaurant.creator_name}</span></span>
                    )}
                    {restaurant.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span className="truncate max-w-[200px]">{restaurant.location}</span></span>
                    )}
                    {restaurant.created_at && (
                      <span>Adicionado em {new Date(restaurant.created_at).toLocaleDateString("pt-PT")}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                  {restaurant.rating != null && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.12)]">
                      <Star className="h-5 w-5 text-amber-400 fill-current" />
                      <span className="text-xl font-bold text-amber-400">{(restaurant.rating || 0).toFixed(1)}</span>
                    </div>
                  )}
                  {restaurant.price_per_person && restaurant.price_per_person > 0 && (
                    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl">
                      {Array(priceCategory.level).fill(0).map((_, i) => (
                        <Euro key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" fill="currentColor" />
                      ))}
                      {Array(4 - priceCategory.level).fill(0).map((_, i) => (
                        <Euro key={`e-${i}`} className="h-3 w-3 sm:h-4 sm:w-4 text-white/15" />
                      ))}
                      <span className="ml-1 text-sm text-white/50 font-medium">{priceCategory.label}</span>
                      <span className="ml-2 text-sm font-semibold text-amber-400">€{restaurant.price_per_person.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {hasImages && allImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-5 relative z-10 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className={
                  "flex-shrink-0 snap-start relative w-14 h-14 md:w-18 md:h-18 rounded-xl overflow-hidden ring-2 transition-all duration-200 hover:scale-110 " +
                  (i === (restaurant.display_image_index ?? 0)
                    ? "ring-amber-500 scale-110 shadow-lg shadow-amber-500/20"
                    : "ring-white/[0.08] hover:ring-white/25 opacity-60 hover:opacity-100")
                }
                style={{ width: i === (restaurant.display_image_index ?? 0) ? 72 : 56, height: i === (restaurant.display_image_index ?? 0) ? 72 : 56 }}
              >
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Modal
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        variant="full-screen"
        closeOnBackdrop={false}
        ariaLabel="Lightbox de imagens do restaurante"
      >
        <div className="relative w-full h-full flex items-center justify-center p-4" >
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center hover:scale-110 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
          {allImages.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center hover:scale-110">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center hover:scale-110">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img src={allImages[lightboxIndex]} alt={`${restaurant.name} - Foto ${lightboxIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-medium border border-white/[0.08]">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      </Modal>
    </>
  );
}

import React, { useState } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface MenuGalleryProps {
  images?: string[];
  restaurantName?: string;
}

export default function MenuGallery({ images = [], restaurantName = "Menu" }: MenuGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const validImages = images.filter(img => img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image"));
  if (validImages.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % validImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + validImages.length) % validImages.length);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/10 rounded-xl p-2">
            <ImageIcon className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Menu</h2>
            <p className="text-xs text-white/40">{validImages.length} imagem{validImages.length !== 1 ? "ens" : "m"}</p>
          </div>
        </div>
      </div>

      {/* Image Grid — 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {validImages.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-white/[0.06] group cursor-pointer"
          >
            <img
              src={img}
              alt={`${restaurantName} - Foto ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-lg rounded-full p-2.5">
                <ZoomIn className="h-5 w-5 text-white" />
              </div>
            </div>
            {/* Number badge */}
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded-full text-xs font-medium">
              {i + 1}
            </div>
          </button>
        ))}
      </div>

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
            {validImages.length > 1 && (
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
              src={validImages[lightboxIndex]}
              alt={`Menu - Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium">
              {lightboxIndex + 1} de {validImages.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

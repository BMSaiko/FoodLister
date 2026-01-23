import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play, ImageIcon } from 'lucide-react';

/**
 * MenuCarousel - Beautiful, responsive carousel with ErbApp color palette
 * Shows multiple images side-by-side with modern design and mobile-first approach
 */
export default function MenuCarousel({ images = [], className = '' }) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [mobileIconShown, setMobileIconShown] = useState(null); // null or image index

  // Get number of visible images based on screen size
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 3; // Desktop: 3 images
    if (window.innerWidth >= 640) return 2;  // Tablet: 2 images
    return 1; // Mobile: 1 image
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  // Update visible count on resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to first set when images change
  useEffect(() => {
    setStartIndex(0);
  }, [images]);

  // Auto-play functionality - DISABLED for menu carousel (simple animation like restaurant carousel)
  // useEffect(() => {
  //   if (!images || images.length <= visibleCount || !isAutoPlaying) return;

  //   const interval = setInterval(() => {
  //     nextSet();
  //   }, 6000); // Change every 6 seconds for better UX

  //   return () => clearInterval(interval);
  // }, [startIndex, images.length, visibleCount, isAutoPlaying]);

  if (!images || images.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-6 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200 ${className}`}>
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Nenhuma imagem do menu</h3>
        <p className="text-sm text-amber-600 text-center max-w-xs">
          As imagens dos menus aparecerão aqui quando adicionadas ao restaurante
        </p>
      </div>
    );
  }

  // Get visible images for current set
  const getVisibleImages = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const imageIndex = (startIndex + i) % images.length;
      result.push({
        image: images[imageIndex],
        originalIndex: imageIndex
      });
    }
    return result;
  };

  const nextSet = useCallback(() => {
    if (isTransitioning || images.length <= visibleCount) return;
    setIsTransitioning(true);
    // Avançar pelo número de imagens visíveis (3 no desktop, 1 no mobile/tablet)
    const step = visibleCount;
    setStartIndex((prev) => (prev + step) % images.length);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [images.length, visibleCount, isTransitioning]);

  const prevSet = useCallback(() => {
    if (isTransitioning || images.length <= visibleCount) return;
    setIsTransitioning(true);
    // Retroceder pelo número de imagens visíveis (3 no desktop, 1 no mobile/tablet)
    const step = visibleCount;
    setStartIndex((prev) => (prev - step + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [images.length, visibleCount, isTransitioning]);

  const goToSet = useCallback((index) => {
    if (isTransitioning || index === startIndex) return;
    setIsTransitioning(true);
    setStartIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [startIndex, isTransitioning]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Modal functions
  const openModal = useCallback((imageIndex) => {
    setModalImageIndex(imageIndex);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const nextModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevModalImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextModalImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, nextModalImage, prevModalImage, closeModal]);

  const visibleImages = getVisibleImages();

  return (
    <div className={`relative ${className}`}>
      {/* Auto-play Toggle - REMOVED for menu carousel since autoplay is disabled */}

      {/* Images Grid - Mobile Optimized */}
      <div className={`relative grid gap-3 sm:gap-4 lg:gap-6 ${
        visibleCount === 1 ? 'grid-cols-1' :
        visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {visibleImages.map((item, index) => (
          <div
            key={`${startIndex}-${index}`}
            className={`relative group cursor-pointer transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-80 scale-95' : 'opacity-100 scale-100'
            }`}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              e.currentTarget.dataset.touchStart = touch.clientX;
            }}
            onTouchEnd={(e) => {
              const touch = e.changedTouches[0];
              const startX = parseFloat(e.currentTarget.dataset.touchStart || '0');
              const diff = startX - touch.clientX;

              if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0 && images.length > visibleCount) {
                  nextSet();
                } else if (diff < 0 && images.length > visibleCount) {
                  prevSet();
                }
              }
            }}
          >
            {/* Image Container - Mobile Friendly */}
            <div
              className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.01] sm:group-hover:scale-[1.02] group-active:scale-95"
              onClick={() => {
                const isMobile = window.innerWidth < 640;

                if (isMobile) {
                  // Mobile: double-click behavior
                  if (mobileIconShown === item.originalIndex) {
                    // Second click: open modal
                    setMobileIconShown(null);
                    openModal(item.originalIndex);
                  } else {
                    // First click: show icon
                    setMobileIconShown(item.originalIndex);
                    // Auto-hide icon after 2 seconds
                    setTimeout(() => {
                      setMobileIconShown(null);
                    }, 2000);
                  }
                } else {
                  // Desktop: direct modal open
                  openModal(item.originalIndex);
                }
              }}
            >
              <Image
                src={item.image}
                alt={`Imagem do menu ${item.originalIndex + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 sm:group-hover:scale-110"
                sizes={`(max-width: 640px) 100vw, (max-width: 1024px) ${50}vw, ${33.333}vw`}
                priority={index === 0}
              />

              {/* Gradient Overlay - Mobile Optimized */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image Number Badge - Mobile Friendly */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm text-amber-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold shadow-lg">
                {item.originalIndex + 1}
              </div>

              {/* Hover/Tap Indicator - Mobile */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                window.innerWidth >= 640
                  ? 'opacity-0 group-hover:opacity-100' // Desktop: hover
                  : mobileIconShown === item.originalIndex
                    ? 'opacity-100' // Mobile: state control
                    : 'opacity-0 group-active:opacity-100' // Mobile: temporary on tap
              }`}>
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
              </div>

              {/* Navigation Buttons - Inside Images */}
              {images.length > visibleCount && (
                <>
                  {/* Left Button - Only on first image (index 0) */}
                  {index === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSet();
                      }}
                      disabled={isTransitioning}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-amber-500 active:bg-amber-600 border-2 border-amber-200 hover:border-amber-500 active:border-amber-600 text-amber-600 hover:text-white active:text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:shadow-md touch-manipulation"
                      aria-label="Imagens anteriores"
                    >
                      <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
                    </button>
                  )}

                  {/* Right Button - Only on last image */}
                  {index === visibleImages.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSet();
                      }}
                      disabled={isTransitioning}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 border-2 border-amber-500 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:shadow-md touch-manipulation"
                      aria-label="Próximas imagens"
                    >
                      <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
                    </button>
                  )}

                  {/* Progress Dots - Inside Central Image */}
                  {visibleCount > 1 && (
                    <>
                      {/* Mobile: Single image shows dots */}
                      {visibleCount === 1 && index === 0 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                          {Array.from({ length: Math.ceil(images.length / Math.max(visibleCount, 1)) }, (_, dotIndex) => (
                            <button
                              key={dotIndex}
                              onClick={() => goToSet(dotIndex)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                Math.floor(startIndex / visibleCount) === dotIndex
                                  ? 'bg-amber-500 scale-125 shadow-sm'
                                  : 'bg-gray-300 hover:bg-amber-400 hover:scale-110'
                              }`}
                              aria-label={`Conjunto ${dotIndex + 1} de imagens`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Tablet: Right image shows dots */}
                      {visibleCount === 2 && index === 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                          {Array.from({ length: Math.ceil(images.length / Math.max(visibleCount, 1)) }, (_, dotIndex) => (
                            <button
                              key={dotIndex}
                              onClick={() => goToSet(dotIndex)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                Math.floor(startIndex / visibleCount) === dotIndex
                                  ? 'bg-amber-500 scale-125 shadow-sm'
                                  : 'bg-gray-300 hover:bg-amber-400 hover:scale-110'
                              }`}
                              aria-label={`Conjunto ${dotIndex + 1} de imagens`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Desktop: Center image shows dots */}
                      {visibleCount === 3 && index === 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                          {Array.from({ length: Math.ceil(images.length / Math.max(visibleCount, 1)) }, (_, dotIndex) => (
                            <button
                              key={dotIndex}
                              onClick={() => goToSet(dotIndex)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                Math.floor(startIndex / visibleCount) === dotIndex
                                  ? 'bg-amber-500 scale-125 shadow-sm'
                                  : 'bg-gray-300 hover:bg-amber-400 hover:scale-110'
                              }`}
                              aria-label={`Conjunto ${dotIndex + 1} de imagens`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Modal Lightbox */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg"
              aria-label="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModalImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModalImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {/* Modal Image */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full max-w-5xl max-h-full">
                <Image
                  src={images[modalImageIndex]}
                  alt={`Imagem do menu ${modalImageIndex + 1} (ampliada)`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  priority
                />

                {/* Touch overlay for swipe on mobile */}
                <div
                  className="absolute inset-0 sm:hidden"
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    e.currentTarget.dataset.touchStart = touch.clientX;
                  }}
                  onTouchEnd={(e) => {
                    const touch = e.changedTouches[0];
                    const startX = parseFloat(e.currentTarget.dataset.touchStart || '0');
                    const diff = startX - touch.clientX;

                    if (Math.abs(diff) > 50) {
                      if (diff > 0 && images.length > 1) {
                        nextModalImage();
                      } else if (diff < 0 && images.length > 1) {
                        prevModalImage();
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {modalImageIndex + 1} de {images.length}
            </div>

            {/* Keyboard Instructions - Desktop only */}
            <div className="absolute bottom-4 right-4 hidden sm:block bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
              <div className="flex items-center space-x-2">
                <span>← → Navegar</span>
                <span>•</span>
                <span>ESC Fechar</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

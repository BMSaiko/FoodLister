import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface HorizontalImageListProps {
  images?: string[];
  title?: string;
  className?: string;
}

/**
 * HorizontalImageList - Lista horizontal scrollável de imagens
 * Permite scroll lateral manual com design consistente
 */
export default function HorizontalImageList({
  images = [],
  title = "Imagens do Menu",
  className = ""
}: HorizontalImageListProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 ${className}`}>
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
            <ImageIcon className="h-5 w-5 sm:h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Nenhuma imagem disponível</p>
          </div>
        </div>
        
        <div className="text-center py-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 sm:h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            As imagens do menu aparecerão aqui quando adicionadas ao restaurante
          </p>
        </div>
      </div>
    );
  }

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation for modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, nextImage, prevImage, closeModal]);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 ${className}`}>
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
          <ImageIcon className="h-5 w-5 sm:h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{images.length} imagem{images.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      {/* Container de Scroll Horizontal */}
      <div className="relative">
        {/* Sombra esquerda indicando scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" />
        
        {/* Scroll Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-2 hide-scrollbar">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start cursor-pointer group"
              onClick={() => openModal(index)}
            >
              {/* Container da Imagem */}
              <div className="relative w-64 sm:w-80 lg:w-96 h-48 sm:h-64 lg:h-72 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-active:scale-95">
                <Image
                  src={image}
                  alt={`Imagem do menu ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 12rem, (max-width: 1024px) 16rem, 20rem"
                  priority={index === 0}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge do número */}
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-amber-800 px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {index + 1}
                </div>
                
                {/* Ícone de visualização */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  </div>
                </div>
              </div>
              
              {/* Legenda opcional */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-600">Menu {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sombra direita indicando scroll */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" />
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

            {/* Navigation Buttons - Left */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 touch-manipulation"
                aria-label="Imagem anterior"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  e.currentTarget.dataset.touchStart = `${touch.clientX}`;
                }}
                onTouchEnd={(e) => {
                  const touch = e.changedTouches[0];
                  const startX = parseFloat(e.currentTarget.dataset.touchStart || '0');
                  const diff = startX - touch.clientX;

                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      nextImage();
                    } else {
                      prevImage();
                    }
                  }
                }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Navigation Buttons - Right */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 touch-manipulation"
                aria-label="Próxima imagem"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  e.currentTarget.dataset.touchStart = `${touch.clientX}`;
                }}
                onTouchEnd={(e) => {
                  const touch = e.changedTouches[0];
                  const startX = parseFloat(e.currentTarget.dataset.touchStart || '0');
                  const diff = startX - touch.clientX;

                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      nextImage();
                    } else {
                      prevImage();
                    }
                  }
                }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Modal Image with Swipe Support */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.dataset.touchStart = `${touch.clientX}`;
              }}
              onTouchEnd={(e) => {
                const touch = e.changedTouches[0];
                const startX = parseFloat(e.currentTarget.dataset.touchStart || '0');
                const diff = startX - touch.clientX;

                if (Math.abs(diff) > 50) {
                  if (diff > 0 && images.length > 1) {
                    nextImage();
                  } else if (diff < 0 && images.length > 1) {
                    prevImage();
                  }
                }
              }}
            >
              <div className="relative w-full h-full max-w-5xl max-h-full">
                <Image
                  src={images[modalImageIndex]}
                  alt={`Imagem do menu ${modalImageIndex + 1} (ampliada)`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  priority
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
                <span>•</span>
                <span>Swipe arrastar</span>
              </div>
            </div>

            {/* Touch Instructions - Mobile only */}
            <div className="absolute bottom-4 left-4 sm:hidden bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
              <div className="flex items-center space-x-2">
                <span>Arraste para navegar</span>
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
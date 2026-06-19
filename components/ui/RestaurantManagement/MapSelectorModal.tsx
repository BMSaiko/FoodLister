"use client";

import React, { useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Globe } from 'lucide-react';
import { logError } from '@/utils/logger';
import { useModal } from '@/contexts/ModalContext';

export default function MapSelectorModal() {
  const { isMapModalOpen, mapModalData, closeMapModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Always run useEffect to maintain hook order
  useEffect(() => {
    // Only set up event listeners when modal is open
    if (!isMapModalOpen || !mapModalData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMapModal();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      // Only close if clicking outside the modal content area
      const target = e.target as HTMLElement;
      
      // Check if the click target is outside the modal content
      if (modalRef.current && !modalRef.current.contains(target)) {
        closeMapModal();
      }
      // If clicking inside the modal content, check if it's on an interactive element
      else if (modalRef.current && modalRef.current.contains(target)) {
        // Check if the click target or its parent is an interactive element
        const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
        let currentElement: HTMLElement | null = target;
        
        while (currentElement && currentElement !== modalRef.current) {
          if (interactiveElements.includes(currentElement.tagName)) {
            // Clicked on an interactive element, don't close modal
            return;
          }
          currentElement = currentElement.parentElement;
        }
        
        // If we reach here, the click was on the modal content but not on an interactive element
        // This could be clicking on the modal background or text, so we should NOT close
        // Only close when clicking outside the modal content area
      }
    };

    // Focus the first button when modal opens
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [isMapModalOpen, mapModalData, closeMapModal]);

  // Early return after hooks to maintain hook order
  if (!isMapModalOpen || !mapModalData) return null;

  const { location, latitude, longitude, source_url } = mapModalData;

  // Enhanced coordinate validation with better error handling
  const hasValidCoords = (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    isFinite(latitude) &&
    isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude !== 0 &&
    longitude !== 0
  );

  // Enhanced location validation
  const validLocation = location && 
    typeof location === 'string' && 
    location.trim().length > 0 && 
    location !== 'undefined' && 
    location !== 'null';

  const encodedLocation = validLocation ? encodeURIComponent(location.trim()) : '';

      // URLs for different map apps with proper validation
      // Google Maps uses extracted source_url (original Google Maps link from creation)
      // Waze and Apple Maps use only coordinates (no location string)
      const mapOptions = [
        {
          name: 'Google Maps',
          icon: MapPin,
          url: source_url || (hasValidCoords
            ? `https://maps.google.com/?ll=${latitude},${longitude}`
            : 'https://maps.google.com/'),
          color: 'bg-[var(--blue-500)] hover:bg-[var(--blue-600)]',
          textColor: 'text-[var(--primary-foreground)]'
        },
        {
          name: 'Waze',
          icon: Navigation,
          url: hasValidCoords
            ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
            : 'https://waze.com/',
          color: 'bg-[var(--purple-500)] hover:bg-[var(--purple-600)]',
          textColor: 'text-[var(--primary-foreground)]'
        },
        {
          name: 'Apple Maps',
          icon: Globe,
          url: hasValidCoords
            ? `https://maps.apple.com/?ll=${latitude},${longitude}`
            : 'https://maps.apple.com/',
          color: 'bg-[var(--gray-500)] hover:bg-[var(--gray-600)]',
          textColor: 'text-[var(--primary-foreground)]'
        }
      ];

  const handleOpenMap = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      closeMapModal();
    } catch (error) {
      logError('Failed to open map application', error);
      // Could add user notification here if needed
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow-lg)] max-w-md w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[var(--gray-200)]">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[var(--gray-600)]" />
            <h2 id="map-modal-title" className="text-lg font-semibold text-[var(--gray-800)]">Abrir localização em</h2>
          </div>
          <button
            ref={initialFocusRef}
            onClick={closeMapModal}
            className="text-[var(--gray-400)] hover:text-[var(--gray-600)] p-1 rounded-md hover:bg-[var(--gray-100)] transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {/* Prominent location display */}
          {validLocation && (
            <div className="mb-3 sm:mb-4 p-3 bg-[var(--blue-50)] rounded-lg border border-[var(--blue-100)] flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-[var(--blue-600)] flex-shrink-0" />
              <span className="text-sm text-[var(--blue-800)] font-medium truncate">{location}</span>
            </div>
          )}

          <p className="text-sm text-[var(--gray-600)] mb-3 sm:mb-4 text-center">
            Escolha o aplicativo de mapas:
          </p>

          {/* Data validation warnings */}
          {(!validLocation || !hasValidCoords) && (
            <div className="bg-[var(--yellow-50)] border border-[var(--yellow-200)] rounded-lg p-3 mb-3 sm:mb-4">
              <div className="text-[var(--yellow-600)] text-sm">
                {!validLocation && !hasValidCoords && (
                  <p>• Localização e coordenadas inválidas - abrindo mapas gerais</p>
                )}
                {!validLocation && hasValidCoords && (
                  <p>• Localização inválida - usando apenas coordenadas</p>
                )}
                {validLocation && !hasValidCoords && (
                  <p>• Coordenadas inválidas - usando apenas localização</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {mapOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => handleOpenMap(option.url)}
                  className={`w-full flex items-center justify-center px-4 py-3 min-h-[48px] rounded-lg transition-all duration-200 ${option.color} ${option.textColor} font-medium text-sm sm:text-base hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--blue-600)] border border-transparent`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                  {option.name}
                </button>
              );
            })}
          </div>

          {/* Cancel Button */}
          <div className="mt-3 sm:mt-4">
            <button
              onClick={closeMapModal}
              className="w-full flex items-center justify-center px-4 py-3 min-h-[48px] rounded-lg border border-[var(--gray-300)] text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition-all duration-200 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gray-500)]"
            >
              Cancelar
            </button>
          </div>

          {/* Precise location display */}
          <div className="mt-3 sm:mt-4 text-center">
            {hasValidCoords && (
              <div className="text-xs text-[var(--blue-600)] font-mono bg-[var(--blue-50)] rounded-lg p-2 border border-[var(--blue-100)]">
                <div className="font-medium text-[var(--blue-800)] mb-1">Coordenadas precisas:</div>
                <div className="text-sm">{latitude.toFixed(6)}, {longitude.toFixed(6)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
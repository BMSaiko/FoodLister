"use client";

import React, { useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Globe } from 'lucide-react';
import { logError } from '@/utils/logger';
import { useModal } from '@/contexts/ModalContext';
import Modal from '@/components/ui/Modal';

export default function MapSelectorModal() {
  const { isMapModalOpen, mapModalData, closeMapModal } = useModal();
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Always run useEffect to maintain hook order
  // ESC/click-outside/scroll-lock handled by <Modal>

  // Early return after hooks to maintain hook order
  if (!mapModalData) return null;

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
          color: 'bg-blue-500 hover:bg-blue-600',
          textColor: 'text-white'
        },
        {
          name: 'Waze',
          icon: Navigation,
          url: hasValidCoords
            ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
            : 'https://waze.com/',
          color: 'bg-purple-500 hover:bg-purple-600',
          textColor: 'text-white'
        },
        {
          name: 'Apple Maps',
          icon: Globe,
          url: (hasValidCoords && validLocation)
            ? `https://maps.apple.com/?q=${encodeURIComponent(location.trim())}&ll=${latitude},${longitude}`
            : hasValidCoords
              ? `https://maps.apple.com/?ll=${latitude},${longitude}`
              : 'https://maps.apple.com/',
          color: 'bg-white/50 hover:bg-white/60',
          textColor: 'text-white'
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
    <Modal isOpen={isMapModalOpen} onClose={closeMapModal} size="md" ariaLabel="Abrir localização em">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-white/[0.08]">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-white/60" />
            <h2 id="map-modal-title" className="text-lg font-semibold text-white/80">Abrir localização em</h2>
          </div>
          <button
            ref={initialFocusRef}
            onClick={closeMapModal}
            className="text-white/40 hover:text-white/60 p-1 rounded-md hover:bg-[var(--gray-100)] transition-colors"
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

          <p className="text-sm text-white/60 mb-3 sm:mb-4 text-center">
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
              className="w-full flex items-center justify-center px-4 py-3 min-h-[48px] rounded-lg border border-[var(--gray-300)] text-white/70 hover:bg-white/[0.03] transition-all duration-200 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gray-500)]"
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
    </Modal>
  );
}
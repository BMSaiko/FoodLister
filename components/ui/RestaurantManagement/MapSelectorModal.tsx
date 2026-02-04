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

  const { location, latitude, longitude } = mapModalData;

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
  const mapOptions = [
    {
      name: 'Google Maps',
      icon: MapPin,
      url: hasValidCoords
        ? `https://maps.google.com/?ll=${latitude},${longitude}`
        : validLocation
        ? `https://maps.google.com/?q=${encodedLocation}`
        : 'https://maps.google.com/',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      name: 'Waze',
      icon: Navigation,
      url: hasValidCoords && validLocation
        ? `https://waze.com/ul?ll=${latitude},${longitude}&q=${encodedLocation}&navigate=yes`
        : validLocation
        ? `https://waze.com/ul?q=${encodedLocation}&navigate=yes`
        : 'https://waze.com/',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      name: 'Apple Maps',
      icon: Globe,
      url: hasValidCoords && validLocation
        ? `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedLocation}`
        : validLocation
        ? `https://maps.apple.com/?q=${encodedLocation}`
        : 'https://maps.apple.com/',
      color: 'bg-gray-500 hover:bg-gray-600',
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
    <div 
      className="fixed inset-0 backdrop-blur-2xl bg-transparent flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
          <h2 id="map-modal-title" className="text-lg font-semibold text-gray-800">Abrir localização em</h2>
          <button
            ref={initialFocusRef}
            onClick={closeMapModal}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <p className="text-sm text-gray-600 mb-3 sm:mb-4 text-center">
            Escolha o aplicativo de mapas:
          </p>

          {/* Data validation warnings */}
          {(!validLocation || !hasValidCoords) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 sm:mb-4">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 text-sm">
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
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            {mapOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => handleOpenMap(option.url)}
                  className={`w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ${option.color} ${option.textColor} font-medium text-sm sm:text-base hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  {option.name}
                </button>
              );
            })}
          </div>

          {/* Precise location display */}
          <div className="mt-3 sm:mt-4 text-center">
            {hasValidCoords && (
              <div className="text-xs text-blue-600 font-mono bg-blue-50 rounded-lg p-2 border border-blue-100">
                <div className="font-medium text-blue-800 mb-1">Coordenadas precisas:</div>
                <div className="text-sm">{latitude.toFixed(6)}, {longitude.toFixed(6)}</div>
              </div>
            )}
            {validLocation && (
              <div className="text-xs text-gray-600 mt-2">
                <div className="font-medium text-gray-700 mb-1">Localização:</div>
                <div className="text-left max-w-xs mx-auto text-sm">{location}</div>
              </div>
            )}
          </div>

          {/* Detailed address information when coordinates are available */}
          {hasValidCoords && (
            <div className="mt-3 sm:mt-4 text-center">
              <div className="text-xs text-purple-600 bg-purple-50 rounded-lg p-2 border border-purple-100">
                <div className="font-medium text-purple-800 mb-1">Endereço detalhado:</div>
                <div className="text-sm">
                  Clique em um aplicativo de mapas para obter informações completas de endereço
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  (Rua, número, bairro, cidade, código postal, estado, país)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

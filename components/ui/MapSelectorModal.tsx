"use client";

import React from 'react';
import { X, MapPin, Navigation, Globe } from 'lucide-react';
import { logError } from '../../utils/logger';

interface MapSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function MapSelectorModal({
  isOpen,
  onClose,
  location,
  latitude,
  longitude
}: MapSelectorModalProps) {
  if (!isOpen) return null;

  // Validate and handle edge cases for location
  const validLocation = location && typeof location === 'string' && location.trim().length > 0;
  const encodedLocation = validLocation ? encodeURIComponent(location.trim()) : '';

  // Validate coordinates (handle zero values properly)
  const hasValidCoords = (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );

  // URLs for different map apps with proper validation
  const mapOptions = [
    {
      name: 'Google Maps',
      icon: MapPin,
      url: hasValidCoords && validLocation
        ? `https://maps.google.com/?ll=${latitude},${longitude}&q=${encodedLocation}`
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
      onClose();
    } catch (error) {
      logError('Failed to open map application', error);
      // Could add user notification here if needed
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Abrir localização em</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Escolha o aplicativo de mapas:
          </p>

          {/* Data validation warnings */}
          {(!validLocation || !hasValidCoords) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
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

          <div className="space-y-3">
            {mapOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => handleOpenMap(option.url)}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${option.color} ${option.textColor} font-medium`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {option.name}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}

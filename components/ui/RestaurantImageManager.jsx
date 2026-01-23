import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Image as ImageIcon, AlertCircle, Star, Check } from 'lucide-react';
import ImageUploader from './ImageUploader';
import Image from 'next/image';

/**
 * RestaurantImageManager component - manages multiple restaurant images with display image selection
 * Supports up to 10 uploaded images with ability to select which one is the main display image
 */
export default function RestaurantImageManager({
  images = [],
  displayImageIndex = -1,
  onImagesChange,
  onDisplayImageIndexChange,
  disabled = false
}) {
  // Create stable refs for callbacks to prevent dependency array changes
  const onImagesChangeRef = useRef(onImagesChange);
  const onDisplayImageIndexChangeRef = useRef(onDisplayImageIndexChange);

  // Update refs when props change
  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  useEffect(() => {
    onDisplayImageIndexChangeRef.current = onDisplayImageIndexChange;
  }, [onDisplayImageIndexChange]);

  // Local state for managing images (following MenuManager exact pattern)
  const [localImages, setLocalImages] = useState(Array.isArray(images) ? images : []);
  const [selectedDisplayIndex, setSelectedDisplayIndex] = useState(displayImageIndex);

  // Sync local images with parent when they change (following MenuManager exact pattern)
  useEffect(() => {
    setLocalImages(Array.isArray(images) ? images : []);
  }, [images]);

  // Sync selected display index with parent
  useEffect(() => {
    setSelectedDisplayIndex(displayImageIndex);
  }, [displayImageIndex]);

  // Sync local images back to parent using stable ref
  useEffect(() => {
    onImagesChangeRef.current(localImages);
  }, [localImages]);

  // Sync display index back to parent using stable ref
  useEffect(() => {
    onDisplayImageIndexChangeRef.current(selectedDisplayIndex);
  }, [selectedDisplayIndex]);

  // Add an image (using local state, following MenuManager exact pattern)
  const handleImageUploaded = (imageUrl) => {
    if (localImages.length >= 10) {
      return; // Safety check
    }
    setLocalImages(prev => {
      const newImages = [...prev, imageUrl];
      // If this is the first image, automatically set it as display image
      if (newImages.length === 1 && selectedDisplayIndex === -1) {
        setSelectedDisplayIndex(0);
      }
      return newImages;
    });
  };

  // Remove an image
  const handleRemoveImage = (index) => {
    const newImages = localImages.filter((_, i) => i !== index);
    setLocalImages(newImages);

    // Adjust display index if necessary
    if (selectedDisplayIndex === index) {
      // If removing the display image, set to first image or -1 if no images left
      if (newImages.length > 0) {
        setSelectedDisplayIndex(0);
      } else {
        setSelectedDisplayIndex(-1);
      }
    } else if (selectedDisplayIndex > index) {
      // If display index is after the removed image, decrement it
      setSelectedDisplayIndex(selectedDisplayIndex - 1);
    }
  };

  // Set display image
  const handleSetDisplayImage = (index) => {
    setSelectedDisplayIndex(index);
  };

  // Move image up in order (for better UX when ordering)
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newImages = [...localImages];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setLocalImages(newImages);

    // Adjust display index if necessary
    if (selectedDisplayIndex === index) {
      setSelectedDisplayIndex(index - 1);
    } else if (selectedDisplayIndex === index - 1) {
      setSelectedDisplayIndex(index);
    }
  };

  // Move image down in order
  const handleMoveDown = (index) => {
    if (index === localImages.length - 1) return;
    const newImages = [...localImages];
    [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    setLocalImages(newImages);

    // Adjust display index if necessary
    if (selectedDisplayIndex === index) {
      setSelectedDisplayIndex(index + 1);
    } else if (selectedDisplayIndex === index + 1) {
      setSelectedDisplayIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <ImageIcon className="h-4 w-4 mr-2 text-amber-500" />
          Imagens do Restaurante
          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            {localImages.length}/10
          </span>
        </div>
        {selectedDisplayIndex >= 0 && localImages.length > 0 && (
          <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Imagem principal: {selectedDisplayIndex + 1}
          </div>
        )}
      </div>

      {/* Image Uploader */}
      {localImages.length < 10 && !disabled && (
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          maxFiles={10 - localImages.length}
        />
      )}

      {/* Images Grid */}
      {localImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className={`relative aspect-square rounded-xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                selectedDisplayIndex === index
                  ? 'border-amber-500 ring-2 ring-amber-200'
                  : 'border-gray-200'
              }`}>
                <Image
                  src={imageUrl}
                  alt={`Restaurante ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Display image indicator */}
                {selectedDisplayIndex === index && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Principal
                  </div>
                )}

                {/* Image number badge */}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {index + 1}
                </div>

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetDisplayImage(index)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        selectedDisplayIndex === index
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-white'
                      } shadow-lg`}
                      title={selectedDisplayIndex === index ? "Imagem principal" : "Definir como imagem principal"}
                    >
                      <Star className={`h-4 w-4 ${selectedDisplayIndex === index ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                      title="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons below image */}
              <div className="flex justify-between mt-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === localImages.length - 1}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetDisplayImage(index)}
                  className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                    selectedDisplayIndex === index
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                  title="Definir como imagem principal"
                >
                  <Star className={`h-3 w-3 ${selectedDisplayIndex === index ? 'fill-current' : ''}`} />
                  {selectedDisplayIndex === index ? 'Principal' : 'Principal'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200">
          <ImageIcon className="h-12 w-12 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Nenhuma imagem adicionada</h3>
          <p className="text-sm text-amber-600 mb-4">Adicione imagens do restaurante para criar um carrossel atrativo</p>
          <p className="text-xs text-amber-500">A primeira imagem adicionada será automaticamente definida como principal</p>
        </div>
      )}

      {/* Summary and tips */}
      <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>• Imagens do restaurante: {localImages.length}/10 máximo</div>
          <div>• A imagem principal aparece nos cards e no início do carrossel</div>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-amber-600 font-medium">💡 Dica: Use a primeira imagem como foto de destaque do restaurante</p>
        </div>
      </div>
    </div>
  );
}
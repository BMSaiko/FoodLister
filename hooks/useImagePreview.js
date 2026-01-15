import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling image preview state and loading
 * @param {string} imageUrl - The image URL to preview
 * @param {function} convertUrl - Function to convert/process the URL (optional)
 * @returns {object} - Object containing preview state and handlers
 */
export function useImagePreview(imageUrl, convertUrl = null) {
  const [previewState, setPreviewState] = useState({
    isLoading: false,
    hasError: false,
    isLoaded: false
  });

  const handleImageLoad = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      isLoaded: true
    }));
  }, []);

  const handleImageError = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      isLoaded: false
    }));
  }, []);

  // Preload image when URL changes
  useEffect(() => {
    if (imageUrl) {
      setPreviewState(prev => ({ ...prev, isLoading: true, hasError: false, isLoaded: false }));

      const processedUrl = convertUrl ? convertUrl(imageUrl) : imageUrl;
      const img = new Image();

      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = processedUrl;

      // Fallback timeout for slow-loading images
      const timeout = setTimeout(() => {
        if (previewState.isLoading) {
          handleImageError();
        }
      }, 10000);

      return () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setPreviewState({ isLoading: false, hasError: false, isLoaded: false });
    }
  }, [imageUrl, convertUrl, handleImageLoad, handleImageError]);

  return {
    previewState,
    handleImageLoad,
    handleImageError
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';

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

  const timeoutRef = useRef(null);

  const handleImageLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPreviewState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      isLoaded: true
    }));
  }, []);

  const handleImageError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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

      // Fallback timeout for slow-loading images - use ref to track if timeout should trigger
      timeoutRef.current = setTimeout(() => {
        // Only trigger if timeout wasn't cleared by load/error handlers
        if (timeoutRef.current) {
          handleImageError();
        }
      }, 10000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
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

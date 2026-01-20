import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for handling image preview state and loading
 * Complete reimplementation from scratch
 * @param {string} imageUrl - The image URL to preview
 * @param {function} convertUrl - Function to convert/process the URL (optional)
 * @returns {object} - Object containing preview state and handlers
 */
export function useImagePreview(imageUrl, convertUrl = null) {
  // State for tracking image loading status
  const [previewState, setPreviewState] = useState({
    isLoading: false,
    hasError: false,
    isLoaded: false
  });

  // Ref to track timeout for cleanup
  const timeoutRef = useRef(null);

  /**
   * Handles successful image load
   */
  const handleImageLoad = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update state to reflect successful load
    setPreviewState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      isLoaded: true
    }));
  }, []);

  /**
   * Handles image load error
   */
  const handleImageError = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update state to reflect error
    setPreviewState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      isLoaded: false
    }));
  }, []);

  /**
   * Effect to preload image when URL changes
   */
  useEffect(() => {
    // Only process if we have a URL
    if (imageUrl) {
      // Start loading state
      setPreviewState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        isLoaded: false
      }));

      // Process URL with converter if provided
      const processedUrl = convertUrl ? convertUrl(imageUrl) : imageUrl;

      // Create new Image object for preloading
      const img = new Image();

      // Set up event handlers
      img.onload = handleImageLoad;
      img.onerror = handleImageError;

      // Trigger load
      img.src = processedUrl;

      // Set up fallback timeout (10 seconds)
      timeoutRef.current = setTimeout(() => {
        // Only trigger if timeout wasn't cleared by load/error handlers
        if (timeoutRef.current) {
          console.warn('Image load timeout, marking as error');
          handleImageError();
        }
      }, 10000);

      // Cleanup function
      return () => {
        // Clear timeout if it exists
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Clear image event handlers to prevent memory leaks
        img.onload = null;
        img.onerror = null;
      };
    } else {
      // No URL provided, reset to initial state
      setPreviewState({
        isLoading: false,
        hasError: false,
        isLoaded: false
      });
    }
  }, [imageUrl, convertUrl, handleImageLoad, handleImageError]);

  // Return state and handlers
  return {
    previewState,
    handleImageLoad,
    handleImageError
  };
}

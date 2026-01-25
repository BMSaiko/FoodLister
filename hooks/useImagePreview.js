import { useState, useEffect, useCallback, useRef } from 'react';

import { logError } from '../utils/logger';

export function useImagePreview(file, maxSize = 5 * 1024 * 1024) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef(null);

  const handleImageError = useCallback(() => {
    setError('Erro ao carregar a imagem. Por favor, tente novamente.');
    setPreview(null);
    setProgress(0);
  }, []);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    setProgress(100);
  }, []);

  const handleImageTimeout = useCallback(() => {
    handleImageError();
    logError('Image load timeout', null, { fileName: file?.name, fileSize: file?.size });
  }, [file, handleImageError]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      setError(null);
      setLoading(false);
      setProgress(0);
      return;
    }

    if (file.size > maxSize) {
      setError(`O arquivo é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Setup timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleImageTimeout, 10000); // 10 seconds timeout

    // Cleanup
    return () => {
      URL.revokeObjectURL(objectUrl);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [file, maxSize, handleImageTimeout]);

  useEffect(() => {
    if (preview) {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = preview;
    }
  }, [preview, handleImageLoad, handleImageError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
    setLoading(false);
    setProgress(0);
  }, [preview]);

  return {
    preview,
    error,
    loading,
    progress,
    clearError,
    clearPreview
  };
}

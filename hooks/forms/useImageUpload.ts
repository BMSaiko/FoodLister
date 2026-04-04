/**
 * useImageUpload - Hook for handling image uploads to Cloudinary
 * Provides upload, preview, and removal functionality
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { uploadToCloudinary, optimizeCloudinaryUrl } from '@/utils/cloudinaryConverter';

export interface UploadedImage {
  url: string;
  publicId?: string;
  isDisplay?: boolean;
}

export interface UseImageUploadOptions {
  maxImages?: number;
  maxSizeMB?: number;
  folder?: string;
  onImagesChange?: (images: UploadedImage[]) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxImages = 10,
    maxSizeMB = 5,
    folder = 'restaurants',
    onImagesChange
  } = options;

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [displayImageIndex, setDisplayImageIndex] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file upload
  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Check max images limit
    if (images.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitido`, {
        position: "top-center",
        autoClose: 3000
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedImages: UploadedImage[] = [];
    let completed = 0;

    try {
      for (const file of files) {
        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`Imagem "${file.name}" excede o tamanho máximo de ${maxSizeMB}MB`, {
            position: "top-center",
            autoClose: 3000
          });
          completed++;
          continue;
        }

        try {
          const result = await uploadToCloudinary(file, folder);
          
          if (result.url) {
            // Optimize the URL for delivery
            const optimizedUrl = optimizeCloudinaryUrl(result.url);
            
            const uploadedImage: UploadedImage = {
              url: optimizedUrl,
              publicId: result.publicId
            };
            
            uploadedImages.push(uploadedImage);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Erro ao fazer upload de "${file.name}"`, {
            position: "top-center",
            autoClose: 3000
          });
        }

        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }

      if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        
        // Set first image as display if none set
        if (displayImageIndex === -1 && newImages.length > 0) {
          setDisplayImageIndex(0);
        }
        
        onImagesChange?.(newImages);
        
        toast.success(`${uploadedImages.length} imagem(ns) uploadada(s) com sucesso`, {
          position: "top-center",
          autoClose: 3000
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images, displayImageIndex, maxImages, maxSizeMB, folder, onImagesChange]);

  // Remove image at index
  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Adjust display image index if needed
    if (displayImageIndex === index) {
      // If we removed the display image, set to first available or -1
      setDisplayImageIndex(newImages.length > 0 ? 0 : -1);
    } else if (displayImageIndex > index) {
      // If we removed an image before the display image, decrement index
      setDisplayImageIndex(displayImageIndex - 1);
    }
    
    onImagesChange?.(newImages);
  }, [images, displayImageIndex, onImagesChange]);

  // Set display image
  const setDisplayImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setDisplayImageIndex(index);
      onImagesChange?.(images);
    }
  }, [images, onImagesChange]);

  // Reorder images
  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    
    setImages(newImages);
    
    // Adjust display image index
    let newDisplayIndex = displayImageIndex;
    if (displayImageIndex === fromIndex) {
      newDisplayIndex = toIndex;
    } else if (displayImageIndex > fromIndex && displayImageIndex <= toIndex) {
      newDisplayIndex--;
    } else if (displayImageIndex < fromIndex && displayImageIndex >= toIndex) {
      newDisplayIndex++;
    }
    setDisplayImageIndex(newDisplayIndex);
    
    onImagesChange?.(newImages);
  }, [images, displayImageIndex, onImagesChange]);

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setDisplayImageIndex(-1);
    onImagesChange?.([]);
  }, [onImagesChange]);

  // Set images directly (for loading existing data)
  const setImagesDirect = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages);
    
    // Find display image or set to -1
    const displayIdx = newImages.findIndex(img => img.isDisplay);
    setDisplayImageIndex(displayIdx >= 0 ? displayIdx : (newImages.length > 0 ? 0 : -1));
  }, []);

  return {
    images,
    displayImageIndex,
    isUploading,
    uploadProgress,
    uploadFiles,
    removeImage,
    setDisplayImage,
    reorderImages,
    clearImages,
    setImagesDirect
  };
}

/**
 * Cloudinary utilities for image upload and optimization
 * Complete reimplementation from scratch
 */

/**
 * Converts Cloudinary URLs to optimized format with transformations
 */
export function convertCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // Validate input
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Check if it's a Cloudinary URL that can be optimized
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const { width, height, quality = 80 } = options;

    // Build transformation string
    let transformations = `f_auto,q_${quality}`;

    if (width) {
      transformations += `,w_${width}`;
    }

    if (height) {
      transformations += `,h_${height}`;
    }

    // Insert transformations into URL
    return url.replace('/upload/', `/upload/${transformations}/`);
  }

  // Return original URL if not a Cloudinary URL
  return url;
}

/**
 * Validates if a given URL is a valid Cloudinary URL
 */
export function isValidCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return url.includes('cloudinary.com');
}

/**
 * Extracts the public ID from a Cloudinary URL
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Match Cloudinary URL pattern and extract public ID
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Validates if a file is a valid image
 * Uses both MIME type and file extension for maximum compatibility
 */
function isValidImageFile(file: File): boolean {
  // Check MIME type first (most reliable)
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // Fallback to file extension (useful for mobile devices)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.heic'];
  const fileName = file.name.toLowerCase();

  return validExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Uploads an image file to Cloudinary via the server API
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // Validate input file
  if (!file) {
    throw new Error('Nenhum arquivo fornecido');
  }

  // Validate file type
  if (!isValidImageFile(file)) {
    throw new Error('O arquivo deve ser uma imagem válida (JPG, PNG, GIF, WebP, HEIC, etc.)');
  }

  // Validate file size (10MB limit for Cloudinary free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('A imagem deve ter no máximo 10MB');
  }

  /**
   * Internal function to handle upload with retry logic
   */
  const uploadWithRetry = async (attemptNumber = 1, maxRetries = 3): Promise<string> => {
    try {

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // Set up abort controller for timeout (30 seconds for mobile networks)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Make upload request
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na API de upload:', errorData);

        // Don't retry validation errors
        if (response.status === 400 && errorData.error?.includes('arquivo deve ser uma imagem')) {
          throw new Error(errorData.error);
        }
        if (response.status === 400 && errorData.error?.includes('10MB')) {
          throw new Error(errorData.error);
        }

        throw new Error(errorData.error || 'Erro no upload da imagem');
      }

      const result = await response.json();
      return result.url;

    } catch (error) {
      console.error(`Tentativa ${attemptNumber} falhou:`, error);

      // Don't retry validation errors
      if (error.message?.includes('O arquivo deve ser uma imagem') ||
          error.message?.includes('10MB')) {
        throw error;
      }

      // Retry on network errors
      if (attemptNumber < maxRetries &&
          (error.name === 'AbortError' || // Timeout
           error.name === 'TypeError' || // Network error
           !navigator.onLine)) { // Offline

        const retryDelay = attemptNumber * 2000; // Progressive delay
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadWithRetry(attemptNumber + 1, maxRetries);
      }

      // Provide user-friendly error messages
      if (error.name === 'AbortError') {
        throw new Error('Upload demorou demais. Verifique sua conexão e tente novamente.');
      }
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se você está online e tente novamente.');
      }
      if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
      }

      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  return uploadWithRetry();
}

/**
 * Generates an optimized Cloudinary image URL with custom transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 80, format = 'auto' } = options;

  // Build transformation parameters
  let transformations = `f_${format},q_${quality}`;

  if (width) {
    transformations += `,w_${width}`;
  }

  if (height) {
    transformations += `,h_${height}`;
  }

  // Get cloud name from environment
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME não configurado');
  }

  // Construct full URL
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/v1/${publicId}`;
}

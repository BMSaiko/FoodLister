

/**
 * Converts Cloudinary URLs to optimized format
 * Supports various Cloudinary URL formats
 */
export function convertCloudinaryUrl(url: string, options: { width?: number; height?: number; quality?: number } = {}): string {
  if (!url || typeof url !== 'string') return url;

  // If already a Cloudinary URL, apply transformations
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const { width, height, quality = 80 } = options;
    let transformations = `f_auto,q_${quality}`;

    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;

    // Replace the upload part with transformations
    return url.replace('/upload/', `/upload/${transformations}/`);
  }

  return url;
}

/**
 * Validates if URL is a Cloudinary URL
 */
export function isValidCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com');
}

/**
 * Extracts public ID from Cloudinary URL
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Validates if a file is an image based on MIME type or file extension
 * More permissive validation for mobile devices
 */
function isValidImageFile(file: File): boolean {
  // First check MIME type (most reliable)
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // Fallback to file extension for mobile devices that don't set MIME type correctly
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
  const fileName = file.name.toLowerCase();

  return validExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Uploads image to Cloudinary using server-side API
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido');
  }

  // Verifica se é uma imagem (more permissive validation)
  if (!isValidImageFile(file)) {
    throw new Error('O arquivo deve ser uma imagem válida (JPG, PNG, GIF, WebP, etc.)');
  }

  // Verifica o tamanho do arquivo (máximo 10MB para Cloudinary free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('A imagem deve ter no máximo 10MB');
  }

  try {
    console.log('Starting upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload API error:', errorData);
      throw new Error(errorData.error || 'Erro no upload da imagem');
    }

    const result = await response.json();
    console.log('Upload successful:', result.url);
    return result.url;
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    // Provide more specific error messages
    if (error.message.includes('O arquivo deve ser uma imagem')) {
      throw error; // Re-throw validation errors as-is
    }
    if (error.message.includes('10MB')) {
      throw error; // Re-throw size errors as-is
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
}

/**
 * Generates optimized image URL with transformations
 */
export function getOptimizedImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}): string {
  const { width, height, quality = 80, format = 'auto' } = options;

  let transformations = `f_${format},q_${quality}`;
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME não configurado');
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/v1/${publicId}`;
}

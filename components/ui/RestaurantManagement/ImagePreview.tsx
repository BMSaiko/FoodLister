import React, { useCallback } from 'react';
import { Image as ImageIcon, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { useImagePreview } from '@/hooks/useImagePreview';

/**
 * ImagePreview component for displaying and editing image URLs
 * Complete reimplementation from scratch
 */
export default function ImagePreview({
  imageUrl,
  onImageUrlChange,
  className = ''
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  className?: string;
}) {
  // Use custom hook for image preview state management
  const { preview, error, loading, progress, clearError, clearPreview } = useImagePreview(imageUrl ? new File([imageUrl], 'image') : null);

  /**
   * Handle URL input change
   */
  const handleUrlChange = useCallback((value: string) => {
    onImageUrlChange(value);
  }, [onImageUrlChange]);

  // Get processed URL for display (with Cloudinary optimizations)
  const processedUrl = imageUrl ? convertCloudinaryUrl(imageUrl) : '';

  return (
    <div className={`mb-6 ${className}`}>
      {/* Label */}
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <ImageIcon className="h-4 w-4 mr-2" />
        URL da Imagem
      </label>

      {/* URL Input Field */}
      <div className="relative">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white shadow-sm"
          placeholder="https://exemplo.com/imagem.jpg"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Upload className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">Dicas para imagens:</p>
            <p>• Deixe em branco para usar uma imagem padrão</p>
            <p className="text-primary font-medium flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aceita URLs do Cloudinary (ex: https://res.cloudinary.com/...)
            </p>
            <p>• Você também pode fazer upload direto de arquivos de imagem</p>
          </div>
        </div>
      </div>

      {/* Image Preview Section */}
      {imageUrl && (
        <div className="mt-4">
          {/* Preview Container */}
          <div className="relative">
            <div className="w-full h-48 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {/* Loading State */}
              {loading && (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-500">Carregando imagem...</p>
                  </div>
                </div>
              )}

              {/* Loaded State */}
              {!loading && preview && !error && (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img
                    src={processedUrl}
                    alt="Preview do restaurante"
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                      // Error handling is managed by the hook's internal logic
                      // The hook will automatically set error state when image fails to load
                    }}
                  />
                  {/* Preview Badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Preview
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Erro ao carregar imagem</p>
                      <p className="text-xs text-gray-500">Verifique se a URL é válida</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

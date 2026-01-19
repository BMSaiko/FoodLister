import React, { useCallback } from 'react';
import { Image as ImageIcon, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { convertCloudinaryUrl } from '../../utils/cloudinaryConverter';
import { useImagePreview } from '../../hooks/useImagePreview';

export default function ImagePreview({
  imageUrl,
  onImageUrlChange,
  className = ''
}) {
  const { previewState, handleImageError } = useImagePreview(imageUrl, convertCloudinaryUrl);

  const handleUrlChange = useCallback((value) => {
    onImageUrlChange(value);
  }, [onImageUrlChange]);

  // Get processed URL for display
  const processedUrl = imageUrl ? convertCloudinaryUrl(imageUrl) : '';

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <ImageIcon className="h-4 w-4 mr-2" />
        URL da Imagem
      </label>

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

      {/* Preview da imagem */}
      {imageUrl && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Preview da Imagem
            </h4>
            {previewState.isLoading && (
              <div className="flex items-center text-blue-600 text-xs">
                <Loader className="h-3 w-3 mr-1 animate-spin" />
                Carregando...
              </div>
            )}
            {previewState.isLoaded && !previewState.hasError && (
              <div className="flex items-center text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Carregada
              </div>
            )}
            {previewState.hasError && (
              <div className="flex items-center text-red-600 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Erro no carregamento
              </div>
            )}
          </div>

          <div className="relative group">
            <div className="w-full h-56 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {previewState.isLoading && (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-500">Carregando imagem...</p>
                  </div>
                </div>
              )}

              {!previewState.isLoading && previewState.isLoaded && !previewState.hasError && (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img
                    src={processedUrl}
                    alt="Preview do restaurante"
                    className="max-w-full max-h-full object-contain"
                    onError={handleImageError}
                  />
                </div>
              )}

              {previewState.hasError && !previewState.isLoading && (
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

            {/* Hover overlay for better interaction */}
            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}

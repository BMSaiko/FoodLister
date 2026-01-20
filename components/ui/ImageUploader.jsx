import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinaryConverter';

export default function ImageUploader({
  onImageUploaded,
  className = '',
  disabled = false
}) {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null,
    success: false
  });

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setUploadState({ isUploading: true, error: null, success: false });

    try {
      const imageUrl = await uploadToCloudinary(file);
      setUploadState({ isUploading: false, error: null, success: true });

      // Call the callback with the uploaded image URL
      onImageUploaded(imageUrl);

      // Reset success state after a delay
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        isUploading: false,
        error: error.message || 'Erro ao fazer upload da imagem',
        success: false
      });
    }
  }, [onImageUploaded]);

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Upload className="h-4 w-4 mr-2" />
        Upload de Imagem
      </label>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploadState.isUploading}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Upload Status */}
      {uploadState.isUploading && (
        <div className="mt-2 flex items-center text-blue-600 text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Fazendo upload da imagem...
        </div>
      )}

      {uploadState.success && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Imagem enviada com sucesso!
        </div>
      )}

      {uploadState.error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Erro no upload</p>
              <p className="text-sm text-red-700 mt-1">{uploadState.error}</p>
            </div>
            <button
              onClick={clearError}
              className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="h-3 w-3 text-red-500" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <p>• Formatos aceitos: JPG, PNG, GIF, WebP</p>
        <p>• Tamanho máximo: 10MB</p>
        <p>• A imagem será otimizada automaticamente</p>
      </div>
    </div>
  );
}

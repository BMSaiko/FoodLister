import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Loader, Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinaryConverter';

/**
 * ImageUploader component using react-dropzone with Cloudinary API
 * Complete reimplementation from scratch without Cloudinary widget
 */
export default function ImageUploader({
  onImageUploaded,
  className = '',
  disabled = false,
  maxFiles = 10
}) {
  // State for upload process
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null,
    success: false,
    uploadedUrl: null, // Temporary URL, not applied to form yet
    uploadProgress: null,
    multipleProgress: null // { current: number, total: number }
  });

  // Detect mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  /**
   * Handle file drop/upload
   */
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    console.log('📁 Files dropped:', acceptedFiles, 'Rejected:', rejectedFiles);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'Arquivo rejeitado';

      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        errorMessage = 'A imagem deve ter no máximo 10MB';
      } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        errorMessage = 'Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP, HEIC, etc.';
      } else {
        // Generic error for other rejection reasons
        errorMessage = rejection.errors[0]?.message || 'Arquivo rejeitado';
      }

      setUploadState({
        isUploading: false,
        error: errorMessage,
        success: false,
        uploadedUrl: null
      });
      return;
    }

    // Check if we have files
    if (acceptedFiles.length === 0) {
      return;
    }

    // Reset state and start multiple uploads
    setUploadState({
      isUploading: true,
      error: null,
      success: false,
      uploadedUrl: null,
      multipleProgress: { current: 0, total: acceptedFiles.length }
    });

    let uploadErrors = [];

    // Process files sequentially
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      console.log(`📤 Starting upload ${i + 1}/${acceptedFiles.length} for file:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });

      try {
        // Upload using our Cloudinary converter
        const uploadedUrl = await uploadToCloudinary(file);

        console.log(`✅ Upload ${i + 1}/${acceptedFiles.length} successful:`, uploadedUrl);

        // Apply URL to form immediately for each successful upload
        onImageUploaded(uploadedUrl);

        // Update progress
        setUploadState(prev => ({
          ...prev,
          multipleProgress: { current: i + 1, total: acceptedFiles.length }
        }));

      } catch (error) {
        console.error(`❌ Upload ${i + 1}/${acceptedFiles.length} failed:`, error);
        uploadErrors.push(`Imagem ${i + 1}: ${error.message || 'Erro no upload'}`);
      }
    }

    // Update final state
    if (uploadErrors.length === 0) {
      // All uploads successful
      setUploadState({
        isUploading: false,
        error: null,
        success: true,
        uploadedUrl: null,
        multipleProgress: null
      });

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({
          ...prev,
          success: false
        }));
      }, 3000);
    } else {
      // Some uploads failed
      setUploadState({
        isUploading: false,
        error: uploadErrors.join('; '),
        success: false,
        uploadedUrl: null,
        multipleProgress: null
      });
    }
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.heic', '.heif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    maxFiles: maxFiles,
    disabled: disabled || uploadState.isUploading,
    // Add camera support for mobile
    ...(isMobile && {
      // This helps mobile browsers prioritize camera
      capture: 'environment' // Use back camera by default
    })
  });

  /**
   * Clear error state
   */
  const clearError = () => {
    setUploadState(prev => ({
      ...prev,
      error: null
    }));
  };


  /**
   * Retry upload (clear error state)
   */
  const retryUpload = () => {
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
      uploadedUrl: null
    });
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Upload className="h-4 w-4 mr-2" />
        Upload de Imagem
      </label>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          w-full px-6 py-4 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10 scale-105' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}
          ${isMobile ? 'active:scale-95' : ''}
          ${disabled || uploadState.isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            {uploadState.isUploading ? (
              <Loader className="h-8 w-8 text-primary animate-spin" />
            ) : isMobile ? (
              <Camera className="h-8 w-8 text-gray-600" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-600" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            {uploadState.isUploading ? (
              <p className="text-lg font-medium text-primary">Fazendo upload...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Solte a imagem aqui' : isMobile ? 'Tirar Foto ou Selecionar' : 'Arraste uma imagem ou clique'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF, WebP, HEIC até 10MB (máximo {maxFiles} arquivos)
                </p>
                {isMobile && (
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    📱 Câmera integrada
                  </p>
                )}
                {!isMobile && (
                  <p className="text-xs text-gray-400 mt-2">
                    ou clique para selecionar
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadState.isUploading && uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-blue-600 text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Enviando {uploadState.multipleProgress.current} de {uploadState.multipleProgress.total} imagens...
        </div>
      )}

      {/* Upload Status - Single */}
      {uploadState.isUploading && !uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-blue-600 text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Fazendo upload da imagem...
        </div>
      )}

      {/* Success Message - Multiple */}
      {uploadState.success && uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          {uploadState.multipleProgress.total} imagens carregadas com sucesso! Os previews aparecerão abaixo.
        </div>
      )}

      {/* Success Message - Single */}
      {uploadState.success && uploadState.uploadedUrl && !uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Imagem carregada com sucesso! O preview aparecerá abaixo.
        </div>
      )}

      {/* Error State */}
      {uploadState.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Erro no upload</p>
              <p className="text-sm text-red-700 mt-1">{uploadState.error}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={retryUpload}
                className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                title="Tentar novamente"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={clearError}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="h-3 w-3 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
        <p>• Upload direto para Cloudinary via API</p>
        <p>• Suporte completo para desktop e mobile</p>
        <p>• Imagens otimizadas automaticamente</p>
      </div>
    </div>
  );
}

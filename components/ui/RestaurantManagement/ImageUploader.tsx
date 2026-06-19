import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Loader, Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { uploadToCloudinary } from '@/utils/cloudinaryConverter';

/**
 * ImageUploader component using react-dropzone with Cloudinary API
 * Complete reimplementation from scratch without Cloudinary widget
 */
export default function ImageUploader({
  onImageUploaded,
  className = '',
  disabled = false,
  maxFiles = 10
}: {
  onImageUploaded: (url: string) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}) {
  // State for upload process
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    error: string | null;
    success: boolean;
    uploadedUrl: string | null;
    uploadProgress: number | null;
    multipleProgress: { current: number; total: number } | null;
  }>({
    isUploading: false,
    error: null,
    success: false,
    uploadedUrl: null,
    uploadProgress: null,
    multipleProgress: null
  });

  // Detect mobile device - initialize as undefined to avoid SSR mismatch
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  // Detect mobile device only on client side to prevent hydration mismatch
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);

  /**
   * Handle file drop/upload
   */
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'Arquivo rejeitado';

      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        errorMessage = 'A imagem deve ter no máximo 10MB';
      } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        errorMessage = 'Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP, HEIC, etc.';
      } else {
        errorMessage = rejection.errors[0]?.message || 'Arquivo rejeitado';
      }

      setUploadState({
        isUploading: false,
        error: errorMessage,
        success: false,
        uploadedUrl: null,
        uploadProgress: null,
        multipleProgress: null
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
      uploadProgress: null,
      multipleProgress: { current: 0, total: acceptedFiles.length }
    });

    let uploadErrors: string[] = [];

    // Process files sequentially
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];

      try {
        const uploadedUrl = await uploadToCloudinary(file);
        onImageUploaded(uploadedUrl);

        setUploadState(prev => ({
          ...prev,
          multipleProgress: { current: i + 1, total: acceptedFiles.length }
        }));
      } catch (error) {
        console.error(`Upload ${i + 1}/${acceptedFiles.length} failed:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
        uploadErrors.push(`Imagem ${i + 1}: ${errorMessage}`);
      }
    }

    if (uploadErrors.length === 0) {
      setUploadState({
        isUploading: false,
        error: null,
        success: true,
        uploadedUrl: null,
        uploadProgress: null,
        multipleProgress: null
      });

      setTimeout(() => {
        setUploadState(prev => ({
          ...prev,
          success: false
        }));
      }, 3000);
    } else {
      setUploadState({
        isUploading: false,
        error: uploadErrors.join('; '),
        success: false,
        uploadedUrl: null,
        uploadProgress: null,
        multipleProgress: null
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.heic', '.heif']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    maxFiles: maxFiles,
    disabled: disabled || uploadState.isUploading,
    ...(isMobile === true ? { capture: 'environment' } : {})
  });

  const clearError = () => {
    setUploadState(prev => ({
      ...prev,
      error: null
    }));
  };

  const retryUpload = () => {
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
      uploadedUrl: null,
      uploadProgress: null,
      multipleProgress: null
    });
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center text-[var(--gray-700)] font-medium mb-3">
        <Upload className="h-4 w-4 mr-2" />
        Upload de Imagem
      </label>

      <div
        {...getRootProps()}
        className={`
          w-full px-6 py-4 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
          ${isDragActive ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.1)] scale-105' : 'border-[var(--gray-300)] hover:border-[var(--primary)] hover:bg-[rgba(var(--primary-rgb),0.05)]'}
          ${isMobile === true ? 'active:scale-95' : ''}
          ${disabled || uploadState.isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full bg-[var(--gray-100)]">
            {uploadState.isUploading ? (
              <Loader className="h-8 w-8 text-[var(--primary)] animate-spin" />
            ) : isMobile === true ? (
              <Camera className="h-8 w-8 text-[var(--gray-600)]" />
            ) : isMobile === false ? (
              <ImageIcon className="h-8 w-8 text-[var(--gray-600)]" />
            ) : (
              <ImageIcon className="h-8 w-8 text-[var(--gray-600)]" />
            )}
          </div>

          <div className="space-y-2">
            {uploadState.isUploading ? (
              <p className="text-lg font-medium text-[var(--primary)]">Fazendo upload...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-[var(--gray-700)]">
                  {isDragActive ? 'Solte a imagem aqui' : isMobile === true ? 'Tirar Foto ou Selecionar' : 'Arraste uma imagem ou clique'}
                </p>
                <p className="text-sm text-[var(--gray-500)]">
                  JPG, PNG, GIF, WebP, HEIC até 10MB (máximo {maxFiles} arquivos)
                </p>
                {isMobile === true && (
                  <p className="text-xs text-[var(--blue-600)] font-medium mt-2">
                    📱 Câmera integrada
                  </p>
                )}
                {isMobile === false && (
                  <p className="text-xs text-[var(--gray-400)] mt-2">
                    ou clique para selecionar
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {uploadState.isUploading && uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-[var(--blue-600)] text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Enviando {uploadState.multipleProgress.current} de {uploadState.multipleProgress.total} imagens...
        </div>
      )}

      {uploadState.isUploading && !uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-[var(--blue-600)] text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Fazendo upload da imagem...
        </div>
      )}

      {uploadState.success && uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-[var(--green-600)] text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          {uploadState.multipleProgress.total} imagens carregadas com sucesso! Os previews aparecerão abaixo.
        </div>
      )}

      {uploadState.success && uploadState.uploadedUrl && !uploadState.multipleProgress && (
        <div className="mt-3 flex items-center justify-center text-[var(--green-600)] text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Imagem carregada com sucesso! O preview aparecerá abaixo.
        </div>
      )}

      {uploadState.error && (
        <div className="mt-3 p-3 bg-[var(--red-50)] border border-[var(--red-100)] rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-[var(--red-500)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--red-800)]">Erro no upload</p>
              <p className="text-sm text-[var(--red-700)] mt-1">{uploadState.error}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={retryUpload}
                className="flex-shrink-0 p-1 hover:bg-[var(--blue-100)] rounded transition-colors text-[var(--blue-600)]"
                title="Tentar novamente"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={clearError}
                className="flex-shrink-0 p-1 hover:bg-[var(--red-100)] rounded transition-colors"
              >
                <X className="h-3 w-3 text-[var(--red-500)]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-[var(--gray-500)] text-center space-y-1">
        <p>• Upload direto para Cloudinary via API</p>
        <p>• Suporte completo para desktop e mobile</p>
        <p>• Imagens otimizadas automaticamente</p>
      </div>
    </div>
  );
}
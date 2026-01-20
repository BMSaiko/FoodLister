import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Loader, Camera, Image as ImageIcon } from 'lucide-react';
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

  // Detect mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Development helpers
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.testMobileUpload = async () => {
      console.log('🧪 Testing mobile upload simulation...');

      // Create a tiny 1x1 transparent PNG that mimics mobile camera image (no MIME type)
      const tinyPNGBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const imageBlob = await fetch(`data:image/png;base64,${tinyPNGBase64}`).then(r => r.blob());

      // Create a test file that mimics mobile behavior (no MIME type)
      const testFile = new File([imageBlob], 'mobile_camera_image.jpg', { type: '' });
      console.log('Test file created (simulating mobile camera):', {
        name: testFile.name,
        type: testFile.type,
        size: testFile.size
      });

      try {
        const { uploadToCloudinary } = await import('../../utils/cloudinaryConverter');
        const result = await uploadToCloudinary(testFile);
        console.log('✅ Mobile upload test successful:', result);
        return result;
      } catch (error) {
        console.error('❌ Mobile upload test failed:', error.message);
        throw error;
      }
    };

    window.testFileValidation = (fileName, mimeType = '') => {
      const isValid = mimeType.startsWith('image/') ||
        ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg']
        .some(ext => fileName.toLowerCase().endsWith(ext));

      console.log(`📁 Teste de validação: ${fileName} (${mimeType || 'sem MIME type'})`);
      console.log(`✅ Resultado: ${isValid ? 'APROVADO' : 'REJEITADO'}`);
      return isValid;
    };

    window.testValidationOnly = () => {
      console.log('🧪 Testando validação de arquivos móveis...\n');

      const testCases = [
        { name: 'camera_mobile.jpg', type: '', expected: true },
        { name: 'photo.png', type: '', expected: true },
        { name: 'normal.jpg', type: 'image/jpeg', expected: true },
        { name: 'document.pdf', type: '', expected: false },
      ];

      let passed = 0;
      testCases.forEach((testCase, index) => {
        console.log(`${index + 1}. Testando: ${testCase.name}`);
        const result = window.testFileValidation(testCase.name, testCase.type);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} Resultado: ${result}\n`);
        if (result === testCase.expected) passed++;
      });

      console.log(`📊 ${passed}/${testCases.length} testes passaram`);
      return { passed, total: testCases.length, success: passed === testCases.length };
    };
  }

  // Configure dropzone with device-specific settings
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: disabled || uploadState.isUploading,
    // Device-specific options
    noClick: false, // Allow click/touch on all devices
    noKeyboard: true, // Disable keyboard on all devices (not useful for images)
    noDrag: isMobile, // Disable drag only on mobile (touch conflicts)
    onDrop: useCallback(async (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        let errorMessage = 'Arquivo não suportado';

        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          errorMessage = 'A imagem deve ter no máximo 10MB';
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          errorMessage = 'O arquivo deve ser uma imagem válida (JPG, PNG, GIF, WebP, etc.)';
        }

        setUploadState({
          isUploading: false,
          error: errorMessage,
          success: false
        });
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      console.log('📱 File selected via dropzone:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isMobile,
        userAgent: navigator.userAgent
      });

      // Reset previous state
      setUploadState({ isUploading: true, error: null, success: false });

      try {
        // For mobile devices, ensure proper MIME type
        let processedFile = file;

        // If file has no type but looks like an image (mobile issue)
        if (!file.type && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
          console.log('🔧 Processing mobile file without MIME type...');

          // Create a new file with explicit MIME type
          const mimeType = file.name.toLowerCase().endsWith('.png') ? 'image/png' :
                          file.name.toLowerCase().endsWith('.gif') ? 'image/gif' :
                          file.name.toLowerCase().endsWith('.webp') ? 'image/webp' :
                          'image/jpeg';

          // Convert to proper blob with MIME type
          processedFile = new File([file], file.name, {
            type: mimeType,
            lastModified: file.lastModified
          });

          console.log('✅ File processed:', {
            originalType: file.type,
            newType: processedFile.type,
            name: processedFile.name
          });
        }

        const imageUrl = await uploadToCloudinary(processedFile);
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
    }, [onImageUploaded, isMobile])
  });

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Upload className="h-4 w-4 mr-2" />
        Upload de Imagem
      </label>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${isMobile ? 'cursor-pointer active:scale-95' : 'cursor-pointer'}
          ${isDragActive && !isDragReject
            ? 'border-primary bg-primary/5 scale-105'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${disabled || uploadState.isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            {isMobile ? (
              <Camera className="h-8 w-8 text-gray-600" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-600" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive && !isDragReject
                ? 'Solte a imagem aqui'
                : isDragReject
                ? 'Arquivo não suportado'
                : isMobile
                ? 'Toque para selecionar imagem'
                : 'Arraste uma imagem ou clique para selecionar'
              }
            </p>

            <p className="text-sm text-gray-500">
              JPG, PNG, GIF, WebP até 10MB
            </p>

            {isMobile && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-blue-600 font-medium">
                  👆 Toque aqui para abrir câmera ou galeria
                </p>
                <p className="text-xs text-gray-400">
                  Suporte otimizado para dispositivos móveis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadState.isUploading && (
        <div className="mt-3 flex items-center justify-center text-blue-600 text-sm">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Fazendo upload da imagem...
        </div>
      )}

      {uploadState.success && (
        <div className="mt-3 flex items-center justify-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Imagem enviada com sucesso!
        </div>
      )}

      {uploadState.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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

      <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
        <p>• Formatos aceitos: JPG, PNG, GIF, WebP</p>
        <p>• Tamanho máximo: 10MB</p>
        <p>• Imagem será otimizada automaticamente</p>
        {isMobile && <p>• Compatibilidade total com câmera e galeria</p>}
      </div>
    </div>
  );
}

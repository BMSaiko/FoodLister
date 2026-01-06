// components/ui/GoogleMapsModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { extractGoogleMapsData, isValidGoogleMapsUrl, GoogleMapsData } from '@/utils/googleMapsExtractor';

interface GoogleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoogleMapsData) => void;
}

export default function GoogleMapsModal({ isOpen, onClose, onSubmit }: GoogleMapsModalProps) {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<GoogleMapsData | null>(null);

  const handleExtract = () => {
    setError('');
    setExtractedData(null);

    if (!googleMapsUrl.trim()) {
      setError('Por favor, insira uma URL do Google Maps');
      return;
    }

    if (!isValidGoogleMapsUrl(googleMapsUrl)) {
      setError('URL inválida. Por favor, insira um link válido do Google Maps');
      return;
    }

    setLoading(true);
    try {
      const data = extractGoogleMapsData(googleMapsUrl);
      setExtractedData(data);
      
      if (!data.name && !data.address && !data.latitude) {
        setError('Não foi possível extrair informações do link. Verifique se é um link válido do Google Maps.');
      }
    } catch (err) {
      setError('Erro ao processar o link do Google Maps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onSubmit(extractedData);
      resetModal();
    }
  };

  const resetModal = () => {
    setGoogleMapsUrl('');
    setError('');
    setExtractedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Adicionar do Google Maps</h2>
          <button
            onClick={resetModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!extractedData ? (
            <>
              {/* Input URL */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Cola o link do Google Maps
                </label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => {
                    setGoogleMapsUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="https://www.google.com/maps/place/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Abre o Google Maps, encontra o restaurante e copia o link do navegador
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={loading || !googleMapsUrl.trim()}
                className="w-full px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-gray-300 flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  'Extrair Informações'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Extracted Data Display */}
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm font-medium text-green-800 mb-3">
                    ✓ Informações extraídas com sucesso!
                  </p>

                  {extractedData.name && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <p className="text-sm bg-white p-2 rounded border border-gray-200">
                        {extractedData.name}
                      </p>
                    </div>
                  )}

                  {extractedData.address && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <p className="text-sm bg-white p-2 rounded border border-gray-200 break-words">
                        {extractedData.address}
                      </p>
                    </div>
                  )}

                  {extractedData.latitude && extractedData.longitude && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Coordenadas
                      </label>
                      <p className="text-sm bg-white p-2 rounded border border-gray-200 font-mono">
                        {extractedData.latitude}, {extractedData.longitude}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm border border-yellow-200">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setExtractedData(null);
                    setGoogleMapsUrl('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Tentar Outro Link
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                >
                  Confirmar e Usar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

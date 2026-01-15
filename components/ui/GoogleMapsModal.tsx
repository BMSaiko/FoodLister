// components/ui/GoogleMapsModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Loader, MapPin, Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Map, Search, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Importar do Google Maps</h2>
                <p className="text-amber-100 text-sm">Extraia informações automaticamente</p>
              </div>
            </div>
            <button
              onClick={resetModal}
              className="text-amber-100 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!extractedData ? (
            <>
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-100 rounded-lg flex-shrink-0">
                    <Search className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Como fazer:</h3>
                    <ol className="text-sm text-amber-800 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                        Abra o Google Maps no navegador
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                        Encontre e clique no restaurante
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                        Copie o link da barra de endereço
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                        Cole aqui e clique em "Extrair"
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Input URL */}
              <div className="mb-6">
                <label className="block text-gray-800 font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-600" />
                  Link do Google Maps
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => {
                      setGoogleMapsUrl(e.target.value);
                      setError('');
                    }}
                    placeholder="https://www.google.com/maps/place/Nome+do+Restaurante/..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors text-gray-700"
                  />
                  {googleMapsUrl && (
                    <button
                      onClick={() => navigator.clipboard.readText().then(text => setGoogleMapsUrl(text))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Colar do clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Cole o link completo do restaurante no Google Maps
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Erro na extração</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={loading || !googleMapsUrl.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Extraindo informações...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Extrair Informações
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informações extraídas!</h3>
                <p className="text-gray-600">Revise os dados antes de confirmar</p>
              </div>

              {/* Extracted Data Display */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-800">Dados extraídos com sucesso</p>
                  </div>

                  {extractedData.name && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Nome do Restaurante
                      </label>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 font-medium">{extractedData.name}</p>
                      </div>
                    </div>
                  )}

                  {extractedData.address && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Endereço
                      </label>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 text-sm break-words">{extractedData.address}</p>
                      </div>
                    </div>
                  )}

                  {extractedData.latitude && extractedData.longitude && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Coordenadas GPS
                      </label>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 text-sm font-mono">
                          {extractedData.latitude}, {extractedData.longitude}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Aviso</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
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
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
                >
                  Tentar outro link
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Usar estas informações
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

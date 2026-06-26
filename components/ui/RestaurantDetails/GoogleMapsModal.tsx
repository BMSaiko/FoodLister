// components/ui/GoogleMapsModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Loader, MapPin, Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Map, Search, Zap, MapPinHouse, Navigation, User } from 'lucide-react';
import { extractGoogleMapsData, isValidGoogleMapsUrl, GoogleMapsData, OSMService } from '@/utils/googleMapsExtractor';
import { useAuth } from '@/contexts';
import Modal from '@/components/ui/Modal';

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
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmAddress, setOsmAddress] = useState<string | null>(null);

  const handleExtract = async () => {
    setError('');
    setExtractedData(null);
    setOsmAddress(null);

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
      let urlToExtract = googleMapsUrl;
      
      // Check if it's a short URL that needs resolution
      const urlObj = new URL(googleMapsUrl);
      const isShortUrl = urlObj.hostname === 'maps.app.goo.gl' || 
                         urlObj.hostname === 'goo.gl';
      
      if (isShortUrl) {
        // Resolve short URL via server-side API
        const resolveResponse = await fetch(
          `/api/resolve-google-maps-url?url=${encodeURIComponent(googleMapsUrl)}`
        );
        
        if (!resolveResponse.ok) {
          const errorData = await resolveResponse.json();
          throw new Error(errorData.error || 'Falha ao resolver o link curto');
        }
        
        const { finalUrl } = await resolveResponse.json();
        urlToExtract = finalUrl;
      }
      
      const data = extractGoogleMapsData(urlToExtract);
      setExtractedData(data);

      // Se extrair coordenadas, buscar endereço via OSM
      if (data.latitude && data.longitude) {
        setOsmLoading(true);
        try {
          const address = await OSMService.getStreetAddress(data.latitude, data.longitude);
          setOsmAddress(address);
          if (address && !data.address) {
            // Atualiza os dados com o endereço do OSM
            setExtractedData(prev => ({
              ...prev!,
              address: address,
              location: address
            }));
          }
        } catch (osmError) {
          console.error('Erro ao buscar endereço via OSM:', osmError);
        } finally {
          setOsmLoading(false);
        }
      }

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
    setOsmAddress(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetModal} size="lg" ariaLabel="Importar do Google Maps">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Importar do Google Maps</h2>
                <p className="text-amber-200 text-sm">Extraia informações automaticamente</p>
              </div>
            </div>
            <button
              onClick={resetModal}
              className="text-amber-200 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
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
              <div className="bg-amber-500/[0.08] border border-[var(--amber-200)] rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-[var(--amber-100)] rounded-lg flex-shrink-0">
                    <Search className="h-4 w-4 text-[var(--amber-600)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--amber-900)] mb-2">Como fazer:</h3>
                    <ol className="text-sm text-[var(--amber-800)] space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[var(--amber-600)] text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                        Abra o Google Maps no navegador ou app móvel
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[var(--amber-600)] text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                        Encontre e selecione o restaurante
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[var(--amber-600)] text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                        Partilhe ou copie o link (suporta links curtos de mobile)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[var(--amber-600)] text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                        Cole aqui e clique em "Extrair"
                      </li>
                    </ol>
                    <p className="text-xs text-[var(--amber-700)] mt-2 flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      Aceita links completos (google.com/maps) e links curtos (maps.app.goo.gl)
                    </p>
                  </div>
                </div>
              </div>

              {/* Input URL */}
              <div className="mb-6">
                <label className="block text-white/80 font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--amber-600)]" />
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
                    placeholder="Link do Google Maps (ex: google.com/maps ou maps.app.goo.gl/...)"
                    className="w-full px-4 py-3 pr-12 border-2 border-white/[0.08] rounded-xl focus:outline-none focus:border-[var(--amber-500)] focus:ring-2 focus:ring-[var(--amber-100)] transition-colors text-white/60"
                  />
                  {googleMapsUrl && (
                    <button
                      onClick={() => {
                        if (!navigator.clipboard || !navigator.clipboard.readText) {
                          setError('Recurso de clipboard não disponível neste navegador ou contexto não seguro.');
                          return;
                        }
                        navigator.clipboard.readText().then(text => setGoogleMapsUrl(text)).catch(err => {
                          console.error('Erro ao acessar clipboard:', { message: err.message, name: err.name });
                          setError('Não foi possível acessar o clipboard. Verifique as permissões do navegador.');
                        });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/40"
                      title="Colar do clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
                  <p className="text-xs text-white/50 mt-2 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Cole o link do restaurante (completo ou curto)
                  </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/[0.08] border border-[var(--red-200)] text-[var(--red-700)] p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[var(--red-500)] flex-shrink-0 mt-0.5" />
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
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-[var(--amber-600)] hover:to-[var(--amber-700)] disabled:from-[var(--gray-400)] disabled:to-[var(--gray-500)] disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold transition-all shadow-md hover:shadow-lg"
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/[0.12] rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-[var(--green-600)]" />
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-2">Informações extraídas!</h3>
                <p className="text-white/40">Revise os dados antes de confirmar</p>
              </div>

              {/* Extracted Data Display */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-[var(--green-50)] to-[var(--emerald-50)] border border-[var(--green-200)] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-[var(--green-600)]" />
                    <p className="font-semibold text-green-400">Dados extraídos com sucesso</p>
                  </div>

                  {extractedData.name && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/50" />
                        Nome do Restaurante
                      </label>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                        <p className="text-white/90 font-medium">{extractedData.name}</p>
                      </div>
                    </div>
                  )}

                  {extractedData.latitude && extractedData.longitude && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-[var(--blue-500)]" />
                        Coordenadas GPS
                      </label>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                        <p className="text-white/90 text-sm font-mono">
                          {extractedData.latitude.toFixed(6)}, {extractedData.longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-white/50 mt-1">Latitude, Longitude</p>
                      </div>
                    </div>
                  )}

                  {osmLoading && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <MapPinHouse className="h-4 w-4 text-[var(--purple-500)]" />
                        Buscando endereço via OpenStreetMap...
                      </label>
                      <div className="bg-purple-500/[0.08] border border-[var(--purple-200)] rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin text-[var(--purple-600)]" />
                          <span className="text-sm text-[var(--purple-700)]">Buscando endereço...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {osmAddress && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <MapPinHouse className="h-4 w-4 text-[var(--purple-500)]" />
                        Endereço Detalhado (OpenStreetMap)
                      </label>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                        <p className="text-white/90 text-sm">{osmAddress}</p>
                        <p className="text-xs text-white/50 mt-1">Rua, número, bairro, cidade, código postal, estado, país</p>
                      </div>
                    </div>
                  )}

                  {extractedData.address && !osmAddress && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/50" />
                        Endereço (Google Maps)
                      </label>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                        <p className="text-white/90 text-sm break-words">{extractedData.address}</p>
                      </div>
                    </div>
                  )}

                </div>

                {error && (
                  <div className="bg-yellow-500/[0.08] border border-[var(--yellow-200)] text-[var(--yellow-800)] p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[var(--yellow-600)] flex-shrink-0 mt-0.5" />
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
                    setOsmAddress(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-white/[0.08] text-white/60 rounded-xl hover:bg-white/[0.03] hover:border-white/10 font-medium transition-all"
                >
                  Tentar outro link
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Usar estas informações
                </button>
              </div>
            </>
          )}
        </div>
    </Modal>
  );
}
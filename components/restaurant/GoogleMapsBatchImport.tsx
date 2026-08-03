// components/restaurant/GoogleMapsBatchImport.tsx
"use client";

import React, { useState, useCallback } from "react";
import { X, Loader, MapPin, Upload, FileText, Code, CheckCircle, AlertCircle, ArrowRight, Info } from "lucide-react";
import { extractBatch, parseUrlInput, BatchExtractionResult } from "@/utils/googleMapsBatchExtractor";
import { isValidGoogleMapsUrl } from "@/utils/googleMapsExtractor";
import Modal from "@/components/ui/Modal";
import { BatchImportProgress } from "./BatchImportProgress";

interface GoogleMapsBatchImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

type InputTab = "urls" | "csv" | "json";

export default function GoogleMapsBatchImport({
  isOpen,
  onClose,
  onImportComplete,
}: GoogleMapsBatchImportProps) {
  const [activeTab, setActiveTab] = useState<InputTab>("urls");
  const [rawInput, setRawInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractResults, setExtractResults] = useState<BatchExtractionResult[] | null>(null);
  const [showPostImportPrompt, setShowPostImportPrompt] = useState(false);
  const [importResults, setImportResults] = useState<
    Array<{ name: string; status: "created" | "failed"; id?: string; error?: string }> | null
  >(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const handleParse = useCallback(() => {
    setError("");
    setExtractResults(null);
    setImportResults(null);

    let urls: string[];

    if (activeTab === "urls") {
      urls = parseUrlInput(rawInput);
    } else if (activeTab === "csv") {
      urls = parseUrlInput(fileContent);
    } else {
      urls = parseUrlInput(fileContent);
    }

    if (urls.length === 0) {
      setError("Nenhuma URL válida encontrada. Cole URLs do Google Maps (uma por linha).");
      return;
    }

    if (urls.length > 50) {
      setError(`Limite de 50 URLs excedido. Recebidas: ${urls.length}.`);
      return;
    }

    setLoading(true);
    extractBatch(urls).then((results) => {
      setExtractResults(results);
      setLoading(false);
    });
  }, [rawInput, fileContent, activeTab]);

  const handleImport = useCallback(async () => {
    if (!extractResults) return;

    const readyUrls = extractResults
      .filter((r) => r.status === "ready")
      .map((r) => r.data);

    if (readyUrls.length === 0) {
      setError("Nenhum restaurante pronto para importar.");
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const res = await fetch("/api/restaurants/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurants: readyUrls }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao importar");
      }

      const data = await res.json();
      setImportResults(data.results);
      setShowPostImportPrompt(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Erro ao importar: ${msg}`);
    } finally {
      setImporting(false);
    }
  }, [extractResults, onImportComplete]);

  const handleReset = () => {
    setRawInput("");
    setFileContent("");
    setExtractResults(null);
    setImportResults(null);
    setError("");
    setLoading(false);
    setImporting(false);
  };

  const readyCount = extractResults?.filter((r) => r.status === "ready").length ?? 0;
  const errorCount = extractResults?.filter((r) => r.status === "error").length ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" ariaLabel="Importar restaurantes do Google Maps">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white/80">
            Importar do Google Maps
          </h2>
          <div className="relative group">
            <button
              type="button"
              className="w-5 h-5 rounded-full bg-white/[0.06] text-white/40 hover:text-white/80 hover:bg-white/[0.1] flex items-center justify-center text-xs font-bold transition-colors"
              aria-label="Ajuda"
            >
              ?
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[var(--card-bg)] border border-white/[0.08] rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-white/60 leading-relaxed">
              <p className="font-medium text-white/80 mb-2">Como usar</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cole URLs do Google Maps, uma por linha</li>
                <li>Ou faça upload de um ficheiro CSV/JSON</li>
                <li>Limite de 50 URLs por importação</li>
                <li>Shortlinks (goo.gl) são resolvidos automaticamente</li>
                <li>Coordenadas são obtidas via Nominatim (1 req/s)</li>
                <li>Duplicados são detetados e marcados</li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/60 p-1 rounded-md hover:bg-white/[0.04] transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Input Tab Switcher */}
        <div className="flex gap-2 mb-4">
          {(["urls", "csv", "json"] as InputTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExtractResults(null);
                setImportResults(null);
                setError("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[var(--primary)] text-black"
                  : "bg-white/[0.04] text-white/50 hover:text-white/80"
              }`}
            >
              {tab === "urls" && (
                <>
                  <FileText className="h-4 w-4 inline mr-1.5" />
                  URLs
                </>
              )}
              {tab === "csv" && (
                <>
                  <Upload className="h-4 w-4 inline mr-1.5" />
                  CSV
                </>
              )}
              {tab === "json" && (
                <>
                  <Code className="h-4 w-4 inline mr-1.5" />
                  JSON
                </>
              )}
            </button>
          ))}
        </div>

        {/* Input Area */}
        {activeTab === "urls" ? (
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Cole URLs do Google Maps, uma por linha&#10;Ex: https://www.google.com/maps/place/Restaurante/@41.15,-8.62"
            className="w-full h-40 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        ) : (
          <div className="space-y-3">
            <label className="block text-sm text-white/50">
              {activeTab === "csv"
                ? "Upload de ficheiro CSV (coluna com URLs)"
                : "Upload de ficheiro JSON (array de URLs)"}
            </label>
            <input
              type="file"
              accept={activeTab === "csv" ? ".csv" : ".json"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setFileContent(ev.target?.result as string);
                };
                reader.readAsText(file);
              }}
              className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-[var(--primary)] file:text-black file:text-sm file:font-medium file:hover:bg-[var(--primary-hover)]"
            />
            {fileContent && (
              <pre className="bg-white/[0.03] rounded-xl p-3 text-xs text-white/40 max-h-32 overflow-auto">
                {fileContent.slice(0, 500)}
                {fileContent.length > 500 ? "..." : ""}
              </pre>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Extract Button */}
        {!extractResults && !importResults && (
          <button
            onClick={handleParse}
            disabled={loading || (!rawInput && !fileContent)}
            className="mt-4 px-6 py-2.5 bg-[var(--primary)] text-black rounded-full font-medium text-sm hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                A extrair...
              </span>
            ) : (
              "Extrair dados"
            )}
          </button>
        )}

        {/* Extraction Results */}
        {extractResults && !importResults && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">
                {readyCount} pronto(s) para importar
                {errorCount > 0 && ` · ${errorCount} com erro`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || readyCount === 0}
                  className="px-6 py-2 bg-[var(--primary)] text-black rounded-full font-medium text-sm hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40"
                >
                  Importar {readyCount} restaurante(s)
                </button>
              </div>
            </div>

            {/* Preview table */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2 text-white/40 font-medium">Nome</th>
                    <th className="text-left px-4 py-2 text-white/40 font-medium">Endereço</th>
                    <th className="text-left px-4 py-2 text-white/40 font-medium">Coords</th>
                    <th className="text-left px-4 py-2 text-white/40 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {extractResults.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2 text-white/80 max-w-[200px] truncate">
                        {result.data.name || result.data.address || "—"}
                      </td>
                      <td className="px-4 py-2 text-white/40 max-w-[200px] truncate">
                        {result.data.address || result.data.location || "—"}
                      </td>
                      <td className="px-4 py-2 text-white/40">
                        {result.data.latitude
                          ? `${result.data.latitude.toFixed(4)}, ${result.data.longitude?.toFixed(4)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {result.status === "ready" ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Pronto
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Erro
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {importing && (
          <div className="mt-4">
            <BatchImportProgress results={null} importing />
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="mt-4">
            <BatchImportProgress
              results={importResults}
              importing={false}
            />
          </div>
        )}

        {/* Post-import prompt */}
        {showPostImportPrompt && (
          <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
            <p className="text-sm text-white/70 mb-3">
              Importação concluída! Escolha um restaurante para editar:
            </p>
            <div className="space-y-2 max-h-48 overflow-auto mb-3">
              {(importResults ?? []).map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-white/70 truncate max-w-[200px]">
                    {result.name}
                  </span>
                  {result.status === "created" && result.id ? (
                    <a
                      href={`/restaurants/${result.id}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium no-underline hover:bg-emerald-500/30"
                    >
                      Abrir para editar
                    </a>
                  ) : (
                    <span className="text-xs text-red-400">Falhou</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowPostImportPrompt(false);
                  onImportComplete(
                    importResults?.filter((r) => r.status === "created").length ?? 0
                  );
                }}
                className="px-5 py-2 bg-white/[0.06] border border-white/[0.08] rounded-full text-sm text-white/70 hover:text-white/90 hover:bg-white/[0.1] transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// components/restaurant/BatchImportProgress.tsx
"use client";

import React from "react";
import { CheckCircle, XCircle, Loader, AlertCircle } from "lucide-react";

interface BatchImportProgressProps {
  results?: Array<{
    name: string;
    status: "created" | "failed" | "duplicate";
    id?: string;
    error?: string;
  }> | null;
  importing: boolean;
  /** Current/total progress while chunked import is running (optional). */
  progress?: { current: number; total: number };
}

export function BatchImportProgress({
  results,
  importing,
  progress,
}: BatchImportProgressProps) {
  if (importing && !results) {
    return (
      <div className="mt-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Loader className="h-5 w-5 animate-spin text-[var(--primary)]" />
          <span className="text-sm text-white/60">A importar restaurantes...</span>
        </div>
        {progress && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((progress.current / Math.max(progress.total,1)) * 100)}%` }}
              />
            </div>
            <span className="text-sm text-white/50 whitespace-nowrap tabular-nums">
              {Math.min(progress.current + 1, progress.total)}/{progress.total}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!results) return null;

  const created = results.filter((r) => r.status === "created").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const duplicates = results.filter((r) => r.status === "duplicate").length;
  const total = results.length;
  const pct = total > 0 ? Math.round((created / total) * 100) : 0;

  return (
    <div className="mt-4 space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-white/50 whitespace-nowrap">
          {created}/{total} ({pct}%)
        </span>
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-emerald-400 flex items-center gap-1">
          <CheckCircle className="h-4 w-4" /> {created} criado(s)
        </span>
        {duplicates > 0 && (
          <span className="text-amber-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {duplicates} já existente(s) ignorado(s)
          </span>
        )}
        {failed > 0 && (
          <span className="text-red-400 flex items-center gap-1">
            <XCircle className="h-4 w-4" /> {failed} falhado(s)
          </span>
        )}
      </div>

      {/* Per-row results */}
      {results.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-auto max-h-48">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-2 text-white/40 font-medium">
                  Restaurante
                </th>
                <th className="text-left px-4 py-2 text-white/40 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={idx}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2 text-white/80 max-w-[200px] truncate">
                    {result.name}
                  </td>
                  <td className="px-4 py-2">
                    {result.status === "created" ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Criado
                      </span>
                    ) : result.status === "duplicate" ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {result.error || "Já existe na app"}
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {result.error || "Falhou"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

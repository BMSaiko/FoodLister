"use client";

import React, { useState } from "react";
import { FileJson, FileSpreadsheet, FileText, Download, Check } from "lucide-react";
import { exportListAsJSON, exportListAsCSV, exportListAsPDF } from "@/utils/listExport";

interface ListExportButtonsProps {
  list: { id: string; name: string; description?: string };
  restaurants: any[];
}

export default function ListExportButtons({ list, restaurants }: ListExportButtonsProps) {
  const [exported, setExported] = useState<string | null>(null);

  const handleExport = (format: "json" | "csv" | "pdf", exportFn: (l: any, r: any[]) => void) => {
    try {
      exportFn(list, restaurants);
      setExported(format);
      setTimeout(() => setExported(null), 2000);
    } catch (error) {
      console.error(`Erro ao exportar ${format}:`, error);
    }
  };

  const handleApiDownload = (format: "json" | "csv" | "html") => {
    window.open(`/api/lists/${list.id}/export?format=${format}`, "_blank");
  };

  const buttons = [
    { format: "json" as const, icon: FileJson, label: "JSON", color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20", action: () => handleExport("json", exportListAsJSON) },
    { format: "csv" as const, icon: FileSpreadsheet, label: "CSV", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20", action: () => handleExport("csv", exportListAsCSV) },
    { format: "pdf" as const, icon: FileText, label: "PDF", color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20", action: () => handleExport("pdf", exportListAsPDF) },
  ];

  const apiButtons = [
    { format: "json" as const, label: "API JSON", action: () => handleApiDownload("json") },
    { format: "csv" as const, label: "API CSV", action: () => handleApiDownload("csv") },
    { format: "html" as const, label: "API HTML", action: () => handleApiDownload("html") },
  ];

  return (
    <div className="space-y-4">
      {/* Client-side exports */}
      <div>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Exportar localmente</span>
        <div className="flex flex-wrap gap-2">
          {buttons.map(b => (
            <button
              key={b.format}
              onClick={b.action}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 min-h-[44px] hover:scale-105 ${b.color} ${exported === b.format ? "ring-2 ring-offset-1 ring-offset-[#050505]" : ""}`}
              title={`Exportar como ${b.label}`}
            >
              {exported === b.format ? <Check className="h-4 w-4" /> : <b.icon className="h-4 w-4" />}
              <span>{exported === b.format ? "Exportado!" : b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Server-side API downloads */}
      <div>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Download via API</span>
        <div className="flex flex-wrap gap-2">
          {apiButtons.map(b => (
            <button
              key={b.format}
              onClick={b.action}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/[0.06] text-white/55 hover:bg-white/[0.08] hover:text-white/75 transition-all duration-200 min-h-[44px] hover:scale-105"
              title={`Download ${b.label} via API`}
            >
              <Download className="h-4 w-4" />
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

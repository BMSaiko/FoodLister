"use client";

import React from 'react';
import { FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { exportListAsJSON, exportListAsCSV, exportListAsPDF } from '@/utils/listExport';

interface ListExportButtonsProps {
  list: { id: string; name: string; description?: string };
  restaurants: any[];
}

export default function ListExportButtons({ list, restaurants }: ListExportButtonsProps) {
  const handleExport = (
    format: 'json' | 'csv' | 'pdf',
    exportFn: (list: any, restaurants: any[]) => void
  ) => {
    try {
      exportFn(list, restaurants);
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => handleExport('json', exportListAsJSON)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        title="Exportar como JSON"
      >
        <FileJson className="h-4 w-4" />
        <span className="hidden sm:inline">JSON</span>
      </button>

      <button
        type="button"
        onClick={() => handleExport('csv', exportListAsCSV)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        title="Exportar como CSV"
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">CSV</span>
      </button>

      <button
        type="button"
        onClick={() => handleExport('pdf', exportListAsPDF)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        title="Exportar como PDF"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
}
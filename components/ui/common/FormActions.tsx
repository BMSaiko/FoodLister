import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  loading?: boolean;
  cancelText?: string;
}

export default function FormActions({
  onCancel,
  onSubmit,
  submitText,
  loading = false,
  cancelText = "Cancelar"
}: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
      >
        <span className="hidden sm:inline">{cancelText}</span>
        <span className="sm:hidden">X</span>
      </button>
      
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="hidden sm:inline">Salvando...</span>
          </div>
        ) : (
          <>
            <span className="hidden sm:inline">{submitText}</span>
          </>
        )}
      </button>
    </div>
  );
}
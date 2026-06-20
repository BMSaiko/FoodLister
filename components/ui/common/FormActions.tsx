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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-500 p-4 flex gap-3 z-[9999] shadow-lg max-md:flex-row md:fixed md:bottom-4 md:right-4 md:left-auto md:w-auto md:rounded-xl md:border md:shadow-xl md:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 md:flex-none px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium min-h-[44px]"
      >
        <span className="hidden sm:inline">{cancelText}</span>
        <span className="sm:hidden">X</span>
      </button>
       
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        aria-busy={loading}
        className="flex-1 md:flex-none px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium min-h-[44px]"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="hidden sm:inline">Salvando...</span>
          </div>
        ) : (
          <>
            <span className="hidden sm:inline">{submitText}</span>
            <span className="sm:hidden text-sm">{submitText}</span>
          </>
        )}
      </button>
    </div>
  );
}

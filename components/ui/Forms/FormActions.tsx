import React from 'react';

export default function FormActions({
  onCancel,
  onSubmit,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  loading = false,
  disabled = false,
  className = ''
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium order-2 sm:order-1"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || disabled}
        className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md order-1 sm:order-2"
      >
        {loading ? 'Salvando...' : submitText}
      </button>
    </div>
  );
}

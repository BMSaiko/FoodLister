import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  loading?: boolean;
  cancelText?: string;
  sticky?: boolean;
}

export default function FormActions({
  onCancel,
  onSubmit,
  submitText,
  loading = false,
  cancelText = "Cancelar",
  sticky = true
}: FormActionsProps) {
  return (
    <div className={`${sticky ? 'fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto' : ''} bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 p-4 flex gap-3 z-[9999] shadow-lg md:bg-transparent md:backdrop-blur-none md:border-t-0 md:shadow-none md:justify-end md:p-0 md:pt-6`}>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 md:flex-none px-6 py-3 min-h-[48px] text-white/70 bg-white/[0.05] border border-white/10 rounded-full hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium"
      >
        <span className="hidden sm:inline">{cancelText}</span>
        <span className="sm:hidden">X</span>
      </button>

      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        aria-busy={loading}
        className="flex-1 md:flex-none px-6 py-3 min-h-[48px] bg-amber-500 text-black rounded-full hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 font-bold"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
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

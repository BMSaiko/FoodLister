import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md p-1.5 rounded-[2rem]"
        style={{ animation: 'modalIn 300ms ease forwards' }}
      >
        <div className="absolute inset-0 rounded-[2rem] bg-white/[0.08] ring-1 ring-white/10 backdrop-blur-xl" />
        <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-white/50" />
          </button>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            <AlertTriangle className={`h-5 w-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/50 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors duration-150"
            >
              {cancelText}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                danger
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

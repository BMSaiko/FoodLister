'use client';

import { AlertTriangle, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" ariaLabel={title}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4 text-white/50" />
      </button>
      <div className="p-6">
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
    </Modal>
  );
}

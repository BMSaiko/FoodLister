"use client";

import React from 'react';
import Icon from '@/components/ui/icons/Icon';

interface VisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isPublic, onChange }) => (
  <div className="mb-6">
    <label className="block text-[var(--foreground-secondary)] font-semibold mb-2">
      Visibilidade
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
          isPublic 
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm' 
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        <Icon name="globo" className="h-5 w-5" />
        <span className="font-medium">Pública</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
          !isPublic 
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm' 
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        <Icon name="privado" className="h-5 w-5" />
        <span className="font-medium">Privada</span>
      </button>
    </div>
    <p className="text-xs text-[var(--foreground-muted)] mt-2 flex items-center gap-1">
      {isPublic ? (
        <><Icon name="globo" className="h-3 w-3" /> Qualquer pessoa pode ver esta lista</>
      ) : (
        <><Icon name="privado" className="h-3 w-3" /> Apenas você pode ver esta lista</>
      )}
    </p>
  </div>
);

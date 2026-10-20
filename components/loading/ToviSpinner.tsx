import React from "react";

interface ToviSpinnerProps {
  className?: string;
}

/**
 * Versão inline da Tovi para botões, campos e linhas (substitui Loader2 / border-spin).
 * Herda a cor do texto (currentColor) e o tamanho de `className` (por defeito h-4 w-4).
 * A tampa levanta com `.tovi-lid`; com prefers-reduced-motion fica parada e entreaberta.
 */
const ToviSpinner: React.FC<ToviSpinnerProps> = ({ className = "h-4 w-4" }) => (
  <svg
    className={`tovi tovi-compact inline-block shrink-0 ${className}`}
    viewBox="0 0 120 120"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M14 100h92" stroke="currentColor" strokeWidth="9" strokeLinecap="round" fill="none" />
    <g className="tovi-lid">
      <path d="M20 90a40 38 0 0 1 80 0Z" />
      <circle cx="60" cy="48" r="6" />
    </g>
  </svg>
);

export default React.memo(ToviSpinner);

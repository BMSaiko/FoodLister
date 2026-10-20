import React from 'react';

export type ToviEmote =
  | 'feliz'
  | 'a-pensar'
  | 'triste'
  | 'a-dormir'
  | 'surpreendida'
  | 'a-celebrar';

interface EmptyStateProps {
  mascot?: ToviEmote;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Estado vazio único da app: Tovi + título + texto + CTA opcional. */
const EmptyState: React.FC<EmptyStateProps> = ({
  mascot = 'a-dormir',
  title,
  description,
  action,
  className = '',
}) => (
  <div
    role="status"
    className={`flex flex-col items-center text-center gap-3 px-6 py-12 ${className}`}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/mascot/tovi-${mascot}.svg`} alt="" aria-hidden="true" width={96} height={96} className="h-24 w-24" />
    <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
    {description && <p className="max-w-xs text-sm text-[var(--gray-500)]">{description}</p>}
    {action && <div className="mt-2 [&>*]:min-h-[44px]">{action}</div>}
  </div>
);

export default EmptyState;

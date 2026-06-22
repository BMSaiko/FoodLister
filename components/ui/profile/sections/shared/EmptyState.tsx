import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const content = (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white/70 mb-2">{title}</h3>
      <p className="text-sm text-white/35 max-w-sm mx-auto">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple-500/15 text-purple-400 rounded-xl hover:bg-purple-500/25 transition-all text-sm font-medium">
            {action.icon}
            {action.label}
          </Link>
        ) : action.onClick ? (
          <button onClick={action.onClick} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple-500/15 text-purple-400 rounded-xl hover:bg-purple-500/25 transition-all text-sm font-medium">
            {action.icon}
            {action.label}
          </button>
        ) : null
      )}
    </div>
  );

  return <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06]">{content}</div>;
};

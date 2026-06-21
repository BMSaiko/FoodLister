import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function FormSection({ title, description, children, icon }: FormSectionProps) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-start gap-3 mb-4 sm:mb-6">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white/90">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-white/40 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 sm:space-y-5">
        {children}
      </div>
    </div>
  );
}

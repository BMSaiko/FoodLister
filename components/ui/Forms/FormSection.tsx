import React from 'react';

export default function FormSection({
  title,
  children,
  className = '',
  titleClassName = '',
  contentClassName = ''
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}) {
  return (
    <div className={`mb-8 ${className}`}>
      {title && (
        <h3 className={`text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 ${titleClassName}`}>
          {title}
        </h3>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}

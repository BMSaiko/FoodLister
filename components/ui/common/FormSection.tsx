import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="mb-6">
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
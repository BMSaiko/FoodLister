import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  icon?: LucideIcon;
  helperText?: string;
  children?: React.ReactNode;
}

export default function FormField({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  required = false,
  placeholder,
  rows = 4,
  icon: Icon,
  helperText,
  children 
}: FormFieldProps) {
  const inputProps = {
    name,
    value,
    onChange,
    required,
    placeholder,
    className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            {...inputProps}
            rows={rows}
            style={{
              paddingLeft: Icon ? '2.5rem' : '0.75rem'
            }}
          />
        ) : (
          <input
            {...inputProps}
            type={type}
            style={{
              paddingLeft: Icon ? '2.5rem' : '0.75rem'
            }}
          />
        )}
        
        {children && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
            {children}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
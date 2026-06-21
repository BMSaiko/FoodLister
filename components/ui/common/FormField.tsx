import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number' | 'tel' | 'date' | 'time';
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  icon?: LucideIcon;
  helperText?: string;
  children?: React.ReactNode;
  error?: string;
  disabled?: boolean;
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
  children,
  error,
  disabled = false
}: FormFieldProps) {
  const inputClasses = `w-full px-4 py-3 min-h-[48px] bg-white/[0.03] border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500/70' : 'border-white/10'}`;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-white/60">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-white/30" />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`${inputClasses} resize-none ${Icon ? 'pl-10' : ''}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputClasses} ${Icon ? 'pl-10' : ''}`}
          />
        )}

        {children && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
            {children}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-white/40">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

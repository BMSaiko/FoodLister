'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  id: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  className = '',
  children,
  id,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error flex items-center gap-1 mt-1" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-foreground-muted mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  helperText,
  required = false,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || '';

  return (
    <FormField
      id={inputId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 bg-input-bg text-input-text border rounded-[var(--radius-lg)] text-base transition-all duration-150 min-h-[44px] ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-input-border focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
    </FormField>
  );
});

FormInput.displayName = 'FormInput';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(({
  label,
  error,
  helperText,
  required = false,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || '';

  return (
    <FormField
      id={inputId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`w-full px-4 py-2.5 bg-input-bg text-input-text border rounded-[var(--radius-lg)] text-base transition-all duration-150 min-h-[44px] resize-y ${
          error
            ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
            : 'border-input-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
    </FormField>
  );
});

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  error,
  helperText,
  required = false,
  options,
  placeholder,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || '';

  return (
    <FormField
      id={inputId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      <select
        ref={ref}
        id={inputId}
        className={`w-full px-4 py-2.5 bg-input-bg text-input-text border rounded-[var(--radius-lg)] text-base transition-all duration-150 min-h-[44px] appearance-none cursor-pointer ${
          error
            ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
            : 'border-input-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormField;
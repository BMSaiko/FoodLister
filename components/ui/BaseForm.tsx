/**
 * BaseForm - Generic form wrapper with consistent styling and behavior
 * Provides common form layout, error display, and submission handling
 */

"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  loading?: boolean;
  className?: string;
  header?: {
    title: string;
    subtitle?: string;
    gradient?: string;
  };
  actions?: {
    cancelText?: string;
    submitText?: string;
    onCancel?: () => void;
    loadingText?: string;
  };
  showActions?: boolean;
}

export default function BaseForm({
  children,
  onSubmit,
  error,
  loading = false,
  className = '',
  header,
  actions,
  showActions = true
}: BaseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-[var(--card-bg)] rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Optional Header */}
      {header && (
        <div className={`bg-primary px-4 sm:px-6 py-4 sm:py-6`}>
          <h1 className="text-2xl font-bold text-[var(--primary-foreground)]">{header.title}</h1>
          {header.subtitle && (
            <p className="text-white/80 text-sm mt-1">{header.subtitle}</p>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-[var(--error-light)] text-[var(--error)] p-4 rounded-xl mb-6 border border-[var(--error-light)] flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        {children}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
            {actions?.onCancel && (
              <button
                type="button"
                onClick={actions.onCancel}
                className="px-5 py-2.5 border border-[var(--input-border)] rounded-xl text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors font-medium"
              >
                {actions.cancelText || 'Cancelar'}
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-[var(--primary-foreground)] rounded-xl hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{actions?.loadingText || 'Salvando...'}</span>
                </div>
              ) : (
                actions?.submitText || 'Salvar'
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

/**
 * FormField - Generic form field wrapper with label and error display
 */
interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
}

export function FormField({ label, error, required, children, className = '', helpText }: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-[var(--foreground-secondary)] font-semibold mb-2">
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-sm text-[var(--foreground-muted)] mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-[var(--error)] mt-1 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormInput - Standard text input with consistent styling
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

export function FormInput({ label, error, required, helpText, className = '', ...props }: FormInputProps) {
  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <input
        {...props}
        className={`w-full px-4 py-2.5 border ${error ? 'border-[var(--error)]' : 'border-[var(--input-border)]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
      />
    </FormField>
  );
}

/**
 * FormTextarea - Textarea with consistent styling
 */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

export function FormTextarea({ label, error, required, helpText, className = '', ...props }: FormTextareaProps) {
  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <textarea
        {...props}
        className={`w-full px-4 py-2.5 border ${error ? 'border-[var(--error)]' : 'border-[var(--input-border)]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
      />
    </FormField>
  );
}

/**
 * FormSelect - Select dropdown with consistent styling
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({ label, error, required, helpText, options, placeholder, className = '', ...props }: FormSelectProps) {
  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <select
        {...props}
        className={`w-full px-4 py-2.5 border ${error ? 'border-[var(--error)]' : 'border-[var(--input-border)]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
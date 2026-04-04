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
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Optional Header */}
      {header && (
        <div className={`bg-gradient-to-r ${header.gradient || 'from-amber-500 to-orange-500'} px-4 sm:px-6 py-4 sm:py-6`}>
          <h1 className="text-2xl font-bold text-white">{header.title}</h1>
          {header.subtitle && (
            <p className="text-amber-100 text-sm mt-1">{header.subtitle}</p>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        {children}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {actions?.onCancel && (
              <button
                type="button"
                onClick={actions.onCancel}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {actions.cancelText || 'Cancelar'}
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
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
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${className}`}
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
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${className}`}
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
        className={`w-full px-4 py-2.5 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${className}`}
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
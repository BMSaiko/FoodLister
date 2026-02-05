import React from 'react';

interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helperText?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
  [key: string]: any;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  children,
  className = '',
  labelClassName = '',
  inputClassName = '',
  icon: Icon,
  helperText,
  error,
  maxLength,
  disabled = false,
  ...props
}: FormFieldProps) {
  const inputId = name;

  const hasInlineChildren = children && React.isValidElement(children) && !Array.isArray(children);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`flex items-center text-gray-700 font-medium mb-2 ${labelClassName}`}
        >
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {hasInlineChildren ? (
          <div className="flex gap-2">
            {type === 'textarea' ? (
              <textarea
                id={inputId}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                disabled={disabled}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-vertical ${inputClassName} ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                {...props}
              />
            ) : (
              <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                disabled={disabled}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${inputClassName} ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                {...props}
              />
            )}
            {children}
          </div>
        ) : (
          <>
            {type === 'textarea' ? (
              <textarea
                id={inputId}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                disabled={disabled}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-vertical ${inputClassName} ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                {...props}
              />
            ) : (
              <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                disabled={disabled}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${inputClassName} ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                {...props}
              />
            )}
            {children}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-1">
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {maxLength && typeof value === 'string' && (
          <span className="text-xs text-gray-400 ml-auto">{value.length}/{maxLength}</span>
        )}
      </div>
    </div>
  );
}

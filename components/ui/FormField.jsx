import React from 'react';

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
  ...props
}) {
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
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-vertical ${inputClassName}`}
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
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${inputClassName}`}
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
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-vertical ${inputClassName}`}
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
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${inputClassName}`}
                {...props}
              />
            )}
            {children}
          </>
        )}
      </div>

      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

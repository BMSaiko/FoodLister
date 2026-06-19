import React from 'react';

interface MultiplePhoneInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  maxPhones?: number;
}

export default function MultiplePhoneInput({
  values,
  onChange,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  maxPhones = 5
}: MultiplePhoneInputProps) {
  const addPhone = () => {
    if (values.length < maxPhones) {
      onChange([...values, '']);
    }
  };

  const updatePhone = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  const removePhone = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className={`block text-sm font-medium text-[var(--gray-700)] ${labelClassName}`}>
        {label}
        {required && <span className="text-[var(--red-500)] ml-1">*</span>}
      </label>
      
      <div className="space-y-3">
        {values.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => updatePhone(index, e.target.value)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 bg-[var(--card-bg)] border border-[var(--gray-300)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all text-sm ${inputClassName}`}
              placeholder="+351 912 345 678"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(index)}
                disabled={disabled}
                className="px-3 py-2 text-[var(--error)] hover:text-[var(--red-800)] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remover número"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        
        {values.length < maxPhones && (
          <button
            type="button"
            onClick={addPhone}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-[var(--gray-300)] text-sm leading-4 font-medium rounded-md text-[var(--gray-700)] bg-[var(--card-bg)] hover:bg-[var(--gray-50)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar número
          </button>
        )}
      </div>
      
      {helperText && (
        <p className="text-xs text-[var(--gray-500)]">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
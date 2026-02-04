import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Type definitions for react-phone-number-input
type E164Number = string;
type CountryCode = string;

interface PhoneInputProps {
  value?: E164Number;
  onChange: (value: E164Number) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  onCountryChange?: (country: CountryCode) => void;
}

export default function PhoneInputField({
  value,
  onChange,
  placeholder = '+351 912 345 678',
  label = 'Número de Telefone',
  helperText = 'Selecione o país e digite o número no formato internacional',
  error,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  onCountryChange
}: PhoneInputProps) {
  const [country, setCountry] = useState<string | undefined>();

  // Detect country from phone number when value changes
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const countryCode = detectCountryFromPhoneNumber(value);
      if (countryCode && countryCode !== country) {
        setCountry(countryCode);
        onCountryChange?.(countryCode);
      }
    }
  }, [value, country, onCountryChange]);

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    onCountryChange?.(newCountry);
  };

  // Handle phone number change
  const handlePhoneNumberChange = (newValue: E164Number | undefined) => {
    onChange(newValue || '');
    
    // Auto-detect country if phone number starts with +
    if (newValue && newValue.startsWith('+')) {
      const detectedCountry = detectCountryFromPhoneNumber(newValue);
      if (detectedCountry && detectedCountry !== country) {
        setCountry(detectedCountry);
        onCountryChange?.(detectedCountry);
      }
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`flex items-center text-gray-700 font-medium mb-2 ${labelClassName}`}>
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <PhoneInput
          international
          defaultCountry="PT"
          countryCallingCodeEditable={false}
          value={value}
          onChange={handlePhoneNumberChange}
          onCountryChange={handleCountryChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${inputClassName} ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          }`}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '20px',
            backgroundColor: disabled ? '#f3f4f6' : 'white'
          }}
        />
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

// Helper function to detect country from phone number
function detectCountryFromPhoneNumber(phoneNumber: string): string | undefined {
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    return undefined;
  }

  // Remove all non-digit characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Country code mappings based on phone number prefixes
  const countryMappings: { [key: string]: string } = {
    // Portugal
    '+351': 'PT',
    '351': 'PT',
    
    // Brazil
    '+55': 'BR',
    '55': 'BR',
    
    // Spain
    '+34': 'ES',
    '34': 'ES',
    
    // France
    '+33': 'FR',
    '33': 'FR',
    
    // Germany
    '+49': 'DE',
    '49': 'DE',
    
    // UK
    '+44': 'GB',
    '44': 'GB',
    
    // USA/Canada
    '+1': 'US',
    '1': 'US',
    
    // Angola
    '+244': 'AO',
    '244': 'AO',
    
    // Mozambique
    '+258': 'MZ',
    '258': 'MZ',
    
    // Cape Verde
    '+238': 'CV',
    '238': 'CV',
    
    // Guinea-Bissau
    '+245': 'GW',
    '245': 'GW',
    
    // São Tomé and Príncipe
    '+239': 'ST',
    '239': 'ST',
    
    // Timor-Leste
    '+670': 'TL',
    '670': 'TL'
  };

  // Check for exact matches first
  if (countryMappings[cleanNumber.substring(0, 4)]) {
    return countryMappings[cleanNumber.substring(0, 4)];
  }

  // Check for 3-digit codes
  if (countryMappings[cleanNumber.substring(0, 3)]) {
    return countryMappings[cleanNumber.substring(0, 3)];
  }

  // Check for 2-digit codes
  if (countryMappings[cleanNumber.substring(0, 2)]) {
    return countryMappings[cleanNumber.substring(0, 2)];
  }

  // Check for 1-digit codes (like US/Canada)
  if (countryMappings[cleanNumber.substring(0, 1)]) {
    return countryMappings[cleanNumber.substring(0, 1)];
  }

  return undefined;
}

// Component for multiple phone numbers
interface MultiplePhoneInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  maxPhones?: number;
}

export function MultiplePhoneInput({
  values,
  onChange,
  label = 'Números de Telefone',
  helperText = 'Adicione números de telefone com prefixo internacional',
  error,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  maxPhones = 5
}: MultiplePhoneInputProps) {
  const addPhoneNumber = () => {
    if (values.length < maxPhones) {
      onChange([...values, '']);
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  const removePhoneNumber = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className={`flex items-center text-gray-700 font-medium ${labelClassName}`}>
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {values.length < maxPhones && (
          <button
            type="button"
            onClick={addPhoneNumber}
            disabled={disabled}
            className="flex items-center justify-center px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Telefone
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 mt-1">{error}</div>
      )}

      {values.length === 0 ? (
        <div className="text-center py-6 px-4 bg-amber-50 rounded-lg border-2 border-dashed border-amber-200">
          <svg className="h-8 w-8 mx-auto text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-sm text-amber-700 font-medium">Nenhum telefone adicionado</p>
          <p className="text-xs text-amber-600 mt-1">{helperText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {values.map((phone, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
              <div className="flex-1">
                <PhoneInputField
                  value={phone}
                  onChange={(value) => updatePhoneNumber(index, value)}
                  label=""
                  helperText=""
                  error=""
                  required={false}
                  disabled={disabled}
                  inputClassName={inputClassName}
                  onCountryChange={(country) => {
                    // Optional: handle country change for individual phone
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoneNumber(index)}
                disabled={disabled || values.length <= 1}
                className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 min-h-[44px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remover telefone"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
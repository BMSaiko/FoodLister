/**
 * useForm - Generic form state management hook
 * Provides validation, dirty state, submission handling, and field management
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface FormFieldConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any, values: Record<string, any>) => string | null;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validation?: Partial<Record<keyof T, FormFieldConfig>>;
  onSubmit?: (values: T) => Promise<void | boolean>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validation, onSubmit, onSuccess, onError } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialValuesRef = useRef(initialValues);

  // Check if form is dirty
  const isDirty = useCallback(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  }, [values]);

  // Validate a single field
  const validateField = useCallback((name: keyof T, value: any, allValues: T): string | null => {
    const fieldValidation = validation?.[name];
    if (!fieldValidation) return null;

    // Required validation
    if (fieldValidation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo é obrigatório';
    }

    // Min length validation
    if (fieldValidation.minLength && typeof value === 'string' && value.length < fieldValidation.minLength) {
      return `Mínimo de ${fieldValidation.minLength} caracteres`;
    }

    // Max length validation
    if (fieldValidation.maxLength && typeof value === 'string' && value.length > fieldValidation.maxLength) {
      return `Máximo de ${fieldValidation.maxLength} caracteres`;
    }

    // Pattern validation
    if (fieldValidation.pattern && typeof value === 'string' && !fieldValidation.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (fieldValidation.validate) {
      return fieldValidation.validate(value, allValues);
    }

    return null;
  }, [validation]);

  // Validate all fields
  const validateAll = useCallback((vals: T): Partial<Record<keyof T, string>> => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    if (!validation) return newErrors;

    for (const field of Object.keys(validation) as (keyof T)[]) {
      const error = validateField(field, vals[field], vals);
      if (error) {
        newErrors[field] = error;
      }
    }

    return newErrors;
  }, [validation, validateField]);

  // Check if form is valid
  const isValid = useCallback(() => {
    const currentErrors = validateAll(values);
    return Object.keys(currentErrors).length === 0;
  }, [values, validateAll]);

  // Handle field change
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Handle field blur
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, values[name], values);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  }, [values, validateField]);

  // Set field value
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Set multiple field values
  const setFieldValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Reset with new initial values
  const resetWithValues = useCallback((newValues: T) => {
    initialValuesRef.current = newValues;
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    for (const key of Object.keys(values)) {
      allTouched[key as keyof T] = true;
    }
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateAll(values);
    setErrors(validationErrors);

    // If there are errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }

    if (!onSubmit) return false;

    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(values);
      
      if (result !== false) {
        onSuccess?.();
      }
      
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro desconhecido');
      onError?.(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit, onSuccess, onError]);

  // Get field error
  const getFieldError = useCallback((name: keyof T): string | undefined => {
    return touched[name] ? errors[name] : undefined;
  }, [touched, errors]);

  // Get field props helper
  const getFieldProps = useCallback((name: keyof T) => ({
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: getFieldError(name)
  }), [values, handleChange, handleBlur, getFieldError]);

  return {
    values,
    errors,
    touched,
    isDirty: isDirty(),
    isSubmitting,
    isValid: isValid(),
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldValues,
    setValues: setFieldValues,
    reset,
    resetWithValues,
    validateField,
    validateAll,
    getFieldError,
    getFieldProps
  };
}
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ProfileFormData {
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  profileImage?: string;
  publicProfile: boolean;
}

interface ValidationRules {
  name: { required: boolean; minLength?: number; maxLength?: number };
  bio?: { maxLength?: number };
  website?: { format?: boolean };
}

interface UseProfileFormOptions {
  initialData?: Partial<ProfileFormData>;
  validationRules?: ValidationRules;
  onSave?: (data: ProfileFormData) => Promise<boolean>;
}

interface FormErrors {
  name?: string;
  bio?: string;
  website?: string;
  location?: string;
  phoneNumber?: string;
  profileImage?: string;
  publicProfile?: string;
}

export const useProfileForm = (options: UseProfileFormOptions) => {
  const {
    initialData = {},
    validationRules = {
      name: { required: true, minLength: 2, maxLength: 100 }
    },
    onSave
  } = options;

  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData.name || '',
    bio: initialData.bio || '',
    location: initialData.location || '',
    website: initialData.website || '',
    phoneNumber: initialData.phoneNumber || '',
    profileImage: initialData.profileImage || '',
    publicProfile: initialData.publicProfile ?? true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((name: keyof ProfileFormData, value: any): string | null => {
    const rule = validationRules[name as keyof ValidationRules];
    if (!rule) return null;

    // Type guard to ensure rule has required property
    if ('required' in rule && rule.required && (!value || value.trim() === '')) {
      return `${getFieldLabel(name)} é obrigatório`;
    }

    // Type guard to ensure rule has minLength property
    if ('minLength' in rule && value && rule.minLength && value.length < rule.minLength) {
      return `${getFieldLabel(name)} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // Type guard to ensure rule has maxLength property
    if ('maxLength' in rule && value && rule.maxLength && value.length > rule.maxLength) {
      return `${getFieldLabel(name)} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    // Type guard to ensure rule has format property and name is website
    if (name === 'website' && 'format' in rule && value && rule.format) {
      try {
        new URL(value);
      } catch {
        return 'Formato de URL do website inválido';
      }
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let formIsValid = true;

    // Validate all fields
    Object.keys(validationRules).forEach(key => {
      const error = validateField(key as keyof ProfileFormData, formData[key as keyof ProfileFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [formData, validateField, validationRules]);

  const updateField = useCallback((name: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return false;
    }

    if (!onSave) {
      toast.error('Função de salvamento não configurada');
      return false;
    }

    setIsSubmitting(true);

    try {
      const success = await onSave(formData);
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      }
      return success;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  const resetForm = useCallback((data?: Partial<ProfileFormData>) => {
    setFormData({
      name: data?.name || '',
      bio: data?.bio || '',
      location: data?.location || '',
      website: data?.website || '',
      phoneNumber: data?.phoneNumber || '',
      profileImage: data?.profileImage || '',
      publicProfile: data?.publicProfile ?? true
    });
    setErrors({});
    setIsValid(false);
  }, []);

  const getFieldLabel = (fieldName: keyof ProfileFormData): string => {
    const labels: Record<keyof ProfileFormData, string> = {
      name: 'Nome de exibição',
      bio: 'Biografia',
      location: 'Localização',
      website: 'Website',
      phoneNumber: 'Número de telefone',
      profileImage: 'Imagem de perfil',
      publicProfile: 'Privacidade do perfil'
    };
    return labels[fieldName];
  };

  return {
    formData,
    errors,
    isSubmitting,
    isValid,
    updateField,
    handleSubmit,
    resetForm,
    validateForm,
    getFieldLabel
  };
};
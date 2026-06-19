jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from '@/hooks/forms/useProfileForm';
import { toast } from 'react-toastify';

describe('useProfileForm', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useProfileForm({}));
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.publicProfile).toBe(true);
  });

  it('initializes with provided initial data', () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          name: 'John Doe', bio: 'Hello', location: 'Lisbon',
          website: 'https://example.com', phoneNumber: '+351912345678',
          profileImage: 'https://example.com/img.jpg', publicProfile: false,
        },
      })
    );
    expect(result.current.formData.name).toBe('John Doe');
    expect(result.current.formData.bio).toBe('Hello');
    expect(result.current.formData.location).toBe('Lisbon');
    expect(result.current.formData.publicProfile).toBe(false);
  });

  it('updateField updates a field value', () => {
    const { result } = renderHook(() => useProfileForm({}));
    act(() => { result.current.updateField('name', 'New Name'); });
    expect(result.current.formData.name).toBe('New Name');
  });

  it('updateField clears error for the field', () => {
    const { result } = renderHook(() => useProfileForm({}));
    act(() => { result.current.updateField('name', ''); });
    act(() => { result.current.validateForm(); });
    expect(result.current.errors.name).toBeDefined();
    act(() => { result.current.updateField('name', 'Valid Name'); });
    expect(result.current.errors.name).toBeUndefined();
  });

  it('validateForm validates required fields', () => {
    const { result } = renderHook(() =>
      useProfileForm({ validationRules: { name: { required: true, minLength: 2, maxLength: 100 } } })
    );
    let isValid: boolean;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBeDefined();
  });

  it('validateForm passes with valid data', () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: { name: 'Valid Name', publicProfile: true },
        validationRules: { name: { required: true, minLength: 2, maxLength: 100 } },
      })
    );
    let isValid: boolean;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid!).toBe(true);
    expect(result.current.isValid).toBe(true);
  });

  it('validateForm enforces minLength', () => {
    const { result } = renderHook(() =>
      useProfileForm({ validationRules: { name: { required: true, minLength: 5, maxLength: 100 } } })
    );
    act(() => { result.current.updateField('name', 'AB'); });
    let isValid: boolean;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toContain('pelo menos 5 caracteres');
  });

  it('validateForm enforces maxLength', () => {
    const { result } = renderHook(() =>
      useProfileForm({ validationRules: { name: { required: true, minLength: 2, maxLength: 10 } } })
    );
    act(() => { result.current.updateField('name', 'This name is too long'); });
    let isValid: boolean;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toContain('no máximo 10 caracteres');
  });

  it('validateForm validates website format', () => {
    const { result } = renderHook(() =>
      useProfileForm({
        validationRules: {
          name: { required: true, minLength: 2, maxLength: 100 },
          website: { format: true },
        },
      })
    );
    act(() => {
      result.current.updateField('name', 'Valid Name');
      result.current.updateField('website', 'not-a-url');
    });
    let isValid: boolean;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid!).toBe(false);
    expect(result.current.errors.website).toContain('URL');
  });

  it('handleSubmit prevents submit with invalid form', async () => {
    const { result } = renderHook(() =>
      useProfileForm({ onSave: jest.fn(() => Promise.resolve(true)) })
    );
    let submitResult: any;
    await act(async () => { submitResult = await result.current.handleSubmit(); });
    expect(submitResult).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrija os erros no formulário');
  });

  it('handleSubmit calls onSave with valid form', async () => {
    const mockSave = jest.fn(() => Promise.resolve(true));
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: { name: 'Valid Name', publicProfile: true },
        validationRules: { name: { required: true, minLength: 2, maxLength: 100 } },
        onSave: mockSave,
      })
    );
    let submitResult: any;
    await act(async () => { submitResult = await result.current.handleSubmit(); });
    expect(submitResult).toBe(true);
    expect(mockSave).toHaveBeenCalledWith(result.current.formData);
  });

  it('handleSubmit shows success toast on successful save', async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: { name: 'Valid Name', publicProfile: true },
        validationRules: { name: { required: true, minLength: 2, maxLength: 100 } },
        onSave: jest.fn(() => Promise.resolve(true)),
      })
    );
    await act(async () => { await result.current.handleSubmit(); });
    expect(toast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
  });

  it('handleSubmit shows error toast on save failure', async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: { name: 'Valid Name', publicProfile: true },
        validationRules: { name: { required: true, minLength: 2, maxLength: 100 } },
        onSave: jest.fn(() => Promise.reject(new Error('Save failed'))),
      })
    );
    await act(async () => { await result.current.handleSubmit(); });
    expect(toast.error).toHaveBeenCalledWith('Erro ao salvar perfil');
  });

  it('handleSubmit returns false when onSave not provided', async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: { name: 'Valid Name', publicProfile: true },
        validationRules: { name: { required: true, minLength: 2, maxLength: 100 } },
      })
    );
    let submitResult: any;
    await act(async () => { submitResult = await result.current.handleSubmit(); });
    expect(submitResult).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Função de salvamento não configurada');
  });

  it('resetForm resets form to initial state', () => {
    const { result } = renderHook(() =>
      useProfileForm({ initialData: { name: 'Initial Name', publicProfile: true } })
    );
    act(() => { result.current.updateField('name', 'Changed Name'); });
    act(() => { result.current.resetForm(); });
    // resetForm without args resets to empty defaults (not initialData)
    expect(result.current.formData.name).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('resetForm with data overrides initial state', () => {
    const { result } = renderHook(() =>
      useProfileForm({ initialData: { name: 'Initial Name', publicProfile: true } })
    );
    act(() => { result.current.resetForm({ name: 'Override Name' }); });
    expect(result.current.formData.name).toBe('Override Name');
  });

  it('getFieldLabel returns correct labels', () => {
    const { result } = renderHook(() => useProfileForm({}));
    expect(result.current.getFieldLabel('name')).toBe('Nome de exibição');
    expect(result.current.getFieldLabel('bio')).toBe('Biografia');
    expect(result.current.getFieldLabel('location')).toBe('Localização');
    expect(result.current.getFieldLabel('website')).toBe('Website');
    expect(result.current.getFieldLabel('phoneNumber')).toBe('Número de telefone');
    expect(result.current.getFieldLabel('profileImage')).toBe('Imagem de perfil');
    expect(result.current.getFieldLabel('publicProfile')).toBe('Privacidade do perfil');
  });

  it('isSubmitting is false initially', () => {
    const { result } = renderHook(() => useProfileForm({}));
    expect(result.current.isSubmitting).toBe(false);
  });
});

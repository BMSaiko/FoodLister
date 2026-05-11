import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('@/hooks/auth/useVerification', () => ({
  useVerification: jest.fn(),
}));

import EmailVerification from '@/components/auth/EmailVerification';
import { useVerification } from '@/hooks/auth/useVerification';

describe('EmailVerification', () => {
  const mockSendEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useVerification as any).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: false,
      error: null,
    });
  });

  it('should render verification form', () => {
    render(<EmailVerification />);

    expect(screen.getByText('Verificação de Email')).toBeDefined();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined();
    expect(screen.getByText('Reenviar Email de Verificação')).toBeDefined();
  });

  it('should pre-fill email when provided', () => {
    render(<EmailVerification email="test@example.com" />);

    const input = screen.getByPlaceholderText('seu@email.com') as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('should send verification email on form submit', async () => {
    mockSendEmail.mockResolvedValue({ error: null });

    render(<EmailVerification />);

    const input = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const button = screen.getByText('Reenviar Email de Verificação');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show success message after sending', async () => {
    mockSendEmail.mockResolvedValue({ error: null });

    render(<EmailVerification />);

    const input = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const button = screen.getByText('Reenviar Email de Verificação');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Email de verificação enviado! Verifique sua caixa de entrada.')).toBeDefined();
    });
  });

  it('should show error message on failure', async () => {
    (useVerification as any).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: false,
      error: 'Failed to send email',
    });

    render(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText('Failed to send email')).toBeDefined();
    });
  });

  it('should disable button when loading', () => {
    (useVerification as any).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: true,
      error: null,
    });

    render(<EmailVerification />);

    const button = screen.getByText('Enviando...') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should call onVerificationSent callback', async () => {
    mockSendEmail.mockResolvedValue({ error: null });
    const onSent = jest.fn();

    render(<EmailVerification onVerificationSent={onSent} />);

    const input = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const button = screen.getByText('Reenviar Email de Verificação');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSent).toHaveBeenCalled();
    });
  });
});
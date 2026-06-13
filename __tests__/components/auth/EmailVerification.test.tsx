import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockSendEmail = jest.fn();

jest.mock('@/hooks/auth/useVerification', () => ({
  useVerification: jest.fn(() => ({
    sendEmail: mockSendEmail,
    loading: false,
    error: null,
  })),
}));

import EmailVerification from '@/components/auth/EmailVerification';
import { useVerification } from '@/hooks/auth/useVerification';

describe('EmailVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useVerification as jest.Mock).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: false,
      error: null,
    });
  });

  it('should render verification form', () => {
    render(<EmailVerification />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined();
    expect(screen.getByText('Reenviar Email de Verificação')).toBeDefined();
  });

  it('should disable button when loading', () => {
    (useVerification as jest.Mock).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: true,
      error: null,
    });
    render(<EmailVerification />);
    const button = screen.getByText('Enviando...') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show error message on failure', async () => {
    (useVerification as jest.Mock).mockReturnValue({
      sendEmail: mockSendEmail,
      loading: false,
      error: 'Failed to send email',
    });
    render(<EmailVerification />);
    await waitFor(() => {
      expect(screen.getByText('Failed to send email')).toBeDefined();
    });
  });
});

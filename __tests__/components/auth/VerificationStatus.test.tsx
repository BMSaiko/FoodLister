import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@/hooks/auth/useVerification', () => ({
  useVerification: jest.fn(),
}));

import VerificationStatus from '@/components/auth/VerificationStatus';
import { useVerification } from '@/hooks/auth/useVerification';

describe('VerificationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    (useVerification as any).mockReturnValue({
      status: null,
      loading: true,
    });

    render(<VerificationStatus />);

    expect(screen.getByText('Carregando status de verificação...')).toBeDefined();
  });

  it('should show unavailable when no status', () => {
    (useVerification as any).mockReturnValue({
      status: null,
      loading: false,
    });

    render(<VerificationStatus />);

    expect(screen.getByText('Status de verificação indisponível.')).toBeDefined();
  });

  it('should show verified status', () => {
    (useVerification as any).mockReturnValue({
      status: {
        isVerified: true,
        emailConfirmed: true,
        verifiedAt: '2024-01-15T10:30:00Z',
        verificationMethod: 'email',
      },
      loading: false,
    });

    render(<VerificationStatus />);

    expect(screen.getByText('Email Verificado')).toBeDefined();
  });

  it('should show unverified status', () => {
    (useVerification as any).mockReturnValue({
      status: {
        isVerified: false,
        emailConfirmed: false,
        verifiedAt: null,
        verificationMethod: null,
      },
      loading: false,
    });

    render(<VerificationStatus />);

    expect(screen.getByText('Email Não Verificado')).toBeDefined();
    expect(screen.getByText('Por favor, verifique seu email para ativar todas as funcionalidades.')).toBeDefined();
  });

  it('should use prop status over hook status', () => {
    (useVerification as any).mockReturnValue({
      status: {
        isVerified: false,
        emailConfirmed: false,
        verifiedAt: null,
        verificationMethod: null,
      },
      loading: false,
    });

    const propStatus = {
      isVerified: true,
      emailConfirmed: true,
      verifiedAt: '2024-06-01T00:00:00Z',
      verificationMethod: 'email' as const,
    };

    render(<VerificationStatus status={propStatus} />);

    expect(screen.getByText('Email Verificado')).toBeDefined();
  });

  it('should hide resend message when showResendButton is false', () => {
    (useVerification as any).mockReturnValue({
      status: {
        isVerified: false,
        emailConfirmed: false,
        verifiedAt: null,
        verificationMethod: null,
      },
      loading: false,
    });

    render(<VerificationStatus showResendButton={false} />);

    expect(screen.getByText('Email Não Verificado')).toBeDefined();
    expect(screen.queryByText('Por favor, verifique seu email para ativar todas as funcionalidades.')).toBeNull();
  });
});
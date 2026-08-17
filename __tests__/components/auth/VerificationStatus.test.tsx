import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseVerification = jest.fn();

jest.mock('@/hooks/auth/useVerification', () => ({
  useVerification: (...args: any[]) => mockUseVerification(...args),
}));

import VerificationStatus from '@/components/auth/VerificationStatus';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('VerificationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseVerification.mockReturnValue({ status: null, loading: true });
    render(<LanguageProvider><VerificationStatus /></LanguageProvider>);
    expect(screen.getByText('Carregando status de verificação...')).toBeDefined();
  });

  it('should show unavailable when no status', () => {
    mockUseVerification.mockReturnValue({ status: null, loading: false });
    render(<LanguageProvider><VerificationStatus /></LanguageProvider>);
    expect(screen.getByText('Status de verificação indisponível.')).toBeDefined();
  });

  it('should show verified status', () => {
    mockUseVerification.mockReturnValue({
      status: { isVerified: true, emailConfirmed: true, verifiedAt: '2024-01-15T10:30:00Z', verificationMethod: 'email' },
      loading: false,
    });
    render(<LanguageProvider><VerificationStatus /></LanguageProvider>);
    expect(screen.getByText('Email Verificado')).toBeDefined();
  });

  it('should show unverified status', () => {
    mockUseVerification.mockReturnValue({
      status: { isVerified: false, emailConfirmed: false, verifiedAt: null, verificationMethod: null },
      loading: false,
    });
    render(<LanguageProvider><VerificationStatus /></LanguageProvider>);
    expect(screen.getByText('Email Não Verificado')).toBeDefined();
    expect(screen.getByText('Por favor, verifique seu email para ativar todas as funcionalidades.')).toBeDefined();
  });

  it('should use prop status over hook status', () => {
    mockUseVerification.mockReturnValue({
      status: { isVerified: false, emailConfirmed: false, verifiedAt: null, verificationMethod: null },
      loading: false,
    });
    const propStatus = { isVerified: true, emailConfirmed: true, verifiedAt: '2024-06-01T00:00:00Z', verificationMethod: 'email' as const };
    render(<LanguageProvider><VerificationStatus status={propStatus} /></LanguageProvider>);
    expect(screen.getByText('Email Verificado')).toBeDefined();
  });

  it('should hide resend message when showResendButton is false', () => {
    mockUseVerification.mockReturnValue({
      status: { isVerified: false, emailConfirmed: false, verifiedAt: null, verificationMethod: null },
      loading: false,
    });
    render(<LanguageProvider><VerificationStatus showResendButton={false} /></LanguageProvider>);
    expect(screen.getByText('Email Não Verificado')).toBeDefined();
    expect(screen.queryByText('Por favor, verifique seu email para ativar todas as funcionalidades.')).toBeNull();
  });
});

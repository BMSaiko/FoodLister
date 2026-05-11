'use client';

import React from 'react';
import { useVerification } from '@/hooks/auth/useVerification';
import type { VerificationStatus as VerificationStatusType } from '@/libs/types';

interface VerificationStatusProps {
  status?: VerificationStatusType | null;
  showResendButton?: boolean;
  email?: string;
}

export default function VerificationStatus({
  status: propStatus,
  showResendButton = true,
  email,
}: VerificationStatusProps) {
  const { status: hookStatus, loading } = useVerification();
  const status = propStatus ?? hookStatus;

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-gray-500 text-sm">Carregando status de verificação...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-gray-500 text-sm">Status de verificação indisponível.</p>
      </div>
    );
  }

  const isVerified = status.isVerified;

  return (
    <div className={`p-4 rounded-md border ${isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <div>
          <p className={`font-medium ${isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
            {isVerified ? 'Email Verificado' : 'Email Não Verificado'}
          </p>
          {isVerified && status.verifiedAt && (
            <p className="text-sm text-green-600 mt-1">
              Verificado em: {new Date(status.verifiedAt).toLocaleDateString('pt-PT')}
            </p>
          )}
          {!isVerified && showResendButton && (
            <p className="text-sm text-yellow-600 mt-1">
              Por favor, verifique seu email para ativar todas as funcionalidades.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
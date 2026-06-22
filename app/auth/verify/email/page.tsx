'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVerification } from '@/hooks/auth/useVerification';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, loading: hookLoading } = useVerification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || type !== 'email') {
      setStatus('error');
      setErrorMessage('Token de verificação inválido ou em falta.');
      return;
    }

    const handleVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          router.push('/auth/verify/success');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(
          result.error?.message || 'Falha ao verificar o email. O token pode ter expirado.'
        );
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-white/85 text-center mb-6">
          Verificação de Email
        </h1>

        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">A verificar o seu email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-medium text-lg mb-2">
              Email verificado com sucesso!
            </p>
            <p className="text-gray-500 text-sm">
              A redirecionar...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-700 font-medium text-lg mb-2">
              Falha na verificação
            </p>
            <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                Ir para Login
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-gray-300 text-white/70 rounded-md hover:bg-gray-50 text-center"
              >
                Página Inicial
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
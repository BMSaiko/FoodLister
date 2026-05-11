'use client';

import React, { useState } from 'react';
import { useVerification } from '@/hooks/auth/useVerification';

interface EmailVerificationProps {
  email?: string;
  onVerificationSent?: () => void;
}

export default function EmailVerification({ email, onVerificationSent }: EmailVerificationProps) {
  const { sendEmail, loading, error } = useVerification();
  const [emailInput, setEmailInput] = useState(email || '');
  const [success, setSuccess] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    const result = await sendEmail(emailInput);
    if (!result.error) {
      setSuccess(true);
      onVerificationSent?.();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Verificação de Email
      </h2>

      {success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">
            Email de verificação enviado! Verifique sua caixa de entrada.
          </p>
        </div>
      ) : (
        <form onSubmit={handleResend}>
          <p className="text-gray-600 mb-4">
            Não recebeu o email de verificação? Insira seu email abaixo para reenviar.
          </p>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !emailInput}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Reenviar Email de Verificação'}
          </button>
        </form>
      )}
    </div>
  );
}
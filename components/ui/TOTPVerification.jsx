'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { toast } from 'react-toastify';
import { Shield, RefreshCw } from 'lucide-react';

const TOTPVerification = ({ onVerified, onCancel, email, password, factorId }) => {
  const { signInWithTOTP } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error('Digite um código de 6 dígitos válido');
      return;
    }

    try {
      setVerifying(true);
      const { data, error } = await signInWithTOTP(email, password, factorId, verificationCode.trim());

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      onVerified?.(data);
    } catch (error) {
      console.error('Error verifying TOTP during sign in:', error);
      toast.error('Código 2FA inválido');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-amber-100 mb-4">
          <Shield className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verificação de Dois Fatores
        </h3>
        <p className="text-sm text-gray-600">
          Digite o código do seu aplicativo autenticador
        </p>
      </div>

      {/* Verification Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Código de 6 dígitos
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyPress={handleKeyPress}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
          maxLength={6}
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">
          Abra seu aplicativo autenticador e digite o código atual
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={verifying}
        >
          Voltar
        </button>
        <button
          onClick={handleVerify}
          disabled={verifying || verificationCode.length !== 6}
          className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {verifying ? (
            <div className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </div>
          ) : (
            'Verificar'
          )}
        </button>
      </div>
    </div>
  );
};

export default TOTPVerification;

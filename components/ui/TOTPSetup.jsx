'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { toast } from 'react-toastify';
import { QrCode, Copy, CheckCircle, X, RefreshCw } from 'lucide-react';

const TOTPSetup = ({ onComplete, onCancel }) => {
  const { enrollTOTP, verifyTOTP, getMFAFactors } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleEnroll();
  }, []);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const { data, error } = await enrollTOTP();

      if (error) throw error;

      setEnrollmentData(data);
    } catch (error) {
      console.error('Error enrolling TOTP:', error);
      toast.error('Erro ao configurar 2FA');
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!enrollmentData || !verificationCode.trim()) {
      toast.error('Digite o código de verificação');
      return;
    }

    try {
      setVerifying(true);
      const { data, error } = await verifyTOTP(enrollmentData.id, verificationCode.trim());

      if (error) throw error;

      toast.success('2FA configurado com sucesso!');
      onComplete?.();
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast.error('Código inválido. Tente novamente.');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-4" />
        <p className="text-gray-600">Configurando autenticação de dois fatores...</p>
      </div>
    );
  }

  if (!enrollmentData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar configuração 2FA</p>
        <button
          onClick={handleEnroll}
          className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-amber-100 mb-4">
          <QrCode className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configurar Autenticação de Dois Fatores
        </h3>
        <p className="text-sm text-gray-600">
          Escaneie o código QR com seu aplicativo autenticador
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <img
            src={enrollmentData.totp.qr_code}
            alt="QR Code para 2FA"
            className="mx-auto max-w-full h-auto"
          />
        </div>
      </div>

      {/* Secret Key */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chave Secreta (caso não consiga escanear o QR):
        </label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-white px-3 py-2 border border-gray-300 rounded text-sm font-mono text-gray-800 break-all">
            {enrollmentData.totp.secret}
          </code>
          <button
            onClick={() => copyToClipboard(enrollmentData.totp.secret)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copiar chave secreta"
          >
            {copied ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Verification Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Código de Verificação
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
          maxLength={6}
        />
        <p className="text-xs text-gray-500 mt-2">
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={verifying}
        >
          Cancelar
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

export default TOTPSetup;

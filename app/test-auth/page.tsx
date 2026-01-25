'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { toast } from 'react-toastify';

const TestAuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { get } = useSecureApiClient();

  const testAuth = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await get('/api/profile');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toast.success('Autenticação bem-sucedida!');
      } else {
        setError(data.error || 'Erro desconhecido');
        toast.error(`Erro: ${data.error || 'Não autorizado'}`);
      }
    } catch (err) {
      setError('Erro de conexão');
      toast.error('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthWithHeaders = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await get('/api/profile');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toast.success('Autenticação bem-sucedida!');
      } else {
        setError(data.error || 'Erro desconhecido');
        toast.error(`Erro: ${data.error || 'Não autorizado'}`);
      }
    } catch (err) {
      setError('Erro de conexão');
      toast.error('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Teste de Autenticação
        </h1>

        <div className="space-y-4">
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Testar Autenticação'}
          </button>

          <button
            onClick={testAuthWithHeaders}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Testar com Headers'}
          </button>

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <strong>Sucesso!</strong>
              <pre className="mt-2 text-sm overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Clique em "Testar Autenticação" para verificar se o token está sendo enviado corretamente</li>
            <li>Se falhar, pode ser necessário fazer login novamente</li>
            <li>O erro 401 geralmente indica que o token de autenticação não foi encontrado</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage;
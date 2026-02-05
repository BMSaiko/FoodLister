'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';

const UserErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon Section */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Erro ao Carregar Perfil
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Ocorreu um erro inesperado ao tentar carregar este perfil. Isso pode ser causado por:
          </p>

          {/* Error Reasons */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Problemas de conexão:</strong> Verifique sua conexão com a internet
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Erro no servidor:</strong> Tente novamente em alguns minutos
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Dados corrompidos:</strong> Ocorreu um erro ao processar os dados
                </span>
              </li>
            </ul>
          </div>

          {/* Error Details */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Detalhes do Erro (Desenvolvimento):</h3>
              <p className="text-sm text-red-700 font-mono">{error.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tentar Novamente</span>
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </button>
            
            <Link
              href="/restaurants"
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Explorar Restaurantes</span>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Se o problema persistir, por favor entre em contato com o suporte técnico 
              ou tente acessar o perfil mais tarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserErrorPage;
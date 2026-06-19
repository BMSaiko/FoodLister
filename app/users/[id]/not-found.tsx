'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { useSmartBackNavigation } from '@/hooks/navigation/useSmartBackNavigation';

const ProfileNotFoundPage = () => {
  const router = useRouter();

  // Smart back navigation
  const { navigateBack } = useSmartBackNavigation({
    fallbackRoute: '/restaurants',
    userContext: 'anonymous'
  });

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    navigateBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon Section */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mx-auto mb-6">
              <Shield className="h-10 w-10 text-amber-600" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Perfil não disponível
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            O perfil que você está tentando acessar não pode ser visualizado.
            Isso pode acontecer porque:
          </p>

          {/* Reasons List */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Perfil privado:</strong> O usuário configurou seu perfil como privado
                </span>
              </li>
              <li className="flex items-start gap-3">
                <User className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Usuário inexistente:</strong> O perfil que você procura não existe
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Restrições de acesso:</strong> Você precisa estar autenticado para visualizar este perfil
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <span>Explorar Restaurantes</span>
            </Link>

            <Link
              href="/auth/signin"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span>Fazer Login</span>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Se você acredita que deveria ter acesso a este perfil, 
              entre em contato com o suporte ou verifique se o usuário 
              compartilhou o link correto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotFoundPage;
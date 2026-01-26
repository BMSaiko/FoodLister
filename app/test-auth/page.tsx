import React from 'react';
import Link from 'next/link';
import { createLoginUrl, createSignupUrl } from '@/utils/authUtils';

export default function TestAuthPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-100/50">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Teste de Redirecionamento de Autenticação
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Página de Teste
              </h2>
              <p className="text-gray-600 mb-4">
                Esta página demonstra como o redirecionamento após login funciona.
                Quando você for redirecionado para a página de login e fizer login,
                será automaticamente redirecionado de volta para esta página.
              </p>
              <p className="text-sm text-gray-500">
                URL atual: {currentUrl}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">
                  Testar Login com Redirecionamento
                </h3>
                <p className="text-amber-700 mb-4 text-sm">
                  Clique no botão abaixo para ir para a página de login.
                  Após o login bem-sucedido, você será redirecionado de volta para esta página.
                </p>
                <Link
                  href={createLoginUrl(currentUrl)}
                  className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
                >
                  Ir para Login
                </Link>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">
                  Testar Cadastro com Redirecionamento
                </h3>
                <p className="text-orange-700 mb-4 text-sm">
                  Clique no botão abaixo para ir para a página de cadastro.
                  Após o cadastro bem-sucedido, você será redirecionado para a página de login com a mensagem de verificação.
                </p>
                <Link
                  href={createSignupUrl(currentUrl)}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
                >
                  Ir para Cadastro
                </Link>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Como usar nos seus componentes:
              </h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { createLoginUrl, createSignupUrl } from '@/utils/authUtils';

// Para redirecionar para login mantendo a página atual
const loginUrl = createLoginUrl(window.location.pathname + window.location.search);
window.location.href = loginUrl;

// Para redirecionar para cadastro mantendo a página atual
const signupUrl = createSignupUrl(window.location.pathname + window.location.search);
window.location.href = signupUrl;`}
              </pre>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/restaurants"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg font-semibold"
              >
                Voltar para Restaurantes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Email Verificado!
        </h1>

        <p className="text-gray-600 mb-6">
          O seu email foi verificado com sucesso. Agora tem acesso a todas as funcionalidades do FoodLister.
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </Link>
          <Link
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Ir para Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
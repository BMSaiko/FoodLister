'use client';

import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Container variant="narrow" className="py-16">
        <div className="card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white/90 mb-2">Pagamento Confirmado!</h1>
          <p className="text-white/90-secondary mb-6">
            Obrigado pela tua subscrição. O teu plano premium estará ativo em breve.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-purple-500 text-white font-semibold rounded-2xl hover:bg-purple-500-dark transition-colors"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/users/settings/notifications"
              className="block w-full py-3 px-4 bg-purple-500-lighter text-purple-400-dark font-semibold rounded-2xl hover:bg-purple-500-light transition-colors"
            >
              Gerir Preferências
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';

export default function SubscribeCanceledPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Container variant="narrow" className="py-16">
        <div className="card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white/90 mb-2">Pagamento Cancelado</h1>
          <p className="text-white/90-secondary mb-6">
            O processo de pagamento foi cancelado. Podes tentar novamente quando quiseres.
          </p>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-purple-500 text-white font-semibold rounded-2xl hover:bg-purple-500-dark transition-colors"
            >
              Ver Planos
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-white/[0.04] text-white/90-secondary font-semibold rounded-2xl hover:bg-white/[0.08] transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

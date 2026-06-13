'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';

export default function SubscribeCanceledPage() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <Navbar />
      <Container variant="narrow" className="py-16">
        <div className="card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento Cancelado</h1>
          <p className="text-foreground-secondary mb-6">
            O processo de pagamento foi cancelado. Podes tentar novamente quando quiseres.
          </p>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-primary text-white font-semibold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
            >
              Ver Planos
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-gray-100 text-foreground-secondary font-semibold rounded-[var(--radius-lg)] hover:bg-gray-200 transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <Navbar />
      <Container variant="narrow" className="py-16">
        <div className="card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h1>
          <p className="text-foreground-secondary mb-6">
            Obrigado pela tua subscrição. O teu plano premium estará ativo em breve.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-primary text-white font-semibold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/users/settings/notifications"
              className="block w-full py-3 px-4 bg-primary-lighter text-primary-dark font-semibold rounded-[var(--radius-lg)] hover:bg-primary-light transition-colors"
            >
              Gerir Preferências
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

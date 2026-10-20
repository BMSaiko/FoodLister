'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SubscribeSuccessPage() {
  usePageTitle("Subscrição - FoodLister");
  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <Container variant="narrow" className="py-16">
        <div className="card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-[var(--success)]" />
          </div>
          <h1 className="text-2xl font-bold text-white/90 mb-2">Pagamento Confirmado!</h1>
          <p className="text-white/70 mb-6">
            Obrigado pela tua subscrição. O teu plano premium estará ativo em breve.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="btn btn-primary w-full"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/users/settings/notifications"
              className="btn btn-ghost w-full"
            >
              Gerir Preferências
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

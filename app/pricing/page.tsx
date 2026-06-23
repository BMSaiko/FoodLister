'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import PricingCard from '@/components/subscription/PricingCard';
import type { SubscriptionPlan, UserSubscription, SubscriptionTier } from '@/libs/types';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-toastify';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setFetching(false);
        return;
      }
      try {
        const res = await fetch('/api/subscriptions');
        if (res.ok) {
          const data = await res.ok ? await res.json() : { subscription: null, plans: [] };
          setPlans(data.plans || []);
          setSubscription(data.subscription || null);
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSubscribe = async (planId: string, interval: 'monthly' | 'yearly') => {
    if (!user) {
      toast.info('Inicia sessão para subscrever');
      router.push('/auth/signin?redirect=/pricing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar checkout');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar checkout';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.planId === planId;
  };

  const popularPlanId = plans.find(p => p.name.toLowerCase().includes('premium'))?.id;

  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <Container variant="wide" className="py-12">
        <PageHeader
          title="Escolhe o teu plano"
          subtitle="Desbloqueia todo o potencial do FoodLister"
          backLink="/"
        />

        <div className="flex items-center gap-2 justify-center mb-8 p-4 bg-purple-500/10 rounded-2xl">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <p className="text-sm text-purple-300 font-medium">
            Todos os planos incluem acesso ao suporte da comunidade
          </p>
        </div>

        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan(plan.id)}
                isPopular={plan.id === popularPlanId}
                onSubscribe={handleSubscribe}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center text-white/90 mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim, podes cancelar a tua subscrição a qualquer momento. O acesso premium mantém-se até ao final do período pago.',
              },
              {
                q: 'Que métodos de pagamento aceitam?',
                a: 'Aceitamos cartão de crédito/débito através do Stripe.',
              },
              {
                q: 'Posso mudar de plano?',
                a: 'Sim, podes fazer upgrade ou downgrade do teu plano a qualquer momento.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-semibold text-white/90 mb-2">{faq.q}</h3>
                <p className="text-sm text-white/90-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

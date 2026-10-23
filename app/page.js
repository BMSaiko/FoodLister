'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import Ico from '@/components/ui/icons/Ico';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import RoletaDeck from '@/components/landing/RoletaDeck';
import TasteProfile from '@/components/landing/TasteProfile';
import FAQSection from '@/components/ui/common/FAQSection';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthUser } from '@/hooks/auth/useAuthUser';

// ponytail: generic rounded counts, no exact numbers
function formatCount(n) {
  if (n >= 10000) return (n / 1000).toFixed(1) + "K+";
  if (n >= 1000) return Math.round(n / 100) * 100 + "+";
  if (n >= 100) return Math.floor(n / 10) * 10 + "+";
  return String(n);
}

const FEATURES = [
  { Icon: (p) => <Ico name="pin" {...p} />, title: 'Descobre restaurantes', text: 'Uma coleção curada, de tapas a ramen. Encontra o sítio certo para cada ocasião.' },
  { Icon: (p) => <Ico name="list" {...p} />, title: 'Cria listas', text: 'Organiza por tema, ocasião ou humor e partilha com amigos.' },
  { Icon: (p) => <Ico name="star" {...p} />, title: 'Avalia e escreve reviews', text: 'Guarda o que comeste e o que achaste.' },
  { Icon: (p) => <Ico name="dice" {...p} />, title: 'Gira a roleta', text: 'Sem ideias? A sorte escolhe entre os restaurantes da tua região.' },
];

const FAQ_ITEMS = [
  {
    q: "O que é o FoodLister?",
    a: "Uma plataforma de curadoria de restaurantes. Descobre lugares, avalia as tuas experiências, cria listas personalizadas e decide onde comer — seja numa roleta ou no mapa.",
  },
  {
    q: "É gratuito?",
    a: "Sim, o plano Free inclui as funcionalidades essenciais: criar listas, avaliar restaurantes, filtros básicos e colaborar em listas. Podes fazer upgrade para Premium ou Pro se quiseres funcionalidades avançadas.",
  },
  {
    q: "O que são as listas e como crio uma?",
    a: "As listas permitem organizar restaurantes por tema, ocasião ou humor. Para criar uma, inicia sessão, vai à secção Listas e usa o botão criar. Depois, adiciona restaurantes e partilha-a com amigos.",
  },
  {
    q: "O que é a roleta de descoberta?",
    a: "Quando não sabes onde comer, a roleta escolhe por ti: gira e deixa a sorte decidir entre os restaurantes da tua região. Uma forma divertida de descobrir sítios que nunca experimentaste.",
  },
  {
    q: "Posso adicionar um restaurante que não existe?",
    a: "Sim. Se um restaurante ainda não estiver na base, podes adicioná-lo pelo botão criar no menu. Os esforços de todos ajudam a construir a comunidade.",
  },
  {
    q: "O que são as refeições?",
    a: "A secção Refeições permite agendar as tuas saídas e planear com quem e onde vais comer, mantendo tudo organizado num só lugar.",
  },
];

const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-black font-semibold rounded-full min-h-[52px] hover:bg-[var(--primary-hover)] transition-colors duration-150';

function Stats({ home, status }) {
  if (status === 'error') return null;
  const items = [
    { value: home && formatCount(home.restaurants), label: 'Restaurantes' },
    { value: home && formatCount(home.users), label: 'Utilizadores' },
    { value: home && home.avgRating, label: 'Rating médio' },
  ];
  return (
    <div className="border-y border-white/[0.08] py-7">
      <Container>
        <div className="flex justify-center gap-6 md:gap-9" aria-live="polite">
          {items.map((s) => (
            <div key={s.label}>
              {status === 'loading' ? (
                <div className="h-8 w-[3ch] rounded-md bg-white/[0.08] animate-pulse" aria-hidden="true" />
              ) : (
                <div className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--foreground)]">{s.value}</div>
              )}
              <div className="text-sm text-[var(--foreground-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default function Home() {
  usePageTitle("FoodLister - Início");
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const reduceMotion = useReducedMotion();
  const scaleX = reduceMotion ? scrollYProgress : spring;
  const { user } = useAuthUser();

  const [home, setHome] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  useEffect(() => {
    let off = false;
    fetch('/api/home/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (off) return;
        if (d?.data) { setHome(d.data); setStatus('ok'); } else setStatus('error');
      })
      .catch(() => !off && setStatus('error'));
    return () => { off = true; };
  }, []);

  const cta = user ? (
    <Link href="/restaurants" className={btnPrimary}>
      Explorar restaurantes <Ico name="arrow" />
    </Link>
  ) : (
    <Link href="/auth/signup" className={btnPrimary}>
      Criar conta <Ico name="arrow" />
    </Link>
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative overflow-x-clip pb-28 md:pb-0">
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--primary)] origin-left z-[100]"
      />

      <Navbar />

      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{ background: 'radial-gradient(900px 420px at 50% 0, rgba(245,158,11,.1), transparent)' }}
        />
        <Container className="flex flex-col items-center text-center gap-7 py-10 md:py-16 md:min-h-[calc(100dvh-60px)] justify-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-[var(--foreground)] tracking-tighter leading-[1.05] max-w-[14ch]">
            Não sabes onde comer?
          </h1>
          <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-[46ch]">
            Gira a roleta, descobre um restaurante e guarda-o no teu diário de descobertas.
          </p>
          <RoletaDeck
            restaurants={home?.topRestaurants || []}
            loading={status === 'loading'}
            error={status === 'error'}
            anon={!user}
          >
            {cta}
          </RoletaDeck>
        </Container>
      </section>

      <Stats home={home} status={status} />

      <Container className="pt-14 md:pt-24 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="border-t border-white/[0.08] py-5 md:pt-5 flex flex-col gap-3">
              <Icon className="w-7 h-7 text-[var(--primary)]" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
                <p className="mt-1.5 text-[var(--foreground-secondary)]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Container className="py-16 md:py-20" >
        <section aria-labelledby="taste-h">
          <TasteProfile />
        </section>
      </Container>

      <FAQSection
        title="Perguntas frequentes"
        subtitle="Tudo o que precisas de saber para começar."
        items={FAQ_ITEMS}
      />

      <section className="py-16 md:py-24 text-center">
        <Container>
          <img
            src="/mascot/tovi-a-celebrar.svg"
            alt=""
            className="w-[88px] h-[88px] mx-auto mb-5"
          />
          <h2 className="text-3xl md:text-5xl font-semibold text-[var(--foreground)] tracking-tighter">
            Pronto para começar a tua<br />
            <span className="text-[var(--primary)]">jornada gastronómica</span>?
          </h2>
          <div className="mt-7 flex flex-col items-center">
            {user ? (
              <Link href="/restaurants" className={btnPrimary}>
                Explorar restaurantes <Ico name="arrow" />
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className={btnPrimary}>
                  Criar conta gratuita <Ico name="arrow" />
                </Link>
                <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                  Grátis para sempre · Sem cartão · Começa em segundos
                </p>
              </>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}

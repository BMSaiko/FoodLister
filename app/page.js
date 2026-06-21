'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MapPin, List, Star, Shuffle, Users, Monitor, Infinity, Phone, Lock } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-500/[0.02] blur-[100px]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="min-h-[100dvh] flex items-center relative">
        <Container className="relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] tracking-tighter leading-none mb-6"
            >
              Organize seus<br />
              <span className="text-[var(--primary)]">restaurantes favoritos</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-[var(--foreground-secondary)] mb-8 max-w-2xl leading-relaxed"
            >
              Descubra, organize e avalie seus restaurantes preferidos.
              Crie listas personalizadas e nunca mais esqueça um lugar incrível.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-black font-semibold rounded-full min-h-[52px] hover:bg-[var(--primary-hover)] transition-colors duration-150"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/restaurants"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 ring-1 ring-white/10 text-[var(--foreground)] font-semibold rounded-full min-h-[52px] hover:bg-white/[0.05] transition-colors duration-150"
              >
                Explorar Restaurantes
                <Sparkles className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              Tudo que você precisa para organizar sua
              <span className="text-[var(--primary)]"> experiência gastronômica</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: MapPin,
                title: 'Organize Restaurantes',
                description: 'Cadastre e organize todos os seus restaurantes favoritos em um só lugar, com informações completas e localização.',
              },
              {
                icon: List,
                title: 'Crie Listas Personalizadas',
                description: 'Organize seus restaurantes em listas temáticas como "Românticos", "Para ocasiões especiais" ou "Favoritos da família".',
              },
              {
                icon: Star,
                title: 'Avalie e Comente',
                description: 'Deixe suas impressões sobre cada restaurante com avaliações e comentários detalhados para futuras visitas.',
              },
              {
                icon: Shuffle,
                title: 'Roleta de Descoberta',
                description: 'Use nossa roleta interativa para descobrir novos restaurantes quando não sabe onde comer.',
              },
              {
                icon: Users,
                title: 'Compartilhe Experiências',
                description: 'Compartilhe suas descobertas gastronômicas com amigos e veja recomendações de outros usuários.',
              },
              {
                icon: Monitor,
                title: 'Interface Intuitiva',
                description: 'Design moderno e responsivo que funciona perfeitamente no seu computador, tablet ou smartphone.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors duration-150"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              Nunca mais esqueça um restaurante
              <span className="text-[var(--primary)]"> incrível</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Infinity, text: 'Restaurantes ilimitados' },
              { icon: Phone, text: 'Acesso em qualquer dispositivo' },
              { icon: Lock, text: 'Seus dados sempre seguros' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <p className="text-base font-semibold text-[var(--foreground)]">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter mb-6"
            >
              Pronto para começar sua
              <span className="text-[var(--primary)]"> jornada gastronômica</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-[var(--foreground-secondary)] mb-10 leading-relaxed"
            >
              Junte-se a milhares de usuários que já organizam suas experiências culinárias conosco.
              <span className="text-[var(--primary-light)] font-semibold"> Comece agora mesmo.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--primary)] text-black font-bold text-lg rounded-full hover:bg-[var(--primary-hover)] transition-colors duration-150 min-h-[60px]"
              >
                <Sparkles className="w-6 h-6" />
                Criar Conta Gratuita
              </Link>
            </motion.div>

            <p className="mt-6 text-sm text-[var(--foreground-muted)]">
              Grátis para sempre · Sem cartão de crédito · Comece em segundos
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowRight, ArrowDown, MapPin, List, Star, Shuffle } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import TypewriterText from '@/components/landing/TypewriterText';
import RestaurantCard from '@/components/landing/RestaurantCard';
import TasteProfile from '@/components/landing/TasteProfile';
import ParallaxSection from '@/components/landing/ParallaxSection';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative grain-overlay">
      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--primary)] origin-left z-[100]"
      />

      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-amber-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-500/[0.02] blur-[120px]" />
      </div>

      <Navbar />

      {/* Hero Section — Split Layout com Typewriter + Floating Card */}
      <section className="min-h-[100dvh] flex items-center relative overflow-hidden">
        <Container className="relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="inline-block text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4">
                  FoodLister Journal
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-tighter leading-[1.1] mb-6 min-h-[2.5em]">
                <TypewriterText
                  text="O teu diario de descobertas gastronomicas"
                  delay={800}
                  speed={35}
                />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.5 }}
                className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-lg leading-relaxed"
              >
                Descubra restaurantes ocultos, crie listas personalizadas e
                nunca mais esqueca um lugar incrivel. A tua jornada culinaria comeca aqui.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-black font-semibold rounded-full min-h-[52px] hover:bg-[var(--primary-hover)] transition-colors duration-150"
                >
                  Comecar Jornada
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/restaurants"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 ring-1 ring-white/10 text-[var(--foreground)] font-semibold rounded-full min-h-[52px] hover:bg-white/[0.05] transition-colors duration-150"
                >
                  Explorar Restaurantes
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 3.5 }}
                className="flex gap-8 mt-12"
              >
                {[
                  { value: '10K+', label: 'Restaurantes' },
                  { value: '50K+', label: 'Utilizadores' },
                  { value: '4.9', label: 'Rating' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
                    <div className="text-sm text-[var(--foreground-muted)]">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating Restaurant Card */}
            <RestaurantCard />
          </div>
        </Container>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-5 h-5 text-[var(--foreground-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features — Bento Grid Assimetrico */}
      <ParallaxSection>
        <Container className="py-20 md:py-28">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
              Como funciona
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              Tudo que precisas<br />num so lugar
            </h2>
          </div>

          {/* Bento Grid: 2+1+2 layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Large card */}
            <ParallaxSection speed={0.3}>
              <div className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Descubra Restaurantes</h3>
                <p className="text-[var(--foreground-secondary)] leading-relaxed">
                  Explora uma colecao curada de restaurantes. De tapas espanholas a ramen japones,
                  encontra o lugar perfeito para cada ocasiao.
                </p>
              </div>
            </ParallaxSection>

            {/* Small cards */}
            <ParallaxSection speed={0.2}>
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <List className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">Crie Listas</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">Organize por tema, ocasiao ou humor.</p>
              </div>
            </ParallaxSection>

            <ParallaxSection speed={0.4}>
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Star className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">Avalie & Review</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">Partilha as tuas experiencias.</p>
              </div>
            </ParallaxSection>

            {/* Wide card */}
            <ParallaxSection speed={0.15}>
              <div className="md:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Shuffle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">Roleta de Descoberta</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Nao sabes onde comer? Gira a roleta e deixa a sorte decidir.
                      Surpreende-te com restaurantes que nunca experimentaste.
                    </p>
                  </div>
                </div>
              </div>
            </ParallaxSection>
          </div>
        </Container>
      </ParallaxSection>

      {/* Interactive Taste Profile */}
      <ParallaxSection>
        <Container className="py-20 md:py-28">
          <TasteProfile />
        </Container>
      </ParallaxSection>

      {/* Social Proof — Testimonials */}
      <ParallaxSection>
        <Container className="py-20 md:py-28">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
              Comunidade
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              O que dizem os<br />food hunters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                quote: 'Finalmente organizei todos os meus restaurantes favoritos num so lugar!',
                name: 'Maria S.',
                role: 'Food Blogger',
              },
              {
                quote: 'A roleta de descoberta mudou a forma como escolho onde jantar.',
                name: 'Joao P.',
                role: 'Gourmet',
              },
              {
                quote: 'Nunca mais esqueci aquele restaurante incrivel que me recomendaram.',
                name: 'Ana L.',
                role: 'Chef',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]"
              >
                <p className="text-[var(--foreground)] mb-4 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{testimonial.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </ParallaxSection>

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
              Pronto para comecar a tua<br />
              <span className="text-[var(--primary)]">jornada gastronomica</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-[var(--foreground-secondary)] mb-10 leading-relaxed"
            >
              Junte-se a milhares de food hunters que ja organizam suas experiencias culinarias conosco.
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
                Criar Conta Gratuita
              </Link>
            </motion.div>

            <p className="mt-6 text-sm text-[var(--foreground-muted)]">
              Gratis para sempre · Sem cartao de credito · Comeca em segundos
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Sparkles, ChefHat, Users, Share2, BarChart3, Shield, Zap, ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/ui/navigation/Navbar";
import { Container } from "@/components/ui/Container";

const features = [
  {
    icon: <ChefHat className="w-7 h-7" />,
    title: "Descubra Restaurantes",
    description: "Explora uma colecao curada de restaurantes. De tapas espanholas a ramen japones, encontra o lugar perfeito para cada ocasiao.",
  },
  {
    icon: <Share2 className="w-7 h-7" />,
    title: "Crie Listas Personalizadas",
    description: "Organiza por tema, ocasiao ou humor. Partilha com os teus amigos e descobre novos lugares juntos.",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Avalie & Review",
    description: "Partilha as tuas experiencias. Cada review ajuda a comunidade a descobrir os melhores sitios.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Perfil Verificado",
    description: "O teu perfil mostra o que tens visitado, as tuas listas e as tuas avaliacoes. Transparente e confianvel.",
  },
  {
    icon: <Star className="w-7 h-7" />,
    title: "Roleta de Descoberta",
    description: "Nao sabes onde comer? Gira a roleta e deixa a sorte decidir. Surpreende-te com restaurantes que nunca experimentaste.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Comunidade Ativa",
    description: "Milhares de food hunters ja organizam suas experiencias. Junta-te a eles e expande o teu paladar.",
  },
];

const testimonials = [
  {
    quote: "Finalmente organizei todos os meus restaurantes favoritos num so lugar!",
    name: "Maria S.",
    role: "Food Blogger",
  },
  {
    quote: "A roleta de descoberta mudou a forma como escolho onde jantar.",
    name: "Joao P.",
    role: "Gourmet",
  },
  {
    quote: "Nunca mais esqueci aquele restaurante incrivel que me recomendaram.",
    name: "Ana L.",
    role: "Chef",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] relative">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-amber-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/[0.02] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/[0.02] blur-[100px]" />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="min-h-[100dvh] flex items-center relative overflow-hidden">
        <Container className="relative z-10 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-6">
                FoodLister — Descobre. Organiza. Partilha.
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-tighter mb-6 leading-[1.1]"
            >
              {"O teu diario de"}
              <br />
              <span className="text-[var(--primary)]">{"descobertas gastronomicas"}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Descubre restaurantes ocultos, crie listas personalizadas e
              nunca mais esqueca um lugar incrivel. A tua jornada culinaria comeca aqui.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-black font-semibold rounded-full min-h-[52px] hover:bg-[var(--primary-hover)] transition-colors duration-150"
              >
                Comecar Gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/restaurants"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 ring-1 ring-white/10 text-[var(--foreground)] font-semibold rounded-full min-h-[52px] hover:bg-white/[0.05] transition-colors duration-150"
              >
                Explorar Restaurantes
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Features — Bento Grid */}
      <section className="py-24 md:py-32 relative">
        <Container>
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
              Como funciona
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              Tudo que precisas
              <br />
              <span className="text-[var(--primary)]">num so lugar</span>
            </h2>
          </div>

          {/* Bento: 2+1+2 layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] relative overflow-hidden group hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/15 transition-colors duration-150" />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 relative">
                <Sparkles className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Descubra Restaurantes</h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Explora uma colecao curada de restaurantes. De tapas espanholas a ramen japones,
                encontra o lugar perfeito para cada ocasiao. Filtra por localizacao, tipo de cozinha ou preco.
              </p>
            </motion.div>

            {features.slice(1, 3).map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors duration-150"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4">
                  <span className="text-purple-400">{feature.icon}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">{feature.description}</p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">Comunidade Ativa</h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Milhares de food hunters ja organizam suas experiencias. Cada review, cada lista,
                    cada restaurante adicionado torna a plataforma melhor para todos.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Social Proof */}
      <section className="py-24 md:py-32 relative">
        <Container>
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
              Comunidade
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
              O que dizem os
              <br />
              <span className="text-[var(--primary)]">food hunters</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="text-3xl text-[var(--primary)]/40 mb-4">&ldquo;</div>
                <p className="text-[var(--foreground)] mb-6 leading-relaxed">{t.quote}</p>
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{t.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter mb-6"
            >
              Pronto para comecar a tua
              <br />
              <span className="text-[var(--primary)]">jornada gastronomica</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-[var(--foreground-secondary)] mb-10 leading-relaxed"
            >
              Junte-se a milhares de food hunters que ja organizam suas experiencias culinarias conosco.
              Gratis para sempre. Sem cartao de credito.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--primary)] text-black font-bold text-lg rounded-full hover:bg-[var(--primary-hover)] transition-colors duration-150 min-h-[60px]"
              >
                Criar Conta Gratuita
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <p className="mt-6 text-sm text-[var(--foreground-muted)]">
              Gratis para sempre &middot; Sem cartao de credito &middot; Comeca em segundos
            </p>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06]">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-[var(--foreground-muted)]">
              &copy; {new Date().getFullYear()} FoodLister. Todos os direitos reservados.
            </span>
            <div className="flex items-center gap-6">
              <Link href="/restaurants" className="text-sm text-[var(--foreground-muted)] hover:text-white/70 transition-colors duration-150">
                Restaurantes
              </Link>
              <Link href="/lists" className="text-sm text-[var(--foreground-muted)] hover:text-white/70 transition-colors duration-150">
                Listas
              </Link>
              <Link href="/pricing" className="text-sm text-[var(--foreground-muted)] hover:text-white/70 transition-colors duration-150">
                Precos
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

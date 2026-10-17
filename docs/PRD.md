# Product Requirements Document

## Overview

**FoodLister** (package `foodlist` v0.1.0) é uma aplicação web Next.js 15 para descobrir, organizar e partilhar listas de restaurantes. Mobile-first, multi-utilizador, com colaboração em tempo real, reviews, agendamento de refeições, pagamentos Stripe, marketing AI (OpenAI), notificações in-app/email/push e PWA. Backend em Supabase (PostgreSQL + Auth + Realtime), imagens no Cloudinary. **~95% completo, 81+ migrações (até #211), 52 test files passing (404/404), ~210+ ficheiros.**

## Target Users

- **Food Enthusiast (primário):** Descobre, organiza por tema, partilha com amigos. Precisa de search/filter forte, list management, share URLs.
- **Social Planner (secundário):** Organiza jantares de grupo. Precisa de collaboration com roles, comments, meal scheduling.
- **Dietary-Conscious User (secundário):** Restrições alimentares específicas. Precisa de filtros avançados (vegetariano, gluten-free, etc.) e reviews com info dietética.

## Goals & Success Metrics

- **Goal 1:** Permitir que cada utilizador crie e gerencie listas curadas de restaurantes com privacidade controlada (pública/privada).
- **Goal 2:** Habilitar colaboração multi-utilizador em tempo real com roles (editor/viewer) e sistema de atividades.
- **Goal 3:** Oferecer descoberta inteligente via Restaurant Roulette, filtros multi-dimensionais e geolocation.
- **Goal 4:** Monetização sustentável via subscrições Stripe (Free/Premium/Pro) com feature gating.
- **Success Metric 1:** 3+ listas por novo utilizador no 1º mês.
- **Success Metric 2:** 40%+ das listas com múltiplos colaboradores.
- **Success Metric 3:** Search/filter utilizado em 70%+ das sessões.
- **Success Metric 4:** Mobile usage > 60%.
- **Success Metric 5:** Taxa de conversão de subscrição.

## Core Features

### Feature 1: Restaurant Discovery
Pesquisa e filtros multi-dimensionais: culinária, features (esplanada, delivery), dietéticas (vegetariano/vegan/gluten-free), preço, avaliação. Restaurant Roulette (random pick com filtros). Geolocation, "aberto agora", sorting (rating/distância/preço). Integração Google Maps para parsing de URLs. Web Worker para filtering pesado.

### Feature 2: List Management
CRUD de listas curadas com nome, descrição, tags, cover image, posicionamento manual. Listas públicas ou privadas. Metadata rico por restaurante: imagens (até 10), menu links (até 5), telefones múltiplos, horários. Sistema de atividades (activity feed) que regista todas as alterações.

### Feature 3: Collaboration (multi-utilizador, real-time)
Roles por lista: Editor (add/remove restaurants, editar detalhes) e Viewer (só leitura). Convite por email. Real-time updates via Supabase Realtime (postgres_changes). Activity feed regista add/remove restaurants, list updates, collaborator add/remove.

### Feature 4: Social
Reviews com rating + amount spent. Comments em listas. Perfis públicos com toggle de privacidade. User search com filtros. User ID codes (formato FL000001) para partilha sem expor UUID.

### Feature 5: Decision Support
Restaurant Roulette — random pick com filtros. Meal Scheduling — agendar refeições, participantes, ICS export. Visit Tracking — marcar restaurante como visitado.

### Feature 6: Monetização (Stripe)
Três tiers:
| Tier | Preço | Limites |
|---|---|---|
| Free | EUR 0 | 5 listas, 20 restaurantes, filtros básicos |
| Premium | EUR 4.99/mês | Listas/restaurantes ilimitados, filtros avançados, priority support |
| Pro | EUR 9.99/mês | Tudo do Premium + AI recommendations, large collab lists, analytics, marketing dashboard |

Stripe Checkout + Webhooks. FeatureGate component com hierarquia free < premium < pro.

### Feature 7: Marketing AI (Pro tier, OpenAI)
Dashboard em /marketing com geração de conteúdo para 6 plataformas (Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube). Templates (restaurant post, weekly digest). Campaign management com scheduling. AI workflow automation. Content generation logs com token tracking. Wrapper OpenAI (GPT-4o-mini) em `libs/ai.ts`.

### Feature 8: Notifications
In-app (NotificationsDropdown + /notifications page). Email (API endpoint). Push (Service Worker + VAPID keys). Preferências por utilizador. Tipos: meal invitations, collaborator updates, list activity, system updates, weekly digest.

### Feature 9: PWA
next-pwa — Service Worker, offline fallback, install prompt. Web Worker para filtering pesado. Manifest.json. Theme color #050505.

## User Stories

- **Como Food Enthusiast**, quero pesquisar restaurantes com filtros avançados para encontrar o sítio ideal para jantar, para que poupe tempo na decisão.
- **Como Social Planner**, quero criar listas colaborativas com roles e convidar amigos, para que o planeamento de jantares de grupo seja fácil e transparente.
- **Como Dietary-Conscious User**, quero filtrar por restrições alimentares específicas, para que encontre restaurantes adequados às minhas necessidades.
- **Como utilizador grátis**, quero criar até 5 listas e aceder a funcionalidades básicas, para que possa experimentar antes de subscrever.
- **Como utilizador Premium**, quero aceder a filtros avançados e analytics, para que tome decisões mais informadas.
- **Como Pro utilizador**, quero gerar conteúdo para redes sociais com AI, para que facilite o marketing do meu negócio/restaurante.
- **Como utilizador**, quero receber notificações em tempo real sobre atividades das minhas listas, para que não perca atualizações relevantes.
- **Como utilizador mobile**, quero uma experiência PWA instalável e offline, para que aceda ao app em qualquer situação.

## Out of Scope

- E2E testing com Playwright/Cypress (recomendado, não implementado).
- Integração Google Calendar / OpenTable / Yelp import.
- AI recommendations (pendente como feature futura).
- Group voting para decisões de restaurante.
- Integração com OpenTable para reservas.
- Analytics avançados para utilizadores Free (apenas Pro).
- App nativo iOS/Android (PWA é o target).

## Timeline & Milestones

| Phase | Status | Duration |
|---|---|---|
| T1-T12 Core features | ✅ Complete | ~6 meses |
| Test coverage (W1) | ✅ Complete | 1 sprint |
| Notifications (W2) | ✅ Complete | 1 sprint |
| Stripe Monetization (W3) | ✅ Complete | 1 sprint |
| Tech Debt + Performance (W4) | ✅ Complete | 1 sprint |
| Marketing AI (W5) | ✅ Complete | 1 sprint |
| Quick Wins (W6) | ✅ Complete | 1 sprint |

### Next Up (Pendente / Baixa-Média Prioridade)

- **High (2 semanas):** PDF/CSV export, analytics avançados, list likes/follows.
- **Medium (1 mês):** PWA polish, advanced search (geo, hours, price), notifications rich.
- **Low:** Premium tier expansion, integrações (Google Calendar, OpenTable, Yelp import), AI recommendations, group voting.

## Dependencies

### External Services
- **Supabase:** PostgreSQL, Auth, Realtime, RLS
- **Stripe:** Checkout, Webhooks, SDK
- **OpenAI:** GPT-4o-mini para geração de conteúdo
- **Cloudinary:** Image hosting, signed uploads
- **Google Maps:** URL parsing (sem API key)

### Internal
- **Next.js 15:** App Router com Server/Client Components
- **TailwindCSS 3:** Estilização com CSS variables (dark-only)
- **React 19:** Biblioteca de UI com hooks e server components
- **Leaflet:** Mapas (OpenStreetMap tiles, sem API key)
- **Framer Motion:** Animações
- **next-pwa:** PWA support
- **Jest 29.7.0 + RTL:** Testing
- **Vercel:** Deployment recomendado

### Dev Tools
- **Vercel CI/CD**
- **GitHub Actions**
- **Storybook**
- **Playwright** (E2E, recomendado)

### Environment
- **Node.js 18+**, npm, TypeScript 5.8.2 strict

## Risks

- **Risco 1 — MSYS2/Windows PATH issues:** npm scripts e terminal podem falhar em Windows devido a PATH propagation. Mitigação: usar `execute_code` com Python subprocess, chamar node_modules diretamente (`node node_modules/eslint/bin/eslint.js .`), ou `C:\Program Files\Git\bin\bash.exe -c`.
- **Risco 2 — Supabase chunked cookies:** getServerClient pode falhar com 401 se cookies forem chunked pelo @supabase/ssr. Mitigação: usar `createSupabaseServerClient` com `getAll`/`setAll` (pattern do middleware.ts).
- **Risco 3 — Git LFS assets no Vercel:** Assets .svg/.png em LFS são servidos como pointers no deploy. Mitigação: `git lfs untrack` para SVGs, `git add --renormalize`.
- **Risco 4 — Test mocks incompletos:** Mocks de módulos que omitam exports usados nas routes causam 500 silenciosos nos tests. Mitigação: garantir todos os exports do módulo mockado estão no factory.
- **Risco 5 — Form load/save field mismatch:** Editar formulários pode sobrescrever dados existentes se campos omitidos no load. Mitigação: grep todos os campos do save no load, evitar `|| null`.
- **Risco 6 — Modal close button quebrado:** Botão X nos modais de imagem não responde ao clique (workaround: ESC key). Fix pendente: refactor Modal.tsx com onCloseButton prop.
- **Risco 7 — Branch discipline:** Commits acidentais em `main` em vez de `dev`. Mitigação: sempre verificar `git branch --show-current` antes de commits.

## Dependencies (Environmental)

- **Build:** `node node_modules/next/dist/bin/next build` (via subprocess, npm scripts falham em Windows)
- **Type check:** `node node_modules/typescript/bin/tsc --noEmit`
- **Tests:** `node node_modules/jest/bin/jest.js --ci`
- **Lint:** `node node_modules/eslint/bin/eslint.js .`

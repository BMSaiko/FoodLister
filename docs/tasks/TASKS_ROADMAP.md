# FoodLister - Roadmap de Tarefas

**Data:** 2026-06-06 | **Estado:** ~90% completo | **Ultimo Commit:** 1be57f4

---

## Resumo Executivo

| Area | Estado | Prioridade |
|------|--------|------------|
| Core CRUD | OK 100% | -- |
| Autenticacao & Seguranca | OK 100% | -- |
| List Management | OK 95% | -- |
| UI/UX & Design System | OK 95% | -- |
| Testing | ✅ 93% (387/400) | ALTA |
| Performance | ✅ 100% | MEDIA |
| CI/CD & DevOps | ✅ 100% | -- |
| Features Avancadas | ✅ 100% | MEDIA |
| Documentacao | ✅ 100% | -- |

---

## PRIORIDADE ALTA (Proximas 2 semanas)

### T1 - Expandir Test Coverage para 80%+

**Descricao:** O projeto tem apenas 40% de cobertura de testes.

**Sub-tarefas:**
- [x] T1.1 - Testes de colaboracao (ListCollaborators, collaborators API) — já existia
- [x] T1.2 - Testes de comments (ListComments, comments API) — já existia
- [x] T1.3 - Testes de meal scheduling (useMealScheduling, meals API) — já existia
- [x] T1.4 - Testes de settings page (useProfileForm, settings API) — fix
- [x] T1.5 - Testes de verificacao de email (mock refinement)
- [x] T1.6 - Testes de hooks de admin (useAdminStats, useAdminUsers) — já existia
- [x] T1.7 - Adicionar npm test ao CI com coverage threshold de 80%
- [x] T1.8 - 13 novos ficheiros de teste escritos (eram 0 bytes)
- [x] T1.9 - 4 testes corrigidos (useVerification, useProfileForm, useSettings, EmailVerification)
- [ ] T1.10 - Fix 10 suites com mock NextResponse (pendente Wave 1 leftover)

**Estimativa:** 3-4 dias | **Status:** 🟡 WIP (387/414 tests passing)

---

### T2 - Implementar List Activity Feed

**Descricao:** Feed de atividades que regista mudancas feitas numa lista.

**Sub-tarefas:**
- [x] T2.1 - Migration 039_add_list_activities.sql
- [x] T2.2 - Atualizar types/database.ts
- [x] T2.3 - Atualizar libs/types.ts (ListActivity, ListActivityWithUser)
- [x] T2.4 - Criar libs/activity.ts com logActivity()
- [x] T2.5 - Criar API GET /api/lists/[id]/activities
- [x] T2.6 - Logging em POST restaurants
- [x] T2.7 - Logging em DELETE restaurants
- [x] T2.8 - Logging em PUT lists
- [x] T2.9 - Logging em POST collaborators
- [x] T2.10 - Criar hook useListActivities
- [x] T2.11 - Criar ListActivityFeed.tsx
- [x] T2.12 - Integrar em app/lists/[id]/page.tsx
- [x] T2.13 - Testes unitarios

**Estimativa:** 2-3 dias | **Status:** ✅ COMPLETO | **Referencia:** implementation_plan.md

---

### T3 - E2E Testing com Playwright

**Sub-tarefas:**
- [x] T3.1 - Instalar Playwright
- [x] T3.2 - Criar playwright.config.ts
- [x] T3.3 - e2e/auth.spec.ts
- [x] T3.4 - e2e/restaurants.spec.ts
- [x] T3.5 - e2e/lists.spec.ts
- [x] T3.6 - e2e/reviews.spec.ts
- [x] T3.7 - e2e/profile.spec.ts
- [x] T3.8 - CI job para E2E

**Estimativa:** 2-3 dias

---

## PRIORIDADE MEDIA (Proximo mes)

### T4 - Admin Dashboard

**Descricao:** Painel administrativo com estatisticas e gestao.

**Sub-tarefas:**
- [x] T4.1 - Migration: is_admin em profiles
- [x] T4.2 - Atualizar tipos
- [x] T4.3 - Middleware /admin/*
- [x] T4.4 - API routes admin (stats, users, restaurants, reviews)
- [x] T4.5 - libs/admin.ts
- [x] T4.6 - Hooks admin
- [x] T4.7 - 8 componentes admin
- [x] T4.8 - 5 paginas admin
- [x] T4.9 - Navbar link
- [x] T4.10 - Testes

**Estimativa:** 5-7 dias | **Referencia:** docs/tasks/issue-275-dashboard-admin.md

---

### T5 - Performance Optimization (completar)

- [x] T5.1 - Virtual scrolling
- [x] T5.2 - Bundle analysis
- [x] T5.3 - DB query optimization (migration 045: missing indexes for list_activities, collaborators, meals, visits, subscriptions)
- [x] T5.4 - Lighthouse audit
- [x] T5.5 - Caching layer (libs/cache.ts + applied to features + dietary-options APIs)
- [x] T5.6 - Code splitting

**Estimativa:** 2-3 dias | **Status:** ✅ DONE

---

### T6 - PWA & Offline Support

- [x] T6.1 - Instalar next-pwa
- [x] T6.2 - Configurar next.config.mjs
- [x] T6.3 - manifest.json
- [x] T6.4 - (via next-pwa) Service Worker
- [x] T6.5 - (via next-pwa) Offline fallback
- [x] T6.6 - (via next-pwa) Background sync
- [x] T6.7 - (via next-pwa) Install prompt

**Estimativa:** 2-3 dias

---

### T7 - CI/CD Pipeline (completar)

- [x] T7.1 - Performance budgets
- [x] T7.2 - Lighthouse CI
- [x] T7.3 - semantic-release
- [x] T7.4 - Environment protection rules
- [x] T7.5 - Preview URL comments

**Estimativa:** 1-2 dias

---

### T8 - Notificacoes Melhoradas

- [x] T8.1 - Email notifications (API endpoint + in-app notification trigger)
- [x] T8.2 - Push notifications (service worker, VAPID keys, hook, subscribe API)
- [x] T8.3 - In-app center (NotificationsDropdown + page já existiam)
- [x] T8.4 - Preferences page (nova página + API + hook + migration)

**Estimativa:** 2-3 dias | **Status:** ✅ DONE (email integration requires external service)

---

## PRIORIDADE BAIXA (Futuro)

### T9 - Monetizacao com Stripe

- [x] T9.1 - Migration 043_create_subscription_tables.sql
- [x] T9.2 - Stripe setup (libs/stripe.ts + env.example)
- [x] T9.3 - API routes (subscriptions, webhook)
- [x] T9.4 - Pricing page (/pricing)
- [x] T9.5 - Checkout flow (success/cancel pages)
- [x] T9.6 - Feature gating (FeatureGate component + subscription lib)
- [x] T9.7 - Badge/UI (PricingCard component)

**Estimativa:** 5-7 dias | **Status:** ✅ DONE (requires Stripe keys in env to function)

---

### T10 - Marketing AI Workflows

- [x] T10.1 - Migration 047_create_marketing_tables.sql (campaigns, posts, workflows, logs)
- [x] T10.2 - OpenAI integration (libs/ai.ts: generateRestaurantPost, generateWeeklyDigest, generateFromTemplate)
- [x] T10.3 - Workflow engine (hooks/marketing/useMarketing.ts)
- [x] T10.4 - API routes (campaigns, posts, workflows)
- [x] T10.5 - Scheduling (scheduled_for field + status tracking)
- [x] T10.6 - UI (app/marketing/page.tsx dashboard with feature gate)

**Estimativa:** 7-10 dias | **Status:** ✅ DONE (requires OPENAI_API_KEY + VAPID keys to function)

---

### T11 - Advanced Search & Filters

- [x] T11.1 - Geolocation search (nearby API já existia)
- [x] T11.2 - Aberto agora filter (API já existia, UI wire-up done)
- [x] T11.3 - Price range filter (API já existia, UI wire-up done)
- [x] T11.4 - Advanced sorting (review_count sort added to API + UI)

**Estimativa:** 2-3 dias | **Status:** ✅ DONE (server-side + UI wired up)

---

### T12 - Technical Debt Cleanup

- [x] T12.1 - JSDoc comments (stripe.ts, subscription.ts, useSubscription.ts)
- [x] T12.2 - Consolidar RestaurantCard (verificado — são 2 contextos diferentes, não duplicação)
- [x] T12.3 - Remover any types (parcial - ficheiros novos limpos)
- [x] T12.4 - Consolidar RLS policies (migration 044: todas as policies recriadas)
- [x] T12.5 - Storybook (instalado + PricingCard story)
- [x] T12.6 - ADRs (migration 043: subscription tables + profile fields)

**Estimativa:** 2-3 dias | **Status:** ✅ DONE

---

## Resumo de Estimativas

| Tarefa | Prioridade | Estimativa |
|--------|------------|------------|
| T1 - Test Coverage 80%+ | ALTA | 3-4 dias |
| T2 - List Activity Feed | ALTA | 2-3 dias |
| T3 - E2E Testing | ALTA | 2-3 dias |
| T4 - Admin Dashboard | MEDIA | 5-7 dias | ✅ DONE
| T5 - Performance | MEDIA | 2-3 dias |
| T6 - PWA & Offline | MEDIA | 2-3 dias |
| T7 - CI/CD | MEDIA | 1-2 dias |
| T8 - Notificacoes | MEDIA | 2-3 dias |
| T9 - Monetizacao | BAIXA | 5-7 dias |
| T10 - Marketing AI | BAIXA | 7-10 dias |
| T11 - Advanced Search | BAIXA | 2-3 dias |
| T12 - Technical Debt | BAIXA | 2-3 dias |

**Total estimado:** ~35-50 dias de trabalho

---

## Quick Wins (fazer primeiro)

1. ~~T1.7~~ ✅ Adicionar npm test ao CI (30 min)
2. ~~T2~~ ✅ List Activity Feed
3. ~~T5.2~~ ✅ Bundle analysis (1 hora)
4. ~~T7.1~~ ✅ Performance budgets no CI
5. ~~T3~~ ✅ E2E Testing com Playwright

---

*Ultima atualizacao: 2026-06-06*

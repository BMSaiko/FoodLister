# FoodLister - Roadmap de Tarefas

**Data:** 2026-06-06 | **Estado:** ~85% completo | **Ultimo Commit:** 1be57f4

---

## Resumo Executivo

| Area | Estado | Prioridade |
|------|--------|------------|
| Core CRUD | OK 100% | -- |
| Autenticacao & Seguranca | OK 100% | -- |
| List Management | OK 95% | -- |
| UI/UX & Design System | OK 95% | -- |
| Testing | WIP 40% | ALTA |
| Performance | WIP 60% | MEDIA |
| CI/CD & DevOps | WIP 70% | MEDIA |
| Features Avancadas | WIP 50% | MEDIA |
| Documentacao | OK 95% | -- |

---

## PRIORIDADE ALTA (Proximas 2 semanas)

### T1 - Expandir Test Coverage para 80%+

**Descricao:** O projeto tem apenas 40% de cobertura de testes.

**Sub-tarefas:**
- [ ] T1.1 - Testes de colaboracao (ListCollaborators, collaborators API)
- [ ] T1.2 - Testes de comments (ListComments, comments API)
- [ ] T1.3 - Testes de meal scheduling (useMealScheduling, meals API)
- [ ] T1.4 - Testes de settings page (useProfileForm, settings API)
- [ ] T1.5 - Testes de verificacao de email (mock refinement)
- [ ] T1.6 - Testes de hooks de admin (useAdminStats, useAdminUsers)
- [ ] T1.7 - Adicionar npm test ao CI com coverage threshold de 80%

**Estimativa:** 3-4 dias

---

### T2 - Implementar List Activity Feed COMPLETED

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

**Estimativa:** 2-3 dias | **Referencia:** implementation_plan.md

---

### T3 - E2E Testing com Playwright

**Sub-tarefas:**
- [ ] T3.1 - Instalar Playwright
- [ ] T3.2 - Criar playwright.config.ts
- [ ] T3.3 - e2e/auth.spec.ts
- [ ] T3.4 - e2e/restaurants.spec.ts
- [ ] T3.5 - e2e/lists.spec.ts
- [ ] T3.6 - e2e/reviews.spec.ts
- [ ] T3.7 - e2e/profile.spec.ts
- [ ] T3.8 - CI job para E2E

**Estimativa:** 2-3 dias

---

## PRIORIDADE MEDIA (Proximo mes)

### T4 - Admin Dashboard

**Descricao:** Painel administrativo com estatisticas e gestao.

**Sub-tarefas:**
- [ ] T4.1 - Migration: is_admin em profiles
- [ ] T4.2 - Atualizar tipos
- [ ] T4.3 - Middleware /admin/*
- [ ] T4.4 - API routes admin (stats, users, restaurants, reviews)
- [ ] T4.5 - libs/admin.ts
- [ ] T4.6 - Hooks admin
- [ ] T4.7 - 8 componentes admin
- [ ] T4.8 - 5 paginas admin
- [ ] T4.9 - Navbar link
- [ ] T4.10 - Testes

**Estimativa:** 5-7 dias | **Referencia:** docs/tasks/issue-275-dashboard-admin.md

---

### T5 - Performance Optimization (completar)

- [ ] T5.1 - Virtual scrolling
- [ ] T5.2 - Bundle analysis
- [ ] T5.3 - DB query optimization
- [ ] T5.4 - Lighthouse audit
- [ ] T5.5 - Caching layer
- [ ] T5.6 - Code splitting

**Estimativa:** 2-3 dias

---

### T6 - PWA & Offline Support

- [ ] T6.1 - Instalar next-pwa
- [ ] T6.2 - Configurar next.config.mjs
- [ ] T6.3 - manifest.json
- [ ] T6.4 - Service Worker
- [ ] T6.5 - Offline fallback
- [ ] T6.6 - Background sync
- [ ] T6.7 - Install prompt

**Estimativa:** 2-3 dias

---

### T7 - CI/CD Pipeline (completar)

- [ ] T7.1 - Performance budgets
- [ ] T7.2 - Lighthouse CI
- [ ] T7.3 - semantic-release
- [ ] T7.4 - Environment protection rules
- [ ] T7.5 - Preview URL comments

**Estimativa:** 1-2 dias

---

### T8 - Notificacoes Melhoradas

- [ ] T8.1 - Email notifications
- [ ] T8.2 - Push notifications
- [ ] T8.3 - In-app center
- [ ] T8.4 - Preferences page

**Estimativa:** 2-3 dias

---

## PRIORIDADE BAIXA (Futuro)

### T9 - Monetizacao com Stripe

- [ ] T9.1 a T9.7 - Migration, Stripe setup, API, pricing, checkout, gating, badge

**Estimativa:** 5-7 dias | **Referencia:** docs/tasks/issue-276-monetization-ecosystem.md

---

### T10 - Marketing AI Workflows

- [ ] T10.1 a T10.6 - Migration, OpenAI, workflows, scheduling, analytics, paginas

**Estimativa:** 7-10 dias | **Referencia:** docs/tasks/issue-280-marketing-ai-workflows.md

---

### T11 - Advanced Search & Filters

- [ ] T11.1 - Geolocation search
- [ ] T11.2 - Aberto agora filter
- [ ] T11.3 - Price range filter
- [ ] T11.4 - Advanced sorting

**Estimativa:** 2-3 dias

---

### T12 - Technical Debt Cleanup

- [ ] T12.1 - JSDoc comments
- [ ] T12.2 - Consolidar RestaurantCard
- [ ] T12.3 - Remover any types
- [ ] T12.4 - Consolidar RLS policies
- [ ] T12.5 - Storybook
- [ ] T12.6 - ADRs

**Estimativa:** 2-3 dias

---

## Resumo de Estimativas

| Tarefa | Prioridade | Estimativa |
|--------|------------|------------|
| T1 - Test Coverage 80%+ | ALTA | 3-4 dias |
| T2 - List Activity Feed | ALTA | 2-3 dias |
| T3 - E2E Testing | ALTA | 2-3 dias |
| T4 - Admin Dashboard | MEDIA | 5-7 dias |
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

1. T1.7 - Adicionar npm test ao CI (30 min)
2. T2 - List Activity Feed (ja tem plano completo)
3. T5.2 - Bundle analysis (1 hora)
4. T7.5 - Preview URL comments (1 hora)
5. T12.4 - Consolidar RLS policies (2 horas)

---

*Ultima atualizacao: 2026-06-06*

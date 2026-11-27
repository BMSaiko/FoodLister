# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-11-27

### Fixed
- **Ordem das novidades** — `/novidades` mostra a release mais recente primeiro; releases do mesmo dia desempatam por versão (0.2.1 antes de 0.2.0) e o aviso usa o mesmo critério

## [0.2.1] - 2026-11-27

### Changed
- **Publicação de novidades** — as notas de versões anteriores passam a aparecer em `/novidades` e só a versão mais recente gera aviso; a publicação passa a falhar de forma visível

## [0.2.0] - 2026-11-27

### Added
- **Aviso de novidades** — trigger `notify_release` em `release_notes` avisa todos os utilizadores (tipo `release`, respeita `system_updates`, idempotente por utilizador e versão), popup «Há novidades» e badge «Novo» no link «Novidades» (hook `useUnseenRelease`; visto em `localStorage` e na notificação lida)
- **Novidades** — `/novidades` e `/novidades/[version]` com as notas de release como newsletter (filtros por tipo, estado vazio com Tovi, markdown inline seguro), `GET /api/releases` público e paginado, link na navegação
- **Workflow git** — ramos `feat|fix|docs|chore/<slug>` → `dev` (squash) → `main` (merge commit), proteção de ramos e CI em PR para `dev` e `main` (#281-#282)
- **Supabase local** — baseline por timestamp (histórico em `migrations_legacy/`), MCP local, scripts `db:*` de backup, restauro e promoção, portas 553xx (#283-#287)
- **Cursor personalizado** — 8 cursores SVG 24 px (claro e escuro) em `public/cursors/`, tokens `--cursor-*` com fallback nativo e só com `pointer: fine`; estados grab/grabbing no mapa e `spin` na roleta
- **Marca** — logo cloche, mascote Tovi com 6 emotes, `ToviLoader`, favicon e ícones PWA (#286)
- **UX mobile** — E1 transversal (#288), admin em gaveta (#289), `EmptyState` com Tovi (#290), mapa mobile (#291), detalhe do restaurante (#292), wizard de formulários (#293), `/auth/*` (#294) e `/subscribe/*` (#295)
- **Global Search (Cmd+K)** — Real-time search across restaurants and public lists with keyboard shortcut
- **List Export** — Export lists as CSV, JSON, or formatted text
- **Error Boundary** — Graceful error handling with reset and home navigation
- **Accessibility (a11y)** — ARIA labels on all interactive elements in Navbar and SignIn
- **Bundle Optimization** — `optimizePackageImports` for lucide-react and supabase-js
- **CI/CD Pipeline** — GitHub Actions for test, build, typecheck, and lint

### Fixed
- **Permissões (mig 064)** — admins editam/eliminam qualquer restaurante/lista (página + dashboard); owners editam os seus; só admin elimina restaurantes; qualquer user logado cria restaurantes/listas. getListRole admin->owner, /api/users/me->isAdmin, página /admin/lists + rota. (276dd32)
- **API Routes** — Added null checks after `getServerClient()` in 8 routes to prevent 500 errors
- **Middleware** — Fixed redirect from `/auth/login` to `/auth/signin`
- **Tests** — Fixed 11 test failures across auth, hooks, and API tests

### Changed
- **Test Coverage** — Improved from 387 to 414 passing tests (100% pass rate)
- **Bundle Size** — Optimized shared bundle to 102kB

## [0.1.0] — 2026-06-13

### Added
- **Core Features** — Restaurant discovery, list management, reviews, user profiles
- **Authentication** — Supabase Auth with email/password, email verification, account lockout
- **Social** — Collaboration, comments, activity feed, meal scheduling
- **Subscriptions** — Stripe checkout with 3 tiers (Free, Premium, Pro)
- **Notifications** — In-app, email, push notifications with preferences
- **Marketing AI** — OpenAI GPT-4o-mini content generation
- **PWA** — Service Worker, offline fallback, install prompt
- **Admin Dashboard** — Stats, user management, content moderation
- **Testing** — 57 test files with Jest + React Testing Library
- **Storybook** — Component development environment

# Agent Instructions

## General Rules

- **Sempre operar na branch `dev`.** Commits diretos em `main` são proibidos. Antes de QUALQUER commit, executar `git branch --show-current` — se não estiver em `dev`, fazer `git checkout dev` IMEDIATAMENTE.
- **NUNCA auto-commit** — gerar COMMIT_*.md em vez disso. O BMS decide quando commitar.
- **Sempre verificar branch antes de commits** (a regra mais violada neste projeto).
- Quando em dúvida, ler o código-fonte antes de escrever novos ficheiros.
- Preferir bibliotecas e padrões existentes sobre introduzir novas dependências.
- **Todos os testes devem passar** antes de considerar uma task completa.
- **Nunca commitar `.env.local`** — usar `.env.local.example` como template.
- Seguir as convenções do projeto descritas abaixo.
- **Windows/MSYS2 PATH:** npm scripts podem falhar. Invocar ferramentas diretamente via `node node_modules/<pkg>/bin/<cmd>` ou `C:\Program Files\Git\bin\bash.exe -c`.

## Code Guidelines

### Language & Framework
- **Language:** TypeScript 5.8.2 (strict mode)
- **Framework:** Next.js 15 (App Router)
- **React:** React 19.0.0
- **Styling:** TailwindCSS 3.4.19 com CSS variables (dark-only theme)
- **Version:** 0.1.0 (private)

### Naming Conventions
- **Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Functions:** `camelCase`
- **Classes/Components:** `PascalCase`
- **Files:** `kebab-case` (ex: `restaurant-card.tsx`)
- **Directories:** `kebab-case` (ex: `restaurant-card/`)
- **Hooks:** `camelCase` com prefixo `use` (ex: `useRestaurants`)
- **Types/Interfaces:** `PascalCase`
- **API Routes:** `route.ts` (Next.js convention)
- **Migrations:** Numeração sequencial `000-211+` (ex: `039_add_list_activities.sql`)

### Code Style
- **Indentation:** 2 spaces
- **Line length:** 100 characters (ESLint config)
- **Quotes:** single quotes (`'`)
- **Semicolons:** sim (`;`)
- **Formatting tool:** ESLint 9.39.2 (flat config) + Prettier (via editor)
- **Type checking:** `tsc --noEmit` (typescript 5.8.2 strict)
- **Config files:** `.mjs` extension (next.config.mjs, eslint.config.mjs, tailwind.config.js)

### Server vs Client Components
- **Default:** Server Component (RSC) — para data fetching e SEO
- **Add `'use client'`:** Somente quando o componente usa state, hooks, ou APIs do browser
- **Regra:** Se o componente importa de `contexts/` ou `hooks/` que usam `useState`/`useEffect`, é Client Component
- **Layouts:** `ClientLayout` envolve providers; `app/layout.js` é Server Component

### Error Handling
- **API Routes:** Usar `try/catch` com `NextResponse.json({ error }, { status })`
- **Tipos de erro:** Usar `ApiErrorType` e `getErrorMessage()` de `types/api.ts`
- **Client Components:** Estado de erro com `useState`, boundary com `ErrorBoundary.tsx`
- **Logging:** `utils/logger.ts` com `SENSITIVE_KEYS` (password, etc.) e `sanitizeObject`
- **Service role:** Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ao client

### Database Patterns
- **Tipos:** Usar `Insert` e `Update` explícitos (NÃO o padrão self-referential `Database['public']['Tables']`)
- **Migrations:** Sequenciais (000-211+), atómicas por feature
- **RLS:** Sempre ON para tabelas user-facing (ver migração 044)
- **Constraints:** Check constraints em ratings, amounts, URLs válidas
- **Array limits:** `menu_links` (max 5), `menu_images` (max 10), `phone_numbers`
- **Indexes:** 81+ migrações em colunas quentes

### Supabase Client Pattern
```typescript
// Browser (Client Components)
createClientComponentClient()

// Server (Server Components, API routes)
createServerComponentClient()

// Admin (service role, server-only, bypass RLS)
createAdminClient()
```
- **Auth session:** localStorage (DEFAULT, NÃO custom cookie — causa truncagem a 4KB)
- **Server auth:** `@supabase/ssr` com `getAll`/`setAll` (lidar com cookies chunked)
- **Public access:** `getPublicServerClient()` para anon-readable data

## Security Practices

- **Autenticação:** Supabase Auth (HTTPS), email verification com account lockout (5 tentativas, 15min lockout)
- **Autorização:** RLS em TODAS as tabelas user-facing, policies check `auth.uid()`
- **Roles:** `user`, `admin`, `super_admin` (gestão em `admin_roles` tabela)
- **Rate limiting:** 100 req/15min API routes, 10 req/15min auth routes
- **Input validation:** Client (React Hook Form) + Server (API) + DB (constraints)
- **Service role key:** Server-side ONLY, NUNCA exposto ao client
- **Senhas:** Nunca recebidas, armazenadas ou logadas pelo backend (audit T80 = compliant)
- **CORS:** Whitelist configurado em `libs/security.ts` (edge-safe universal rate limiter)
- **Env vars:** `.env.local` gitignored, `.env.local.example` como template
- **API keys:** Stripe, OpenAI, Supabase — todas via env vars, nunca hardcoded
- **Public data:** Restaurants e reviews visíveis a utilizadores não autenticados (migrações 032/039)

### Credential Security
- **NUNCA** colocar secrets em código ou committs
- **NUNCA** logar senhas, tokens, ou API keys
- **SEMPRE** usar `utils/logger.ts` para sanitizar output
- **SEMPRE** usar `requireUser`/`requireAdmin` para proteções de rotas

## Useful Commands

### Development
```bash
# Instalar dependências (usar node_modules direto em Windows)
node node_modules/typescript/bin/tsc --noEmit

# Servidor de desenvolvimento
node node_modules/next/dist/bin/next dev

# Build de produção
node node_modules/next/dist/bin/next build

# Type check
node node_modules/typescript/bin/tsc --noEmit

# Run tests
node node_modules/jest/bin/jest.js --ci

# Run tests com coverage
node node_modules/jest/bin/jest.js --coverage

# Lint
node node_modules/eslint/bin/eslint.js .

# Lint fix
node node_modules/eslint/bin/eslint.js . --fix

# Storybook
node node_modules/.bin/storybook dev -p 6006

# E2E tests (Playwright)
node node_modules/playwright/test
```

### Git Workflow
```bash
# Criar nova branch (sempre dev)
git checkout dev

# Verificar branch atual (OBRIGATÓRIO antes de commits)
git branch --show-current

# Commitar mudanças
git add -A && git commit -m "feat: descrição"

# Push para dev
git push origin dev

# Merge dev → main (após push)
git checkout main && git merge --no-edit dev && git push origin main

# Ver histórico
git log --oneline -10
```

### Testing Pattern (CRITICAL)
- **Mock pattern:** Function-based `NextResponse` mock (NUNCA class-based)
  ```typescript
  // CORRECTO
  const mockGetServerClient = jest.fn();
  jest.mock('@/libs/supabase/server', () => ({
    getServerClient: mockGetServerClient,
    requireAdmin: jest.fn(),  // TODOS os exports devem estar no mock
  }));
  ```
- **Verificar todos os exports:** Ao mockar um módulo, incluir TODOS os exports que a route importa
- **Test coverage:** 52 test files, 404/404 passing (target 80%)
- **Ícones:** usar `<Icon name="…"/>` (sprite próprio); `lucide-react` foi removido e um teste falha se voltar

### Build & Deploy
```bash
# Verificar build local
node node_modules/next/dist/bin/next build

# Deploy automático via Vercel (push para main)
git push origin main

# Verificar status de deploy
# Vercel dashboard → https://vercel.com
```

## Project-Specific Notes

### ⚠️ CRITICAL: Windows/MSYS2 Pitfalls

1. **Terminal cwd quebrado:** O terminal do Hermes no Windows tem o cwd permanentemente inválido. TODOS os comandos com `cd` falham.
   - **Fix:** Usar `execute_code` com Python `subprocess.run(..., cwd=<path>)`
   - **Alternativa:** `C:\Program Files\Git\bin\bash.exe -c "cd /c/path && command"`

2. **npm scripts FAIL no Windows:** `npm run build`, `npm test`, `npm install` falham com "'node' is not recognized" (MSYS2 PATH não propaga para cmd.exe)
   - **Fix:** Chamar ferramentas diretamente: `node node_modules/eslint/bin/eslint.js .`, `node node_modules/jest/bin/jest.js <file> --ci`, `node node_modules/next/dist/bin/next build`
   - **Workaround PATH:** `C:\nvm4w\nodejs` precisa estar no Windows system PATH (`setx PATH "%PATH%;C:\nvm4w\nodejs"`)

3. **Builds longos > 5min:** `next build` pode exceder o limite do execute_code
   - **Fix:** Lançar detached: `subprocess.Popen([...], creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP)`
   - **Monitorar:** Poll o log file para detectar `✓ Compiled successfully` ou `Failed to compile`

4. **Git LFS no Vercel:** Assets `.svg` em LFS são servidos como pointers no deploy → imagens quebradas
   - **Fix:** `git lfs untrack "*.svg"` → `git add --renormalize .` → commit

5. **Sed duplicação:** `sed -i` em MSYS pode duplicar classes CSS (ex: `min-h-[100dvh]` → `min-min-h-[100dvh]`)
   - **Fix:** Sempre grep antes de fazer replacements em massa

### ⚠️ CRITICAL: Code Patterns

1. **NUNCA usar `useState(() => ...)` para derivar seleção de dados assíncronos**
   - O initializer roda UMA VEZ no mount quando o array está vazio → lock para index 0 para sempre
   - **Fix:** `pickSeeded(arr, userId)` — determinístico por user+day (utils/random.ts)

2. **NUNCA reutilizar `/api/admin/stats` para views públicas**
   - É `requireAdmin`-gated (403 para anon) e pesado (21 queries)
   - **Fix:** Usar `app/api/home/stats/route.ts` com `getPublicServerClient()`

3. **NUNCA colocar `\u{1F37D}` em JSX text** — parseado como expressão JS → TS1351
   - **Fix:** Usar emoji literal `🍽️` ou `{'...'}` string literal

4. **NUNCA misturar componentes `<a>` dentro de `<Link>`** — hydration error
   - **Fix:** `<span>` + `useRouter().push()` + `preventDefault`

5. **NUNCA reimplementar backend que já existe** — grep antes de construir novas features
   - Muitas features (ex: `/restaurants`) já têm API routes + hooks construídas — só falta a page component

6. **NUNCA deixar `restaurant_image_url` como fallback sem checar** — `useRestaurantForm.ts` sempre escreve `'/placeholder-restaurant.jpg'` em edits

7. **NUNCA criar hooks em componentes reutilizáveis** que duplicam estado do parent
   - **Regra (Orphan Hook):** Se o pai e o filho instanciam o mesmo hook, o pai lê o estado vazio
   - **Fix:** Hoist hook para o consumidor, passe props para baixo

### ⚠️ CRITICAL: Middleware & Server Config

1. **middleware.ts:** Usa `createServerClient` de `@supabase/ssr` com `getAll`/`setAll` para cookies chunked. Admin routes (`/admin`) são protegidos via `ADMIN_ROUTES` array.
2. **app/layout.js:** `export const dynamic = 'force-dynamic'` — SSR forçado. Server Component que envolve `ClientLayout`, `ErrorBoundary`, `LoadingProvider`.
3. **next.config.mjs:** CSP policy headers (`Content-Security-Policy-Report-Only`), `reactStrictMode: true`, `eslint.ignoreDuringBuilds: true`, `experimental.optimizePackageImports: ['@supabase/supabase-js']`. Image remote patterns para Unsplash, Imgur, Cloudinary, OpenStreetMap, Google Maps, Picsum, Upload.wikimedia, Discord — todos via `next.config.mjs`.
4. **tsconfig.json:** `paths: { "@/*": ["./*"] }` — todos os imports usam `@/` prefix. `types: ["jest", "node", "leaflet", "react-leaflet", "leaflet.markercluster"]` — Pode bloquear `@types/*` packages. `exclude: ["node_modules", "jest.config.js", "snippets", "__tests__", "agents", "instructions", "scripts"]`.

1. **Auth session em localStorage** (NÃO cookies) — cookies truncam a 4KB silenciosamente
2. **getServerClient()** usa `@supabase/ssr` com `getAll`/`setAll` (NÃO cookie injection manual)
3. **Tipos Insert/Update explícitos** — NÃO usar `Database['public']['Tables']` pattern self-referential
4. **RLS consolidado** em migration 044 — policies duplicadas em 032/035 foram removidas
5. **Public anon-read** em `restaurants`, `reviews`, `profiles` (migrações 032/039/061)

### ⚠️ CRITICAL: Testing

1. **Mock pattern:** Function-based NextResponse mock (NÃO class-based) — ver mistake log `2026-06-13-nextresponse-mock-pattern.md`
2. **Mock factory incompleto:** Cada export do módulo mockado DEVE estar no factory (causa 500 silencioso se omitido)
3. **tsconfig `types` array:** Pode bloquear `@types/*` packages — adicionar package names ao array `types` (ex: `"types": ["jest", "node", "leaflet", "react-leaflet", "leaflet.markercluster"]`)
4. **tsconfig `paths` alias:** `@/*` → `./` — todos os imports usam `@/` prefix (ex: `@/libs/supabase`, `@/components/ui/Modal`)
5. **tsconfig exclude:** `jest.config.js`, `snippets`, `__tests__`, `agents`, `instructions`, `scripts`

### ⚠️ CRITICAL: Branch & Git

1. **SEMPRE** verificar `git branch --show-current` antes de commits
2. **SEMPRE** trabalhar em `dev` — nunca em `main`
3. **Após merge dev→main**, o shell fica em `main` — re-verify antes do próximo commit
4. **Stash recovery:** Se commitar em `main` por engano, `git stash` → `git checkout dev` → `git stash pop` → re-`git add`

### Component Architecture Notes

- **Decomposition > Monolith:** RestaurantCard (6 sub-components), RestaurantDetails (20 sub-components)
- **FeatureGate:** `<FeatureGate feature="key">` com hierarquia free < premium < pro
- **Context Provider Hierarchy:** AuthContext → FiltersContext → LanguageContext → ModalContext → {children} (`contexts/index.tsx`)
- **Error Boundary:** `components/ui/ErrorBoundary.tsx` wrap global em `layout.js`
- **Barrel exports:** `components/index.ts` para imports limpos
- **Types:** `libs/types.ts` (domínio), `types/database.ts` (Supabase gerados + explicit Insert/Update), `types/api.ts` (ApiErrorType), `types/notification.ts` (NotificationType)
- **Libs (21+):** `activity.ts`, `admin.ts`, `ai.ts`, `api.ts`, `apiClient.ts`, `auth.ts`, `cache.ts`, `creatorCodes.ts`, `export.ts`, `feed.ts`, `ics-generator.ts`, `languages.ts`, `marketing.ts`, `mentions.ts`, `notifications/`, `rate-limit.ts`, `search.ts`, `slug.ts`, `stripe.ts`, `subscription.ts`, `supabase/`, `utils/`, `verification.ts`
- **Hooks (54+, 12 subdirs):** admin, auth, data, forms, lists, marketing, navigation, notifications, restaurants, subscription, ui, utilities
- **Utils (18+):** analytics, apiMonitor, cloudinaryConverter, dbMonitor, error-messages, filters, formatters, googleMapsBatchExtractor, googleMapsExtractor, googleCalendar, index, logger, performanceMonitor, random, scrollLock, search, passwordValidation, authUtils
- **Components (160+ .tsx, 10 subdirs):** admin, auth, landing, layouts, lists, loading, pages, restaurant, subscription, ui
- **Contexts (5):** AuthContext, FiltersContext, LanguageContext, ModalContext, index.tsx
- **Scripts:** `scripts/` — Python scripts (`scrap-city-links.mjs`, `scrap-maps-places.py`, `gen_tests.py`, `apply_changes.py`)
- **Types (5 files):** api.ts, database.ts, loading.ts, notification.ts, react-dom.d.ts
- **API routes:** 21 subdirs em `app/api/` com pattern RESTful
- **Rate limiting:** `libs/rate-limit.ts` + `middleware/rateLimiter.ts`

### Known Issues & Workarounds

| Issue | Workaround | Fix Needed |
|-------|-----------|------------|
| Modal close button X não responde | ESC key funciona | Refactor Modal.tsx com onCloseButton |
| Test suites com mock chain issues | Pre-existing, low priority | 10 suites |
| Email notifications | Requer Resend/SendGrid integração | External service |
| Push notifications | Requer VAPID key generation | Not configured by default |
| `prefers-reduced-motion` | Só respeitado em loaders | Gap de a11y |
| Landing page `app/page.js` | É `.js` (NÃO `.tsx`) — manter assim | Do NOT rename |
| Next.js 15 depreca `next lint` | Usar `eslint .` diretamente | Configurado em next.config.mjs |
| `next lint` crash no Next 16 | `eslint.ignoreDuringBuilds: true` | Já fixado |

## Useful References

- [Project MOC](knowledge/projects/foodlister/MOC.md) — Índice central do projeto
- [Memory Bank](knowledge/projects/foodlister/memory-bank/) — Contexto ativo, padrões, progresso
- [Docs](knowledge/projects/foodlister/code/docs/) — Documentação técnica detalhada
- [Tasks Roadmap](knowledge/projects/foodlister/TASKS_ROADMAP.md) — Roadmap oficial
- [Implementation Plans](knowledge/projects/foodlister/code/plans/) — DR+DP por feature
- [Skill: foodlister](C:\Users\bruno\Documents\Second-Brain\.agents\skills\active\foodlister\SKILL.md) — Convenções e pitfalls detalhados
- [Project Description](knowledge/projects/foodlister/project-description.md) — Visão completa
- [Active Context](knowledge/projects/foodlister/activeContext.md) — Estado atual da sessão
- [GitHub Secrets](knowledge/projects/foodlister/code/docs/setup/github-secrets-setup.md) — Configuração CI/CD
- [Tech Doc](knowledge/projects/foodlister/code/docs/TECHDOC.md) — Documentação técnica indexada
- [ADR](adr/001-architecture-overview.md) — Architecture Decision Records

## Git Workflow (Detailed)

### Branch Strategy
```
main (protected, NEVER commit directly)
  ↑ fast-forward merge after PR
dev (ALL development happens here)
  ↑ feature branches → PR
```

### Commit Convention
```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
refactor: refatorar código
test: adicionar/atualizar testes
chore: tarefas de manutenção
```

### Pre-Push Checklist
1. ✅ `tsc --noEmit` → 0 errors
2. ✅ `node node_modules/eslint/bin/eslint.js .` → 0 errors
3. ✅ `node node_modules/jest/bin/jest.js --ci` → all passing
4. ✅ `node node_modules/next/dist/bin/next build` → clean build
5. ✅ `git branch --show-current` → on `dev`
6. ✅ Nenhum `.env.local` no staging
7. ✅ Nenhum segredo no código

## Environment Variables Reference

### Required for Development
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

### Required for Production (Vercel)
- All above + `VERCEL_TOKEN` (GitHub Secrets)
- Set via GitHub Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_APP_URL`, `VERCEL_TOKEN`

## Performance & Caching

### Server-Side Caching (`libs/cache.ts`)
```typescript
cacheGet(key)
cacheSet(key, value, ttl)
cacheOrSet(key, factory, ttl)
cacheInvalidatePrefix(prefix)
```
- **Current usage:** Apenas `dietary-options` e `features` routes
- **Needs caching:** `app/api/restaurants/route.ts` (batch loop IGNORES limit!), `app/api/admin/stats/route.ts` (21 queries), `app/api/cuisine-types/route.ts` (static data)

### Client-Side Optimization
- **Debounce:** 300ms em search hooks
- **Web Worker:** `public/workers/search-worker.js` para filtering pesado
- **Code splitting:** Automático via App Router
- **Images:** `next/image` com WebP/AVIF
- **React.memo:** Onde faz sentido

### Touch Targets
```css
@media (pointer: coarse) {
  button, a, [role="button"] { min-height: 44px; }
}
```

## Testing Strategy

### Test Structure
```
__tests__/
├── api/           # API route tests
├── components/    # Component tests
├── hooks/         # Hook tests
├── libs/          # Library tests
└── utils/         # Utility tests
```

### Test Conventions
- **File naming:** `[name].test.ts` or `[name].test.tsx`
- **Mock pattern:** Function-based `NextResponse` mock
- **Coverage target:** 80% (atual ~93%)
- **Test runner:** Jest 29.7.0 + ts-jest 29.2.5 + jest-environment-jsdom
- **RTL:** React Testing Library 16.1.0
- **E2E:** Playwright 1.60.0 (not yet implemented)

### Critical Test Pattern
```typescript
// ALWAYS include ALL exports in mock factory
jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(),
  requireAdmin: jest.fn(),      // ← MUST be included if route imports it
  createAdminClient: jest.fn(),  // ← MUST be included if route imports it
}));
```

## AI/LLM Integration Notes

- **OpenAI:** GPT-4o-mini via `libs/ai.ts`
- **Feature gate:** `<FeatureGate feature="marketing_ai">` (Pro tier only)
- **Usage:** Content generation for 6 platforms (Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube)
- **Dashboard:** `/marketing` page (Pro gated)
- **Token tracking:** `ai_generation_logs` table (migration 047)
- **Workflow triggers:** new restaurant, new review, weekly digest, top rated, manual

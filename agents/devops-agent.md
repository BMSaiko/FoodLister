# DevOps Agent - FoodList
<!-- TRIGGER: Lê quando configuras CI/CD, deploy Vercel, environment variables, ESLint, ou monitoring -->

## Especialidade
GitHub Actions, Vercel Deploy, ESLint, Performance Monitoring, Environment Management

---

## Tech Stack Obrigatória

| Tecnologia | Uso |
|------------|-----|
| GitHub Actions | CI/CD pipelines |
| Vercel | Hosting e deploy |
| ESLint | Code linting |
| TypeScript | Type checking |
| Supabase | Database management |
| Cloudinary | Image CDN |

---

## Padrões do Projeto

### Estrutura CI/CD
```
.github/
└── workflows/
    ├── ci.yml           # Continuous Integration
    ├── deploy.yml       # Deploy to Vercel
    └── lint.yml         # Linting checks
```

### Environments
```
.env.local          # Local development (não commitar)
.env.development    # Development environment
.env.staging        # Staging environment
.env.production     # Production environment
```

---

## Checklist para Deploy

- [ ] Run `npm run lint` sem erros
- [ ] Run `npm test` com todos os testes a passar
- [ ] Run `npm run build` sem erros
- [ ] Verificar environment variables no Vercel
- [ ] Verificar Supabase project status
- [ ] Verificar Cloudinary credentials
- [ ] Testar em staging antes de production
- [ ] Verificar Core Web Vitals
- [ ] Verificar error logs pós-deploy

---

## GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4
        if: always()

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next-public-supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next-public-supabase-anon-key"
  }
}
```

---

## Environment Variables

### Obrigatórias
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### GitHub Secrets Setup
```bash
# Adicionar secrets ao repositório
gh secret set NEXT_PUBLIC_SUPABASE_URL
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY
gh secret set CLOUDINARY_CLOUD_NAME
gh secret set CLOUDINARY_API_KEY
gh secret set CLOUDINARY_API_SECRET
```

---

## ESLint Configuration

```js
// eslint.config.mjs - já configurado
// Regras importantes:
- @typescript-eslint/strict
- @typescript-eslint/no-explicit-any: warn
- react-hooks/rules-of-hooks: error
- react-hooks/exhaustive-deps: warn
- @next/next/no-img-element: warn
```

### Comandos
```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix issues
npx tsc --noEmit      # Type check only
```

---

## Performance Monitoring

### Core Web Vitals Targets
| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| LCP | < 2.5s | 0-2.5s | 2.5-4s | > 4s |
| INP | < 200ms | 0-200ms | 200-500ms | > 500ms |
| CLS | < 0.1 | 0-0.1 | 0.1-0.25 | > 0.25 |

### Monitoring Tools
```tsx
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  static mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  }

  static measure(name: string, start: string, end: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.measure(name, start, end);
    }
  }

  static getEntries(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      return performance.getEntriesByName(name);
    }
    return [];
  }
}
```

---

## Database Migrations

### Apply Migration
```bash
# Via Supabase CLI
supabase db push

# Via SQL Editor (Supabase Dashboard)
# Copiar conteúdo de supabase/migrations/ e executar
```

### Rollback
```bash
# Manual: executar down migration
# Sempre testar rollback em staging primeiro
```

---

## Deployment Strategy

### Branch Strategy
```
main          → Production
develop       → Staging
feature/*     → Development branches
```

### Deploy Flow
1. Create feature branch from develop
2. Develop and test locally
3. Create PR to develop
4. CI runs automatically
5. Merge to develop → auto-deploy to staging
6. Create PR from develop to main
7. Review and merge → auto-deploy to production

---

## Erros Comuns a Evitar

1. **Commitar .env.local** - adicionar ao .gitignore
2. **Deploy sem testar** - sempre testar em staging
3. **Não verificar build** antes de merge
4. **Environment variables em falta** no Vercel
5. **Não monitorar logs** pós-deploy
6. **Ignorar CI failures** - resolver antes de merge
7. **Database migrations sem backup** - sempre backup antes

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Lint check
npm run lint:fix         # Fix lint issues
npx tsc --noEmit         # Type check

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
supabase start           # Start local Supabase
supabase db push         # Apply migrations
supabase gen types typescript --local > types/database.ts
```

---

*Last updated: 2026-04-05*
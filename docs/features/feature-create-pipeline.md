# Feature: Criar CI/CD Pipeline

> **Status:** ✅ Implementado  
> **Prioridade:** Alta  
> **Labels:** `devops`, `ci-cd`, `infrastructure`  
> **Data de Criação:** 2026-04-03

---

## 📋 Descrição

Implementar um pipeline de integração contínua e deployment (CI/CD) usando GitHub Actions para automatizar o processo de build, teste, lint e deploy da aplicação FoodList.

## 🎯 Objetivos

- **Automatizar testes** em cada pull request e push para branches principais
- **Executar linting** e verificação de qualidade de código
- **Build da aplicação** Next.js com verificação de erros
- **Deploy automático** para produção (Vercel recomendada)
- **Notificações** de status do pipeline

## 🏗️ Arquitetura do Pipeline

```
┌─────────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│   Push/PR   │ ──► │   Lint   │ ──► │  Build  │ ──► │  Deploy  │
│             │     │          │     │         │     │          │
└─────────────┘     └──────────┘     └─────────┘     └──────────┘
                         │               │               │
                    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
                    │  ESLint │     │  Tests  │     │  Vercel │
                    │  Prettier│    │  Jest   │     │  Preview│
                    └─────────┘     └─────────┘     └─────────┘
```

## 📦 Workflows a Criar

### 1. CI Pipeline (`ci.yml`)

Executado em cada push e pull request.

**Triggers:**
- `push` para `main` e `develop`
- `pull_request` para `main`

**Jobs:**
| Job | Descrição | Comandos |
|-----|-----------|----------|
| `lint` | Verificar qualidade de código | `npm run lint` |
| `build` | Build da aplicação | `npm run build` |
| `test` | Executar testes unitários | `npm test` (quando disponível) |

### 2. Deploy Pipeline (`deploy.yml`)

Executado em merges para `main`.

**Triggers:**
- `push` para `main` (após merge de PR)

**Jobs:**
| Job | Descrição | Ação |
|-----|-----------|------|
| `deploy-preview` | Deploy para ambiente de preview | Vercel Preview Deployment |
| `deploy-production` | Deploy para produção | Vercel Production Deployment |

## 📁 Files to Create

```
.github/
└── workflows/
    ├── ci.yml          # CI pipeline (lint + build + test)
    └── deploy.yml      # Deploy pipeline (preview + production)
```

## 🔧 Configuração Necessária

### Variáveis de Ambiente (GitHub Secrets)

| Secret | Descrição | Obrigatório |
|--------|-----------|-------------|
| `VERCEL_TOKEN` | Token de autenticação Vercel | Sim (deploy) |
| `VERCEL_ORG_ID` | ID da organização Vercel | Sim (deploy) |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | Sim (deploy) |
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_ANON_KEY` | Chave anónima Supabase | Sim |
| `DATABASE_URL` | URL de conexão à base de dados | Sim |
| `NEXTAUTH_SECRET` | Secret para NextAuth | Sim |
| `NEXTAUTH_URL` | URL base da aplicação | Sim |
| `CLOUDINARY_URL` | URL do Cloudinary para imagens | Sim |

### Dependências Externas

- **Vercel Account** (gratuito para projetos pessoais)
- **Supabase Project** (já configurado)
- **Cloudinary Account** (já configurado)

## ✅ Acceptance Criteria

- [ ] Workflow CI executa em cada push/PR
- [ ] Linting passa sem erros
- [ ] Build da aplicação Next.js completa com sucesso
- [ ] Deploy automático para preview em PRs
- [ ] Deploy automático para produção em merge para `main`
- [ ] Notificações de sucesso/falha configuradas
- [ ] Documentação atualizada no README

## 📝 Passos de Implementação

### Fase 1: CI Básico
1. Criar `.github/workflows/ci.yml`
2. Configurar job de linting
3. Configurar job de build
4. Testar com push para branch de teste

### Fase 2: Deploy
1. Criar `.github/workflows/deploy.yml`
2. Configurar integração com Vercel
3. Configurar deploy de preview para PRs
4. Configurar deploy de produção para `main`

### Fase 3: Notificações e Melhorias
1. Adicionar notificações Discord/Slack
2. Configurar badges de status no README
3. Adicionar proteção de branch (branch protection rules)

## 🔗 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)

## 📊 Estimativa

| Fase | Tempo Estimado |
|------|----------------|
| Fase 1: CI Básico | 1-2 horas |
| Fase 2: Deploy | 2-3 horas |
| Fase 3: Notificações | 1 hora |
| **Total** | **4-6 horas** |

---

*Última atualização: 2026-04-03*
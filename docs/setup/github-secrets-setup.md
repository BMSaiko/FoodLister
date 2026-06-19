# Configuração dos GitHub Secrets - FoodLister

## 📋 Secrets Necessários

Obtém os valores do teu ficheiro `.env.local` e adiciona-os nos GitHub Secrets.

| Secret Name | Fonte | Obrigatório |
|-------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` | ✅ CI + Deploy |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ CI + Deploy |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` → `SUPABASE_SERVICE_ROLE_KEY` | ✅ Deploy |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `.env.local` → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ CI + Deploy |
| `CLOUDINARY_API_KEY` | `.env.local` → `CLOUDINARY_API_KEY` | ✅ CI + Deploy |
| `CLOUDINARY_API_SECRET` | `.env.local` → `CLOUDINARY_API_SECRET` | ✅ CI + Deploy |
| `NEXTAUTH_SECRET` | Gerar: `openssl rand -base64 32` | ✅ CI + Deploy |
| `NEXTAUTH_URL` | URL da aplicação (ex: https://foodlister.vercel.app) | ✅ CI + Deploy |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) | ✅ Deploy |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` | ✅ Deploy |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | ✅ Deploy |

---

## 🔧 Como Adicionar os Secrets

### Via GitHub CLI

```bash
# Instalar GitHub CLI (Windows)
winget install GitHub.cli

# Ou via npm
npm install -g gh

# Login
gh auth login

# Adicionar cada secret (substitui os valores)
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"
gh secret set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME --body "your-cloud-name"
gh secret set CLOUDINARY_API_KEY --body "your-api-key"
gh secret set CLOUDINARY_API_SECRET --body "your-api-secret"
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set NEXTAUTH_URL --body "https://your-app.vercel.app"
gh secret set VERCEL_TOKEN --body "your-vercel-token"
gh secret set VERCEL_ORG_ID --body "your-org-id"
gh secret set VERCEL_PROJECT_ID --body "your-project-id"
```

### Via GitHub Website

1. Vai a **https://github.com/BMSaiko/FoodLister/settings/secrets/actions**
2. Clica em **"New repository secret"**
3. Adiciona cada secret da tabela acima

---

## 📝 Notas Importantes

### Sobre o `.env.local`
- O ficheiro `.env.local` **NUNCA** deve ser commitado ao repositório
- Já deve estar listado no `.gitignore`
- Use `.env.local.example` como template para novos ambientes

### Gerar NEXTAUTH_SECRET
```bash
# Método 1: OpenSSL (recomendado)
openssl rand -base64 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verificar Secrets no Vercel
1. Vai a [vercel.com](https://vercel.com) e faz login
2. Seleciona o projeto **FoodLister**
3. Vai a **Settings** → **Environment Variables**
4. Verifica se todas as variáveis estão configuradas

---

## 🚀 Workflows que Usam os Secrets

### CI Pipeline (`.github/workflows/ci.yml`)
```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${{ secrets.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME }}
```

### Deploy Pipeline (`.github/workflows/deploy.yml`)
```yaml
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Supabase Migrations
```yaml
env:
  SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

---

## ✅ Verificação

Após configurar os secrets, verifica se tudo está a funcionar:

1. **CI Check**: Faz push para uma branch e verifica se o CI passa
2. **Deploy Check**: Verifica se o deploy no Vercel funciona
3. **Runtime Check**: Verifica se a aplicação carrega sem erros de configuração

---

## 🔒 Segurança

- **Nunca** partilhes secrets em issues ou PRs
- **Roda** `git status` antes de commitar para evitar partilhar `.env.local`
- **Usa** secrets do GitHub em vez de valores hardcoded
- **Rota** periodicamente o `NEXTAUTH_SECRET` e tokens de API

---

*Última atualização: 2026-05-07*
# Configuração dos GitHub Secrets

## 📋 Secrets Necessários

Obtém os valores do teu ficheiro `.env.local` e adiciona-os nos GitHub Secrets.

| Secret Name | Fonte | Obrigatório |
|-------------|-------|-------------|
| `SUPABASE_URL` | `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` | ✅ CI + Deploy |
| `SUPABASE_ANON_KEY` | `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ CI + Deploy |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` → `SUPABASE_SERVICE_ROLE_KEY` | ✅ Deploy |
| `CLOUDINARY_CLOUD_NAME` | `.env.local` → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ CI + Deploy |
| `CLOUDINARY_API_KEY` | `.env.local` → `CLOUDINARY_API_KEY` | ✅ CI + Deploy |
| `CLOUDINARY_API_SECRET` | `.env.local` → `CLOUDINARY_API_SECRET` | ✅ CI + Deploy |
| `CLOUDINARY_URL` | Construído: `cloudinary://KEY:SECRET@NAME` | ✅ Deploy |
| `NEXTAUTH_SECRET` | Gerar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | ✅ CI + Deploy |
| `NEXTAUTH_URL` | URL da aplicação | ✅ CI + Deploy |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) | ✅ Deploy |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` | ✅ Deploy |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | ✅ Deploy |

---

## 🔧 Como Adicionar os Secrets

### Via GitHub CLI

```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Adicionar cada secret (substitui os valores)
gh secret set SUPABASE_URL --body "YOUR_VALUE"
gh secret set SUPABASE_ANON_KEY --body "YOUR_VALUE"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "YOUR_VALUE"
gh secret set CLOUDINARY_CLOUD_NAME --body "YOUR_VALUE"
gh secret set CLOUDINARY_API_KEY --body "YOUR_VALUE"
gh secret set CLOUDINARY_API_SECRET --body "YOUR_VALUE"
gh secret set CLOUDINARY_URL --body "YOUR_VALUE"
gh secret set NEXTAUTH_SECRET --body "YOUR_VALUE"
gh secret set NEXTAUTH_URL --body "YOUR_VALUE"
gh secret set VERCEL_TOKEN --body "YOUR_VALUE"
gh secret set VERCEL_ORG_ID --body "YOUR_VALUE"
gh secret set VERCEL_PROJECT_ID --body "YOUR_VALUE"
```

### Via GitHub Website

1. Vai a **https://github.com/BMSaiko/FoodLister/settings/secrets/actions**
2. Clica em **"New repository secret"**
3. Adiciona cada secret da tabela acima

---

*Última atualização: 2026-04-03*
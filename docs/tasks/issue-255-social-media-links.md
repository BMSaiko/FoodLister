# Issue #255: Feature - Social Media Links

**Issue Link**: https://github.com/BMSaiko/FoodLister/issues/255  
**Status**: Pending  
**Priority**: Medium  
**Type**: Feature

---

## Overview

Adicionar links para redes sociais ao perfil dos utilizadores, permitindo que eles compartilhem e visualizem links para plataformas como Twitter/X, Instagram, Facebook, LinkedIn, TikTok, YouTube, entre outras. Esta funcionalidade integrar-se-á com o sistema de perfil existente, aparecendo na página de perfil público, no cabeçalho do perfil e nas configurações de perfil.

---

## Goals

1. Adicionar campos para links de redes sociais na tabela `profiles` da base de dados
2. Criar componente reutilizável para exibir ícones e links de redes sociais
3. Atualizar a página de configurações de perfil para permitir adicionar/editar links sociais
4. Exibir links de redes sociais no perfil público do utilizador
5. Exibir links de redes sociais no cabeçalho do perfil (UserProfileHeader)
6. Validar URLs das redes sociais no frontend e backend
7. Manter consistência com o design system existente (ícones do lucide-react)

---

## Types

### Database Schema Changes

#### 1.1 Add Social Media Columns to `profiles` Table

```sql
-- Add social media columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS social_twitter TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_linkedin TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_tiktok TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_youtube TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_website TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.social_twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.profiles.social_instagram IS 'Instagram profile URL';
COMMENT ON COLUMN public.profiles.social_facebook IS 'Facebook profile URL';
COMMENT ON COLUMN public.profiles.social_linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.social_tiktok IS 'TikTok profile URL';
COMMENT ON COLUMN public.profiles.social_youtube IS 'YouTube channel URL';
COMMENT ON COLUMN public.profiles.social_website IS 'Personal website URL';
```

#### 1.2 Update types/database.ts

```typescript
profiles: {
  Row: {
    // ... existing fields ...
    social_twitter: string | null;
    social_instagram: string | null;
    social_facebook: string | null;
    social_linkedin: string | null;
    social_tiktok: string | null;
    social_youtube: string | null;
    social_website: string | null;
  };
  Insert: {
    // ... existing fields ...
    social_twitter?: string | null;
    social_instagram?: string | null;
    social_facebook?: string | null;
    social_linkedin?: string | null;
    social_tiktok?: string | null;
    social_youtube?: string | null;
    social_website?: string | null;
  };
  Update: {
    // ... existing fields ...
    social_twitter?: string | null;
    social_instagram?: string | null;
    social_facebook?: string | null;
    social_linkedin?: string | null;
    social_tiktok?: string | null;
    social_youtube?: string | null;
    social_website?: string | null;
  };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface SocialMediaLinks {
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  website?: string | null;
}

export interface SocialMediaPlatform {
  name: string;
  key: keyof SocialMediaLinks;
  icon: string; // lucide-react icon name
  baseUrl?: string; // for validation
  placeholder: string;
}

export type SocialMediaKey = keyof SocialMediaLinks;
```

---

## Files

### New Files to Create

1. **`components/ui/SocialMediaLinks.tsx`** - Componente reutilizável para exibir links sociais
2. **`components/ui/SocialMediaForm.tsx`** - Formulário para adicionar/editar links sociais
3. **`components/ui/SocialMediaIcon.tsx`** - Ícone individual de rede social
4. **`libs/social-media.ts`** - Utilitários para validação e normalização de URLs
5. **`__tests__/components/ui/SocialMediaLinks.test.tsx`** - Testes do componente
6. **`__tests__/components/ui/SocialMediaForm.test.tsx`** - Testes do formulário
7. **`__tests__/libs/social-media.test.ts`** - Testes de utilitários

### Existing Files to Modify

1. **`libs/api.ts`**
   - Atualizar função `updateProfile` para aceitar campos sociais
   - Atualizar função `getProfile` para retornar campos sociais

2. **`app/users/[id]/page.tsx`** ou perfil do utilizador
   - Adicionar `SocialMediaLinks` no perfil público
   - Posicionar no cabeçalho ou secção "Sobre"

3. **`components/ui/profile/UserProfileHeader.tsx`** ou componente de cabeçalho
   - Adicionar `SocialMediaLinks` no cabeçalho do perfil
   - Mostrar ícones pequenos e horizontais

4. **`components/ui/profile/ProfileSettings.tsx`** ou configurações
   - Integrar `SocialMediaForm` nas configurações
   - Adicionar secção "Redes Sociais"

5. **`types/database.ts`**
   - Adicionar campos sociais à tabela `profiles`

6. **`libs/types.ts`**
   - Adicionar interfaces `SocialMediaLinks`, `SocialMediaPlatform`, `SocialMediaKey`

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`validateSocialUrl(url: string, platform: SocialMediaKey): boolean`**
   - Location: `libs/social-media.ts`
   - Purpose: Validar URL da rede social (formato e domínio)
   - Returns: `boolean`

2. **`normalizeSocialUrl(url: string, platform: SocialMediaKey): string`**
   - Location: `libs/social-media.ts`
   - Purpose: Normalizar URL (adicionar https:// se faltar)
   - Returns: `string`

3. **`getSocialMediaPlatforms(): SocialMediaPlatform[]`**
   - Location: `libs/social-media.ts`
   - Purpose: Retornar lista de plataformas suportadas
   - Returns: `SocialMediaPlatform[]`

4. **`SocialMediaLinks({ links, size, showLabels }: { links: SocialMediaLinks, size?: number, showLabels?: boolean })`**
   - Location: `components/ui/SocialMediaLinks.tsx`
   - Purpose: Exibir ícones de redes sociais clicáveis
   - Returns: JSX.Element

5. **`SocialMediaForm({ links, onChange }: { links: SocialMediaLinks, onChange: (links: SocialMediaLinks) => void })`**
   - Location: `components/ui/SocialMediaForm.tsx`
   - Purpose: Formulário para editar links sociais
   - Returns: JSX.Element

6. **`SocialMediaIcon({ platform, url, size }: { platform: SocialMediaKey, url?: string, size?: number })`**
   - Location: `components/ui/SocialMediaIcon.tsx`
   - Purpose: Ícone individual com link
   - Returns: JSX.Element (null se sem URL)

### Modified Functions

1. **`libs/api.ts - updateProfile(userId, data)`**
   - Modify: Aceitar campos `social_twitter`, `social_instagram`, etc.
   - Add: Validar URLs antes de salvar
   - Add: Normalizar URLs (adicionar protocolo)

2. **`components/ui/profile/UserProfileHeader.tsx - UserProfileHeader component`**
   - Modify: Adicionar `SocialMediaLinks` no cabeçalho
   - Add: Mostrar ícones horizontais após nome/biografia
   - Add: Só mostrar se pelo menos um link estiver preenchido

---

## Classes
- Nenhuma classe nova (usando componentes funcionais e hooks)

---

## Dependencies

### New Packages
- **`lucide-react`** (para ícones de redes sociais) - se não estiver já instalado: `npm install lucide-react`
- **`validator`** (para validação de URLs): `npm install validator`
- **`@types/validator`**: `npm install -D @types/validator`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/ui/SocialMediaLinks.test.tsx`**
   - Testar renderização com múltiplos links
   - Testar renderização sem links (estado vazio)
   - Testar cliques nos links (abre em nova aba)
   - Testar diferentes tamanhos (size prop)

2. **`__tests__/components/ui/SocialMediaForm.test.tsx`**
   - Testar renderização do formulário
   - Testar preenchimento de campos
   - Testar validação de URLs
   - Testar callback onChange
   - Testar adição/remoção de links

3. **`__tests__/libs/social-media.test.ts`**
   - Testar `validateSocialUrl` para cada plataforma
   - Testar `normalizeSocialUrl` (adicionar https://)
   - Testar `getSocialMediaPlatforms` retorna todas as plataformas
   - Mock de URLs válidas e inválidas

### Existing Test Modifications
- Atualizar testes de `updateProfile` para cobrir campos sociais
- Atualizar testes de perfil do utilizador para exibir links sociais

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_social_media_to_profiles.sql`
   - Adicionar colunas `social_twitter`, `social_instagram`, etc. à tabela `profiles`
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novos campos
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create Social Media Utilities**
   - Criar `libs/social-media.ts`
   - Implementar `validateSocialUrl`, `normalizeSocialUrl`, `getSocialMediaPlatforms`
   - Testar isoladamente

4. **Create UI Components**
   - Criar `SocialMediaIcon.tsx` (ícone individual)
   - Criar `SocialMediaLinks.tsx` (lista de ícones)
   - Criar `SocialMediaForm.tsx` (formulário de edição)
   - Usar ícones do `lucide-react`
   - Seguir design system (Tailwind + CSS variables)

5. **Update API Functions**
   - Atualizar `libs/api.ts`
   - Modificar `updateProfile` para aceitar campos sociais
   - Adicionar validação de URLs

6. **Update Profile Page**
   - Modificar página de perfil do utilizador
   - Adicionar `SocialMediaLinks` no perfil público
   - Posicionar estrategicamente no layout

7. **Update Profile Header**
   - Modificar `UserProfileHeader.tsx`
   - Adicionar `SocialMediaLinks` no cabeçalho
   - Mostrar ícones pequenos e horizontais

8. **Update Profile Settings**
   - Modificar configurações de perfil
   - Integrar `SocialMediaForm` na secção "Redes Sociais"
   - Adicionar validação em tempo real

9. **Testing**
   - Criar testes para novos componentes
   - Criar testes para utilitários
   - Atualizar testes existentes
   - Executar `npm test`

10. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(profile): add social media links to user profiles`

---

## Supported Social Media Platforms

| Platform | Key | Icon | Base URL | Placeholder |
|----------|-----|------|----------|-------------|
| Twitter/X | `twitter` | `Twitter` (lucide) | `https://twitter.com/` | `https://twitter.com/username` |
| Instagram | `instagram` | `Instagram` (lucide) | `https://instagram.com/` | `https://instagram.com/username` |
| Facebook | `facebook` | `Facebook` (lucide) | `https://facebook.com/` | `https://facebook.com/username` |
| LinkedIn | `linkedin` | `Linkedin` (lucide) | `https://linkedin.com/in/` | `https://linkedin.com/in/username` |
| TikTok | `tiktok` | `Music` (lucide) | `https://tiktok.com/@` | `https://tiktok.com/@username` |
| YouTube | `youtube` | `Youtube` (lucide) | `https://youtube.com/` | `https://youtube.com/c/channelname` |
| Website | `website` | `Globe` (lucide) | - | `https://www.example.com` |

---

## Acceptance Criteria Checklist

- [ ] Utilizadores podem adicionar links para redes sociais no perfil
- [ ] Suporte para Twitter/X, Instagram, Facebook, LinkedIn, TikTok, YouTube e website pessoal
- [ ] Links são validados (formato de URL) no frontend e backend
- [ ] Links são exibidos no perfil público com ícones clicáveis
- [ ] Links são exibidos no cabeçalho do perfil (UserProfileHeader)
- [ ] Formulário de edição nas configurações de perfil
- [ ] Ícones das redes sociais usam lucide-react
- [ ] URLs são normalizadas (adicionar https:// se faltar)
- [ ] Design responsivo (mobile e desktop)
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
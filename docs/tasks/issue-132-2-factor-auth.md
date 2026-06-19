# Issue #132: Security - 2 Factor Auth

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/132

**Status:** Pending

---

## Overview

### Context
O FoodLister atualmente usa autenticação email/password via Supabase Auth, sem suporte a MFA (Multi-Factor Authentication). O fluxo atual inclui registro, login, recuperação de senha (usando email OTP) e gerenciamento de sessão via `AuthContext.tsx`. Dados do perfil do usuário são armazenados na tabela `profiles`, sem rastreamento de status de MFA.

### Why Needed
2FA adiciona uma camada crítica de segurança às contas dos usuários, protegendo contra acessos não autorizados mesmo se as senhas forem comprometidas (ex: via phishing, credential stuffing ou data breaches). Este é um padrão de segurança recomendado para aplicações que lidam com dados de usuários.

### How It Fits Into the System
Integra-se com o suporte nativo de TOTP (Time-based One-Time Password) do Supabase, estendendo o fluxo de autenticação existente:
- O `AuthContext.tsx` existente será atualizado com métodos MFA
- O fluxo de login será estendido para lidar com desafios MFA para usuários registrados
- Novas páginas serão adicionadas para registro MFA e verificação de desafio
- Configurações do perfil do usuário serão atualizadas para gerenciar registro MFA

---

## Types

### New/Updated Interfaces

```typescript
// libs/types.ts

export interface MFAEnrollment {
  id: string;
  factorType: 'totp';
  status: 'verified' | 'unverified';
  createdAt: string;
}

export interface MFAChallenge {
  id: string;
  factorId: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserSecuritySettings {
  mfaEnabled: boolean;
  enrolledFactors: MFAEnrollment[];
  lastMFAChallenge?: string;
  backupCodes?: string[];
}

// Atualizar AuthContextValue
export interface AuthContextValue {
  // ... campos existentes ...
  mfaEnrollments: MFAEnrollment[];
  mfaEnabled: boolean;
  // Novas funções
  enrollMFA: () => Promise<{ qrCode: string; secret: string }>;
  verifyMFA: (code: string) => Promise<boolean>;
  challengeMFA: () => Promise<MFAChallenge>;
  verifyChallenge: (challengeId: string, code: string) => Promise<boolean>;
  unenrollMFA: (factorId: string) => Promise<void>;
  refreshMFAStatus: () => Promise<void>;
}
```

### Database Types Update (types/database.ts)

```typescript
// Adicionar à tabela profiles
profiles: {
  Row: {
    // ... campos existentes ...
    mfa_enabled: boolean | null;
    mfa_enrolled_at: string | null;
    backup_codes: string[] | null;
  };
  Insert: {
    // ... campos existentes ...
    mfa_enabled?: boolean | null;
    mfa_enrolled_at?: string | null;
    backup_codes?: string[] | null;
  };
  Update: {
    // ... campos existentes ...
    mfa_enabled?: boolean | null;
    mfa_enrolled_at?: string | null;
    backup_codes?: string[] | null;
  };
}
```

---

## Files

### New Files to Create

1. **`app/auth/mfa/enroll/page.tsx`** - Página de registro MFA (exibe QR code)
2. **`app/auth/mfa/verify/page.tsx`** - Página de verificação de código MFA inicial
3. **`app/auth/mfa/challenge/page.tsx`** - Página de desafio MFA durante login
4. **`components/auth/MFAEnroll.tsx`** - Componente de registro MFA (QR code, secret)
5. **`components/auth/MFAVerify.tsx`** - Componente de verificação de código
6. **`components/auth/MFAChallenge.tsx`** - Componente de desafio durante login
7. **`components/auth/BackupCodes.tsx`** - Componente para exibir códigos de backup
8. **`hooks/auth/useMFA.ts`** - Hook para gerenciar MFA
9. **`libs/mfa.ts`** - Utilitários MFA (gerar backup codes, verificar TOTP)
10. **`supabase/migrations/YYYYMMDDHHMMSS_add_mfa_fields.sql`** - Migration para campos MFA
11. **`__tests__/components/auth/MFAEnroll.test.tsx`** - Testes de registro
12. **`__tests__/components/auth/MFAChallenge.test.tsx`** - Testes de desafio
13. **`__tests__/hooks/auth/useMFA.test.ts`** - Testes do hook
14. **`__tests__/libs/mfa.test.ts`** - Testes de utilitários

### Existing Files to Modify

1. **`contexts/AuthContext.tsx`**
   - Adicionar estados: `mfaEnrollments`, `mfaEnabled`
   - Adicionar funções: `enrollMFA`, `verifyMFA`, `challengeMFA`, `verifyChallenge`, `unenrollMFA`, `refreshMFAStatus`
   - Atualizar `AuthContextValue` interface

2. **`libs/auth.ts`**
   - Modificar `signIn` para verificar se usuário tem MFA ativo
   - Adicionar lógica de redirecionamento para desafio MFA
   - Atualizar `signUp` se necessário

3. **`app/auth/signin/page.tsx`** ou formulário de login
   - Adicionar fluxo de desafio MFA após senha válida
   - Redirecionar para `/auth/mfa/challenge` se MFA ativo

4. **`types/database.ts`**
   - Adicionar campos MFA à tabela `profiles`

5. **`libs/types.ts`**
   - Adicionar interfaces `MFAEnrollment`, `MFAChallenge`, `UserSecuritySettings`

6. **`components/layouts/Navbar.jsx`** ou perfil do usuário
   - Adicionar link para configurações MFA
   - Indicador visual de MFA ativo

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`enrollMFA(): Promise<{ qrCode: string; secret: string }>`**
   - Location: `libs/mfa.ts` / `contexts/AuthContext.tsx`
   - Purpose: Iniciar registro MFA, gerar secret TOTP
   - Returns: QR code URL e secret para o usuário

2. **`verifyMFAEnrollment(code: string): Promise<boolean>`**
   - Location: `libs/mfa.ts`
   - Purpose: Verificar código TOTP para ativar MFA
   - Returns: Sucesso ou falha

3. **`createMFAChallenge(): Promise<MFAChallenge>`**
   - Location: `libs/mfa.ts`
   - Purpose: Criar desafio MFA após login
   - Returns: Objeto com challenge ID e expiração

4. **`verifyMFAChallenge(challengeId: string, code: string): Promise<boolean>`**
   - Location: `libs/mfa.ts`
   - Purpose: Verificar código do desafio
   - Returns: Sucesso ou falha

5. **`unenrollMFA(factorId: string): Promise<void>`**
   - Location: `libs/mfa.ts`
   - Purpose: Remover registro MFA
   - Returns: Promise vazia

6. **`generateBackupCodes(count: number = 10): string[]`**
   - Location: `libs/mfa.ts`
   - Purpose: Gerar códigos de backup únicos
   - Returns: Array de códigos

7. **`verifyBackupCode(code: string, storedCodes: string[]): boolean`**
   - Location: `libs/mfa.ts`
   - Purpose: Verificar código de backup
   - Returns: Válido ou não

8. **`useMFA()` hook**
   - Location: `hooks/auth/useMFA.ts`
   - Returns: `{ enroll, verify, challenge, verifyChallenge, unenroll, enrollments, loading, error }`

### Modified Functions

1. **`libs/auth.ts - signIn(email, password)`**
   - Modify: Após autenticação bem-sucedida, verificar se MFA está ativo
   - Add: Se MFA ativo, criar challenge e redirecionar para `/auth/mfa/challenge`
   - Add: Retornar status de MFA necessário

2. **`contexts/AuthContext.tsx - AuthProvider`**
   - Add: Estados para MFA
   - Add: Funções de MFA
   - Add: Verificação de MFA no carregamento inicial

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

---

## Dependencies

### New Packages
- **`speakeasy`** (para TOTP): `npm install speakeasy`
- **`qrcode`** (para gerar QR code): `npm install qrcode`
- **`@types/speakeasy`** e **`@types/qrcode`** para TypeScript

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/auth/MFAEnroll.test.tsx`**
   - Testar renderização do componente
   - Testar exibição de QR code
   - Testar verificação de código
   - Testar estados de loading e erro

2. **`__tests__/components/auth/MFAChallenge.test.tsx`**
   - Testar renderização do desafio
   - Testar verificação de código
   - Testar código de backup
   - Testar redirecionamento após sucesso

3. **`__tests__/hooks/auth/useMFA.test.ts`**
   - Testar hook de MFA
   - Mock das funções do Supabase MFA
   - Testar estados e transições

4. **`__tests__/libs/mfa.test.ts`**
   - Testar geração de backup codes
   - Testar verificação de TOTP
   - Testar validação de backup codes
   - Mock do speakeasy

### Existing Test Modifications
- Atualizar testes do `AuthContext` para incluir novos estados MFA
- Atualizar testes de `signIn` para cobrir fluxo MFA

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_mfa_fields.sql`
   - Adicionar campos `mfa_enabled`, `mfa_enrolled_at`, `backup_codes` à tabela `profiles`
   - Criar políticas RLS se necessário
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novos campos
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create MFA Utilities**
   - Criar `libs/mfa.ts` com funções utilitárias
   - Implementar integração com Supabase MFA API
   - Implementar geração de backup codes
   - Testar isoladamente

4. **Create Custom Hook**
   - Criar `hooks/auth/useMFA.ts`
   - Seguir padrão dos hooks existentes
   - Testar hook isoladamente

5. **Update AuthContext**
   - Adicionar estados MFA ao contexto
   - Adicionar funções MFA
   - Atualizar provedor com novas funcionalidades
   - Testar contexto atualizado

6. **Modify SignIn Flow**
   - Atualizar `libs/auth.ts` - `signIn` function
   - Adicionar verificação de MFA pós-login
   - Implementar redirecionamento para desafio

7. **Create UI Components**
   - Criar `components/auth/MFAEnroll.tsx`
   - Criar `components/auth/MFAVerify.tsx`
   - Criar `components/auth/MFAChallenge.tsx`
   - Criar `components/auth/BackupCodes.tsx`

8. **Create Pages**
   - Criar `app/auth/mfa/enroll/page.tsx`
   - Criar `app/auth/mfa/verify/page.tsx`
   - Criar `app/auth/mfa/challenge/page.tsx`

9. **Integrate with Navigation/Profile**
   - Adicionar link para configurações MFA no perfil
   - Adicionar indicador visual de MFA ativo na Navbar

10. **Testing**
    - Criar testes para novos componentes
    - Criar testes para novo hook
    - Criar testes para utilitários
    - Executar `npm test` e garantir que todos passam

11. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit com Conventional Commits: `feat(auth): implement two-factor authentication (2FA)`

---

## Acceptance Criteria Checklist

- [ ] Utilizadores podem ativar 2FA nas configurações de segurança
- [ ] Registro MFA via QR code (TOTP - Google Authenticator, Authy, etc.)
- [ ] Verificação de código MFA durante login
- [ ] Geração e verificação de códigos de backup
- [ ] Possibilidade de desativar MFA
- [ ] Integração com o sistema de autenticação existente (Supabase Auth)
- [ ] Indicador visual de MFA ativo no perfil/navbar
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
# Issue #4: Security - Implementar Sistema de Conta e Verificação

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/4

**Status:** Pending

---

## Overview

### Context
O FoodLister já possui um sistema básico de autenticação implementado com Supabase Auth. O sistema atual inclui:
- Registro e login de usuários
- Recuperação de senha via email
- Perfis de usuário com privacidade configurável
- Sistema de códigos de usuário (FL000001)
- Row Level Security (RLS) implementado nas tabelas principais
- Políticas de segurança aplicadas via migrações

### Why Needed
O sistema atual carece de:
1. **Verificação de email robusta** - Não há feedback claro sobre status de verificação
2. **Sistema de verificação de conta** - Ausência de distinção entre contas verificadas/não verificadas
3. **Segurança aprimorada** - Falta de proteções contra ataques de força bruta
4. **Gestão de sessão** - Necessidade de melhor controle de sessões ativas

### How It Fits Into the System
Esta implementação expandirá o `AuthContext.tsx` existente, adicionará novos campos à tabela `profiles`, criará novas páginas de verificação e aprimorará a segurança do sistema atual sem quebrar a funcionalidade existente.

---

## Types

### New Type Definitions (to be added to `libs/types.ts` and `types/database.ts`)

```typescript
// libs/types.ts

export interface VerificationStatus {
  isVerified: boolean;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  verifiedAt: string | null;
  verificationMethod: 'email' | 'phone' | 'both' | null;
}

export interface AccountSecurity {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
  activeSessions: number;
  lastLogin: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
}

export interface UserAccount extends User {
  verification: VerificationStatus;
  security: AccountSecurity;
}

export type VerificationMethod = 'email' | 'phone' | 'both';

export interface VerificationRequest {
  userId: string;
  method: VerificationMethod;
  token: string;
  expiresAt: string;
  used: boolean;
}
```

### Database Types Update (types/database.ts)

```typescript
// Add to Database['public']['Tables']
profiles: {
  Row: {
    // ... existing fields ...
    is_verified: boolean | null;
    verified_at: string | null;
    verification_method: string | null;
    phone: string | null;
    phone_verified: boolean | null;
    two_factor_enabled: boolean | null;
    last_password_change: string | null;
    login_attempts: number | null;
    locked_until: string | null;
  };
  Insert: {
    // ... existing fields ...
    is_verified?: boolean | null;
    verified_at?: string | null;
    verification_method?: string | null;
    phone?: string | null;
    phone_verified?: boolean | null;
    two_factor_enabled?: boolean | null;
    last_password_change?: string | null;
    login_attempts?: number | null;
    locked_until?: string | null;
  };
  Update: {
    // ... existing fields ...
    is_verified?: boolean | null;
    verified_at?: string | null;
    verification_method?: string | null;
    phone?: string | null;
    phone_verified?: boolean | null;
    two_factor_enabled?: boolean | null;
    last_password_change?: string | null;
    login_attempts?: number | null;
    locked_until?: string | null;
  };
}
```

---

## Files

### New Files to Create

1. **`app/auth/verify/email/page.tsx`** - Página de verificação de email
2. **`app/auth/verify/phone/page.tsx`** - Página de verificação de telefone
3. **`app/auth/verify/success/page.tsx`** - Página de sucesso na verificação
4. **`app/auth/security/page.tsx`** - Página de segurança da conta
5. **`components/auth/EmailVerification.tsx`** - Componente de verificação de email
6. **`components/auth/PhoneVerification.tsx`** - Componente de verificação de telefone
7. **`components/auth/VerificationStatus.tsx`** - Componente de status de verificação
8. **`components/auth/SecuritySettings.tsx`** - Componente de configurações de segurança
9. **`hooks/auth/useVerification.ts`** - Hook para gerenciar verificação
10. **`hooks/auth/useAccountSecurity.ts`** - Hook para segurança da conta
11. **`libs/verification.ts`** - Utilitários de verificação
12. **`supabase/migrations/YYYYMMDDHHMMSS_add_verification_fields.sql`** - Migration para campos de verificação

### Existing Files to Modify

1. **`contexts/AuthContext.tsx`**
   - Adicionar estados de verificação ao contexto
   - Adicionar funções de verificação
   - Atualizar `AuthContextValue` interface

2. **`types/database.ts`**
   - Adicionar novos campos à tabela `profiles`
   - Atualizar tipos de inserção e atualização

3. **`libs/types.ts`**
   - Adicionar interfaces de verificação e segurança
   - Atualizar `User` interface se necessário

4. **`app/auth/layout.js`** ou **`components/layouts/AuthLayout.jsx`**
   - Adicionar links para verificação no layout de auth

5. **`components/layouts/Navbar.jsx`** ou componente de navegação
   - Adicionar indicador de status de verificação na navbar
   - Link para configurações de segurança

6. **`libs/supabase/client.ts`** e **`libs/supabase/server.ts`**
   - Verificar se precisam de atualizações para novas funcionalidades

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`sendVerificationEmail(userId: string): Promise<{error: any}>`**
   - Location: `libs/verification.ts`
   - Purpose: Enviar email de verificação
   - Returns: Promise com erro ou sucesso

2. **`verifyEmailToken(token: string): Promise<{success: boolean, error: any}>`**
   - Location: `libs/verification.ts`
   - Purpose: Verificar token de email
   - Returns: Promise com sucesso ou erro

3. **`sendPhoneVerification(userId: string, phone: string): Promise<{error: any}>`**
   - Location: `libs/verification.ts`
   - Purpose: Enviar código de verificação por SMS
   - Returns: Promise com erro ou sucesso

4. **`verifyPhoneCode(userId: string, code: string): Promise<{success: boolean, error: any}>`**
   - Location: `libs/verification.ts`
   - Purpose: Verificar código SMS
   - Returns: Promise com sucesso ou erro

5. **`checkVerificationStatus(userId: string): Promise<VerificationStatus>`**
   - Location: `libs/verification.ts`
   - Purpose: Verificar status de verificação do usuário
   - Returns: Promise com status de verificação

6. **`updateSecuritySettings(userId: string, settings: Partial<AccountSecurity>): Promise<{error: any}>`**
   - Location: `libs/verification.ts`
   - Purpose: Atualizar configurações de segurança
   - Returns: Promise com erro ou sucesso

7. **`useVerification()` hook**
   - Location: `hooks/auth/useVerification.ts`
   - Returns: `{ sendEmail, verifyEmail, sendPhone, verifyPhone, status, loading, error }`
   - Purpose: Gerenciar estado de verificação

8. **`useAccountSecurity()` hook**
   - Location: `hooks/auth/useAccountSecurity.ts`
   - Returns: `{ security, updateSettings, loading, error }`
   - Purpose: Gerenciar configurações de segurança

### Modified Functions

1. **`AuthContext.tsx` - `AuthProvider` component**
   - Add: `verificationStatus` state
   - Add: `checkVerification` function
   - Add: `sendVerification` function
   - Update: `user` object para incluir status de verificação

2. **`libs/auth.ts` - `signUp` function**
   - Modify: Enviar email de verificação automaticamente após registro
   - Add: Parâmetro opcional para phone number

3. **`libs/auth.ts` - `signIn` function**
   - Modify: Verificar se conta está bloqueada (locked_until)
   - Add: Incrementar login_attempts em falha
   - Add: Reset login_attempts em sucesso

---

## Classes

### New Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

### Modified Classes
- Nenhuma classe modificada (o projeto usa abordagem funcional com hooks)

---

## Dependencies

### New Packages
- **`twilio`** (opcional, para verificação por SMS): `npm install twilio`
- **`speakeasy`** (para 2FA): `npm install speakeasy`
- **`qrcode`** (para gerar QR code do 2FA): `npm install qrcode`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/auth/EmailVerification.test.tsx`**
   - Testar renderização do componente
   - Testar envio de email
   - Testar estados de loading e erro

2. **`__tests__/components/auth/PhoneVerification.test.tsx`**
   - Testar renderização do componente
   - Testar verificação de código
   - Testar estados de loading e erro

3. **`__tests__/hooks/auth/useVerification.test.ts`**
   - Testar hook de verificação
   - Mock das funções de verificação
   - Testar estados e transições

4. **`__tests__/libs/verification.test.ts`**
   - Testar funções utilitárias de verificação
   - Mock do cliente Supabase
   - Testar cenários de sucesso e erro

### Existing Test Modifications
- Atualizar testes do `AuthContext` para incluir novos estados de verificação
- Atualizar testes de `signUp` e `signIn` para cobrir novos cenários

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_verification_fields.sql`
   - Adicionar campos à tabela `profiles`
   - Criar políticas RLS para novos campos
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novos campos
   - Atualizar `libs/types.ts` com novas interfaces
   - Verificar se tipos estão corretos com `npm run build`

3. **Create Verification Utilities**
   - Criar `libs/verification.ts` com funções utilitárias
   - Implementar envio de email de verificação
   - Implementar verificação de tokens
   - (Opcional) Implementar verificação por SMS

4. **Create Custom Hooks**
   - Criar `hooks/auth/useVerification.ts`
   - Criar `hooks/auth/useAccountSecurity.ts`
   - Testar hooks isoladamente

5. **Update AuthContext**
   - Adicionar estados de verificação ao contexto
   - Adicionar funções de verificação
   - Atualizar provedor com novas funcionalidades
   - Testar contexto atualizado

6. **Create UI Components**
   - Criar `components/auth/EmailVerification.tsx`
   - Criar `components/auth/PhoneVerification.tsx`
   - Criar `components/auth/VerificationStatus.tsx`
   - Criar `components/auth/SecuritySettings.tsx`

7. **Create Pages**
   - Criar `app/auth/verify/email/page.tsx`
   - Criar `app/auth/verify/phone/page.tsx`
   - Criar `app/auth/verify/success/page.tsx`
   - Criar `app/auth/security/page.tsx`

8. **Integrate with Navigation**
   - Adicionar indicador de verificação na Navbar
   - Adicionar links para páginas de verificação
   - Testar fluxo completo

9. **Testing**
   - Criar testes para novos componentes
   - Criar testes para novos hooks
   - Criar testes para utilitários
   - Executar `npm test` e garantir que todos passam

10. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit com Conventional Commits: `feat(auth): implement account verification system`

---

## Acceptance Criteria Checklist

- [ ] Sistema de criação de contas funcional (já existe, verificar integridade)
- [ ] Processo de verificação de email implementado
- [ ] Processo de verificação de telefone implementado (opcional)
- [ ] Status de verificação visível para o usuário
- [ ] Integração com o sistema de autenticação existente (Supabase Auth)
- [ ] Proteção contra ataques de força bruta (login attempts)
- [ ] Configurações de segurança da conta acessíveis
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
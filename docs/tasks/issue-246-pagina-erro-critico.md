# Issue #246: Feature/Design - Criar página para quando o site tiver down ou der um erro crítico

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/246

**Status:** Pending

---

## Overview

### Context
O FoodLister atualmente não possui páginas de erro customizadas para situações críticas. O Next.js possui tratamento padrão de erros, mas não reflete a identidade visual do FoodLister.

Componentes existentes relacionados:
- `components/ui/common/ErrorBoundary.tsx` - Error boundary para componentes React (client-side)
- `app/layout.js` - Root layout sem tratamento específico de erro crítico
- `app/globals.css` - Possui variáveis CSS para cores de erro (`--error`, `--error-50`, `--error-100`, etc.)

O logo existe em `public/logo.svg` (SVG inline com ícone de garfo e faca).

### Why Needed
- Melhorar a experiência do usuário quando ocorre um erro crítico ou o site está indisponível
- Fornecer feedback visual claro e amigável em situações de falha
- Manter consistência visual com o design system do FoodLister
- Reduzir frustração do usuário com páginas de erro genéricas do Next.js/browser
- Permitir que o usuário tente recuperar a sessão ou navegue para áreas funcionais

### How It Fits Into the System
Criaremos páginas de erro customizadas usando os arquivos de erro do Next.js (`error.tsx`, `not-found.tsx`, `global-error.tsx`) e um componente `ErrorPage` reutilizável que será usado em pontos estratégicos da aplicação.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showLogo?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export interface ErrorConfig {
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

export type ErrorType = '500' | '404' | '403' | 'network' | 'timeout' | 'maintenance' | 'critical';
```

---

## Files

### New Files to Create

1. **`components/ui/ErrorPage.tsx`** - Componente reutilizável para páginas de erro
2. **`components/ui/ErrorIllustration.tsx`** - Ilustrações SVG para diferentes tipos de erro
3. **`app/error.tsx`** - Error page global para erros no Server Components (Next.js App Router)
4. **`app/global-error.tsx`** - Error page para erros no root layout (Next.js 14+)
5. **`app/not-found.tsx`** - Página 404 customizada
6. **`app/maintenance/page.tsx`** - Página para manutenção planejada
7. **`app/offline/page.tsx`** - Página para quando o site está offline/indisponível
8. **`hooks/ui/useErrorHandler.ts`** - Hook para gerenciar erros globalmente
9. **`libs/error-messages.ts`** - Mensagens de erro padronizadas
10. **`public/illustrations/error-500.svg`** - Ilustração para erro 500 (opcional)
11. **`public/illustrations/error-404.svg`** - Ilustração para erro 404 (opcional)
12. **`public/illustrations/error-network.svg`** - Ilustração para erro de rede (opcional)
13. **`__tests__/components/ui/ErrorPage.test.tsx`** - Testes do ErrorPage
14. **`__tests__/hooks/ui/useErrorHandler.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`app/globals.css`**
   - Adicionar estilos específicos para páginas de erro
   - Animações para o logo em caso de erro
   - Estilos para botões de retry, home, etc.

2. **`components/ui/common/ErrorBoundary.tsx`**
   - Refatorar para usar o novo `ErrorPage` component
   - Manter compatibilidade com ErrorBoundary existente

3. **`app/layout.js`**
   - Verificar se precisa de ajustes para o `error.tsx` funcionar
   - O `error.tsx` deve estar no mesmo nível do `layout.js`

### Files to Delete
- Nenhum (manter ErrorBoundary existente, apenas refatorar)

---

## Functions

### New Functions

1. **`ErrorPage({ error, reset, title, description, showLogo, showHomeButton, showRetryButton, fullScreen, className }: ErrorPageProps)`**
   - Location: `components/ui/ErrorPage.tsx`
   - Purpose: Página de erro reutilizável com logo e mensagens amigáveis
   - Returns: JSX.Element

2. **`ErrorIllustration({ type, size }: { type: ErrorType; size?: number })`**
   - Location: `components/ui/ErrorIllustration.tsx`
   - Purpose: Ilustração SVG baseada no tipo de erro
   - Returns: JSX.Element (SVG ou emoji)

3. **`getErrorMessage(error: Error, type?: ErrorType): ErrorConfig`**
   - Location: `libs/error-messages.ts`
   - Purpose: Retornar configuração de erro baseada no tipo
   - Returns: `ErrorConfig`

4. **`useErrorHandler()`**
   - Location: `hooks/ui/useErrorHandler.ts`
   - Returns: `{ handleError, clearError, error, errorInfo }`
   - Purpose: Hook para gerenciar estado de erro globalmente

5. **`reportError(error: Error, errorInfo?: any): Promise<void>`**
   - Location: `libs/error-messages.ts`
   - Purpose: Reportar erro para serviço externo (Sentry, LogRocket, etc.) - opcional
   - Returns: Promise vazia

### Modified Functions

1. **`components/ui/common/ErrorBoundary.tsx - ErrorBoundary component`**
   - Modify: Usar `ErrorPage` component no `render()` ou `fallback`
   - Add: Suporte a diferentes tipos de erro
   - Add: Botão de retry que chama `reset()`

---

## Classes
- Nenhuma classe nova (usando componentes funcionais e hooks)

---

## Dependencies

### New Packages
- Nenhum obrigatório (usar Tailwind CSS e SVG inline)
- Opcional: **`lucide-react`** para ícones de erro (se não estiver já no projeto)
- Opcional: **`sentry`** para monitoramento de erros em produção

### Version Changes
- Nenhuma alteração de versão obrigatória

---

## Testing

### New Test Files

1. **`__tests__/components/ui/ErrorPage.test.tsx`**
   - Testar renderização com diferentes props
   - Testar exibição de logo
   - Testar botões de retry e home
   - Testar diferentes tipos de erro

2. **`__tests__/hooks/ui/useErrorHandler.test.ts`**
   - Testar hook de gerenciamento de erro
   - Testar `handleError`
   - Testar `clearError`
   - Testar persistência de erro no estado

3. **`__tests__/libs/error-messages.test.ts`**
   - Testar `getErrorMessage` para diferentes tipos
   - Testar mensagens padrão vs customizadas

### Existing Test Modifications
- Atualizar testes do `ErrorBoundary.tsx` se refatorado

---

## Implementation Order

1. **Create ErrorPage Component**
   - Criar `components/ui/ErrorPage.tsx`
   - Integrar logo do FoodLister
   - Adicionar mensagens amigáveis
   - Suportar diferentes tipos de erro
   - Seguir design system (Tailwind + CSS variables)

2. **Create ErrorIllustration Component**
   - Criar `components/ui/ErrorIllustration.tsx`
   - Criar ilustrações SVG simples para 404, 500, network, etc.
   - Ou usar emojis/ícones como fallback

3. **Create Error Messages Config**
   - Criar `libs/error-messages.ts`
   - Definir mensagens para cada tipo de erro
   - Suportar internacionalização (i18n) se aplicável

4. **Create Next.js Error Pages**
   - Criar `app/error.tsx` (Server Component errors)
   - Criar `app/global-error.tsx` (Root layout errors)
   - Criar `app/not-found.tsx` (404 customizado)
   - Cada um usando o componente `ErrorPage`

5. **Create Maintenance/Offline Pages**
   - Criar `app/maintenance/page.tsx` (manutenção planejada)
   - Criar `app/offline/page.tsx` (site indisponível)
   - Mensagens específicas para cada situação

6. **Create Error Handler Hook**
   - Criar `hooks/ui/useErrorHandler.ts`
   - Gerenciar estado de erro globalmente
   - Integrar com ErrorBoundary existente

7. **Update Existing ErrorBoundary**
   - Refatorar `components/ui/common/ErrorBoundary.tsx`
   - Usar novo `ErrorPage` component
   - Manter compatibilidade com código existente

8. **Add CSS Styles**
   - Atualizar `app/globals.css` se necessário
   - Adicionar estilos específicos para páginas de erro
   - Animações suaves para logo/ilustrações

9. **Testing**
   - Criar testes para ErrorPage
   - Criar testes para hook
   - Criar testes para mensagens de erro
   - Executar `npm test`

10. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(ui): add custom error pages with FoodLister branding`

---

## Design Specifications

### Visual Elements
1. **Logo**: Sempre visível no topo da página de erro
2. **Ilustração**: SVG amigável representando o erro (opcional, pode ser emoji)
3. **Cores**: Usar design system (`--error`, `--error-50`, etc.)
4. **Tipografia**: Seguir padrão do projeto (font-family do Tailwind)

### Error Types and Messages

| Error Type | Title | Description | Icon |
|------------|-------|-------------|------|
| 500 | Oops! Algo correu mal | Estamos trabalhando para resolver. Tente novamente em alguns minutos. | ⚠️ |
| 404 | Página não encontrada | A página que procuras não existe ou foi movida. | 🔍 |
| 403 | Acesso negado | Não tens permissão para aceder a esta página. | 🚫 |
| network | Problema de conexão | Verifica a tua internet e tenta novamente. | 🌐 |
| timeout | Tempo esgotado | O servidor demorou muito a responder. Tenta novamente. | ⏱️ |
| maintenance | Em manutenção | Estamos a melhorar o FoodLister. Voltamos em breve! | 🛠️ |
| critical | Erro crítico | Ocorreu um erro inesperado. A equipa técnica foi notificada. | 🚨 |

### Responsive Design
- Mobile: Logo menor, mensagens mais compactas
- Desktop: Logo maior, ilustrações maiores
- Texto responsivo usando classes do Tailwind

---

## Acceptance Criteria Checklist

- [ ] Página de erro 500 customizada criada (`app/error.tsx`)
- [ ] Página de erro 404 customizada criada (`app/not-found.tsx`)
- [ ] Página para manutenção criada (`app/maintenance/page.tsx`)
- [ ] Página para site offline/indisponível criada (`app/offline/page.tsx`)
- [ ] Logo do FoodLister integrado nas páginas de erro
- [ ] Mensagens de erro amigáveis e em Português
- [ ] Botões de retry e voltar para home funcionais
- [ ] Componente `ErrorPage` reutilizável criado
- [ ] Design responsivo (mobile e desktop)
- [ ] Testes unitários para novos componentes e hook
- [ ] Documentação atualizada (memory-bank/)
# Issue #119: Design - Adicionar Loading Screens com o Logo

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/119

**Status:** Pending

---

## Overview

### Context
O FoodLister já possui alguns componentes de loading:
- `app/users/[id]/loading.tsx` - Loading screen para perfil de usuário com skeleton UI
- `components/ui/profile/sections/shared/SkeletonLoader.tsx` - Skeleton loaders
- `components/ui/profile/sections/restaurants/RestaurantSkeletonLoader.tsx` - Skeleton específico

O logo existe em `public/logo.svg` (SVG inline com ícone de garfo e faca).

### Why Needed
- Melhorar a experiência do usuário durante carregamentos
- Fornecer feedback visual claro de que a aplicação está a carregar
- Manter consistência visual com o logo do FoodLister
- Reduzir percepção de lentidão

### How It Fits Into the System
Criaremos um componente `LoadingScreen` reutilizável que será usado em pontos estratégicos da aplicação via Next.js loading.tsx files e Suspense boundaries.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  className?: string;
}

export interface LogoSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}
```

---

## Files

### New Files to Create

1. **`components/ui/LoadingScreen.tsx`** - Componente principal de loading screen com logo
2. **`components/ui/LogoSpinner.tsx`** - Spinner animado com o logo
3. **`components/ui/SkeletonCard.tsx`** - Skeleton card reutilizável
4. **`app/loading.tsx`** - Loading screen global da aplicação (root layout)
5. **`app/restaurants/loading.tsx`** - Loading para página de restaurantes
6. **`app/lists/loading.tsx`** - Loading para páginas de listas
7. **`app/meals/loading.tsx`** - Loading para páginas de refeições
8. **`app/notifications/loading.tsx`** - Loading para notificações
9. **`app/auth/loading.tsx`** - Loading para páginas de autenticação
10. **`__tests__/components/ui/LoadingScreen.test.tsx`** - Testes do LoadingScreen
11. **`__tests__/components/ui/LogoSpinner.test.tsx`** - Testes do LogoSpinner

### Existing Files to Modify

1. **`app/globals.css`**
   - Adicionar animações CSS para o spinner/logo
   - Adicionar keyframes para pulse, spin, bounce effects

2. **`app/users/[id]/loading.tsx`**
   - Refatorar para usar o novo `LoadingScreen` component
   - Manter skeleton UI mas integrar logo

3. **`components/ui/profile/sections/shared/SkeletonLoader.tsx`**
   - Opcionalmente refatorar para usar `LoadingScreen`

### Files to Delete
- Nenhum (manter skeletons existentes como opção)

---

## Functions

### New Functions

1. **`LoadingScreen({ message, showLogo, size, fullScreen, className }: LoadingScreenProps)`**
   - Location: `components/ui/LoadingScreen.tsx`
   - Purpose: Tela de loading completa com logo
   - Returns: JSX.Element

2. **`LogoSpinner({ size, color, className }: LogoSpinnerProps)`**
   - Location: `components/ui/LogoSpinner.tsx`
   - Purpose: Spinner animado baseado no logo
   - Returns: JSX.Element (SVG animado)

3. **`SkeletonCard({ className }: { className?: string })`**
   - Location: `components/ui/SkeletonCard.tsx`
   - Purpose: Card skeleton reutilizável
   - Returns: JSX.Element

### Modified Functions
- Nenhuma função existente modificada significativamente

---

## Classes
- Nenhuma classe nova (usando componentes funcionais)

---

## Dependencies

### New Packages
- Nenhum novo pacote necessário (usar Tailwind CSS animations)

### Version Changes
- Nenhuma alteração de versão obrigatória

---

## Testing

### New Test Files

1. **`__tests__/components/ui/LoadingScreen.test.tsx`**
   - Testar renderização com diferentes props
   - Testar estados fullScreen vs inline
   - Testar exibição de mensagens

2. **`__tests__/components/ui/LogoSpinner.test.tsx`**
   - Testar renderização do SVG
   - Testar animações aplicadas
   - Testar diferentes tamanhos

### Existing Test Modifications
- Atualizar testes de `app/users/[id]/loading.tsx` se refatorado

---

## Implementation Order

1. **Create CSS Animations**
   - Adicionar keyframes em `app/globals.css`:
     - `logo-pulse` - pulso suave
     - `logo-spin` - rotação lenta
     - `logo-bounce` - salto
   - Usar Tailwind `@keyframes` no `tailwind.config.js` se necessário

2. **Create LogoSpinner Component**
   - Criar `components/ui/LogoSpinner.tsx`
   - Usar SVG do logo de `public/logo.svg`
   - Adicionar animação CSS
   - Suportar diferentes tamanhos

3. **Create LoadingScreen Component**
   - Criar `components/ui/LoadingScreen.tsx`
   - Integrar LogoSpinner
   - Adicionar mensagem opcional
   - Suportar fullScreen vs inline
   - Seguir design system (Tailwind + CSS variables)

4. **Create SkeletonCard Component**
   - Criar `components/ui/SkeletonCard.tsx`
   - Reutilizar padrão dos skeletons existentes
   - Usar animação pulse do Tailwind

5. **Create Global Loading (app/loading.tsx)**
   - Criar loading screen para o root layout
   - Usar LoadingScreen com fullScreen=true
   - Mensagem: "A carregar FoodLister..."

6. **Create Section Loading Screens**
   - `app/restaurants/loading.tsx`
   - `app/lists/loading.tsx`
   - `app/meals/loading.tsx`
   - `app/notifications/loading.tsx`
   - `app/auth/loading.tsx`
   - Cada um com mensagem contextual

7. **Refactor Existing Loading**
   - Atualizar `app/users/[id]/loading.tsx` para usar LoadingScreen
   - Manter skeleton UI abaixo do logo

8. **Testing**
   - Criar testes para LoadingScreen
   - Criar testes para LogoSpinner
   - Criar testes para SkeletonCard
   - Executar `npm test`

9. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `feat(ui): add loading screens with logo animation`

---

## Design Specifications

### Logo Animation Options
1. **Pulse Effect**: Logo cresce e diminui suavemente
2. **Spin Effect**: Logo roda 360 graus continuamente
3. **Bounce Effect**: Logo salta para cima e para baixo
4. **Combined**: Pulse + rotação lenta

### Color Scheme
- Usar cores do design system (CSS variables)
- Primary color para o spinner
- Logo SVG original respeitando cores do tema

### Responsive Design
- Mobile: Logo menor (48x48)
- Desktop: Logo maior (64x64 ou 80x80)
- Texto responsivo

---

## Acceptance Criteria Checklist

- [ ] Loading screens adicionados aos pontos estratégicos (restaurants, lists, meals, notifications, auth)
- [ ] Logo do FoodLister integrado nas loading screens
- [ ] Animação suave do logo durante carregamento
- [ ] Componente LoadingScreen reutilizável criado
- [ ] Loading global (app/loading.tsx) implementado
- [ ] Skeleton loaders mantidos e integrados
- [ ] Design responsivo (mobile e desktop)
- [ ] Testes unitários para novos componentes
- [ ] Documentação atualizada (memory-bank/)
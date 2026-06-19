# Issue #279: Adicionar Tooltips

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/279

**Status:** Pending

---

## Objetivo

Substituir os tooltips nativos do navegador (atributo `title`) por tooltips customizados, estilizados e acessíveis em toda a aplicação, priorizando a navegação (Navbar).

## Contexto

Atualmente, o FoodLister utiliza o atributo HTML nativo `title` para exibir dicas em elementos interativos, como o botão do menu do utilizador na Navbar. Estes tooltips têm estilo limitado ao navegador, não são acessíveis para leitores de tela e não seguem o design system da aplicação (cores, bordas, tipografia).

A implementação de um componente de Tooltip reutilizável permitirá manter a consistência visual e melhorar a experiência do utilizador e a acessibilidade.

---

## Passos de Implementação

### 1. Instalar Dependências (Recomendado)

Para garantir acessibilidade e posicionamento automático, recomenda-se utilizar o Radix UI Tooltip:

```bash
npm install @radix-ui/react-tooltip
```

Caso opte por uma solução customizada sem bibliotecas externas, pular este passo e implementar usando React + Tailwind CSS.

### 2. Criar Componente Tooltip Reutilizável

Criar o arquivo `components/ui/common/Tooltip.tsx` seguindo o padrão de outros componentes comuns (ex: `ScrollToTop.tsx`).

```typescript
// components/ui/common/Tooltip.tsx
import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils'; // se existir utilitário de classe

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  delayDuration?: number;
}

export const TooltipProvider = Tooltip.Provider;
export const TooltipRoot = Tooltip.Root;
export const TooltipTrigger = Tooltip.Trigger;
export const TooltipContent = Tooltip.Content;
export const TooltipArrow = Tooltip.Arrow;

export function CustomTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
  delayDuration = 200,
}: TooltipProps) {
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span>{children}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align={align}
            className={cn(
              'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className
            )}
          >
            {content}
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

### 3. Adicionar Estilos no Tailwind Config (se necessário)

Verificar se o `tailwind.config.js` já possui as animações necessárias. Caso contrário, adicionar:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in-0': 'fade-in 0.2s ease-out',
        'fade-out-0': 'fade-out 0.2s ease-out',
        'zoom-in-95': 'zoom-in 0.2s ease-out',
        'zoom-out-95': 'zoom-out 0.2s ease-out',
        'slide-in-from-top-2': 'slide-in-from-top 0.2s ease-out',
        // ... outros lados
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // ... outros plugins
  ],
};
```

### 4. Atualizar Navbar (Prioridade)

Modificar `components/layouts/Navbar.jsx` para substituir `title` por `CustomTooltip`:

```tsx
// Antes:
<button title="Menu do utilizador">...</button>

// Depois:
import { CustomTooltip } from '@/components/ui/common/Tooltip';

<CustomTooltip content="Menu do utilizador">
  <button>...</button>
</CustomTooltip>
```

### 5. Criar Provedor Global (Opcional)

Se a aplicação tiver muitos tooltips, adicionar `TooltipProvider` no `app/layout.js`:

```tsx
// app/layout.js
import { TooltipProvider } from '@radix-ui/react-tooltip';

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
```

### 6. Aplicar em Outros Componentes

Identificar outros elementos com `title` e substituir por `CustomTooltip`:

- Botões de ação em cards (Editar, Eliminar, Partilhar)
- Ícones de navegação
- Links com informações adicionais
- Elementos com restrições (ex: botão desabilitado com motivo)

---

## Files

### New Files to Create

1. **`components/ui/common/Tooltip.tsx`** - Componente reutilizável de tooltip
2. **`__tests__/components/ui/common/Tooltip.test.tsx`** - Testes do componente

### Existing Files to Modify

1. **`components/layouts/Navbar.jsx`** (Prioridade)
   - Substituir `title="..."` por `<CustomTooltip>`
   - Aplicar em botões de menu, navegação, etc.

2. **`app/layout.js`** (Opcional)
   - Adicionar `TooltipProvider` se necessário

3. **`tailwind.config.js`** (se necessário)
   - Adicionar animações para tooltips

4. **Outros componentes com `title`**
   - Substituir nativo por `CustomTooltip`

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`CustomTooltip({ content, children, side, align, className, delayDuration }: TooltipProps)`**
   - Location: `components/ui/common/Tooltip.tsx`
   - Purpose: Componente de tooltip acessível e estilizado
   - Returns: JSX.Element

### Modified Functions
- Nenhuma função modificada (apenas substituição de atributos)

---

## Classes
- Nenhuma classe nova (usando componentes funcionais e hooks)

---

## Dependencies

### New Packages
- **`@radix-ui/react-tooltip`**: `npm install @radix-ui/react-tooltip`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/components/ui/common/Tooltip.test.tsx`**
   - Testar renderização do tooltip ao passar o rato (hover)
   - Testar posicionamento (top, right, bottom, left)
   - Testar acessibilidade (atributos ARIA)
   - Testar children renderizados corretamente
   - Testar delay de aparecimento

### Existing Test Modifications
- Atualizar testes da Navbar para verificar tooltips customizados
- Remover verificações de `title` nativo

---

## Implementation Order

1. **Install Dependencies**
   - Executar `npm install @radix-ui/react-tooltip`
   - Verificar se instalado corretamente

2. **Create Tooltip Component**
   - Criar `components/ui/common/Tooltip.tsx`
   - Implementar usando Radix UI
   - Seguir design system (Tailwind + CSS variables)
   - Usar cores: `bg-popover`, `text-popover-foreground`, `border`
   - Testar isoladamente

3. **Add Animations (if needed)**
   - Atualizar `tailwind.config.js` com animações
   - Ou usar animações padrão do Radix

4. **Update Navbar (Priority)**
   - Modificar `components/layouts/Navbar.jsx`
   - Substituir todos os `title="..."` por `<CustomTooltip>`
   - Aplicar em botões de menu do utilizador, links de navegação, etc.
   - Testar hover e posicionamento

5. **Add Global Provider (Optional)**
   - Modificar `app/layout.js` se necessário
   - Adicionar `TooltipProvider` envolvendo children

6. **Apply to Other Components**
   - Procurar por `title="` em todo o projeto
   - Substituir por `CustomTooltip` gradualmente
   - Priorizar componentes de navegação e ações

7. **Testing**
   - Criar testes para o componente `Tooltips.test.tsx`
   - Atualizar testes da Navbar
   - Executar `npm test`

8. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `feat(ui): add custom accessible tooltips`

---

## Design Specifications

### Visual Style (following design system)
- **Background**: `bg-popover` (ou `var(--popover)`)
- **Text**: `text-popover-foreground` (ou `var(--popover-foreground)`)
- **Border**: `border` (sutile, `var(--border)`)
- **Border Radius**: `rounded-md` (medium)
- **Padding**: `px-3 py-1.5` (12px horizontal, 6px vertical)
- **Font Size**: `text-sm` (14px)
- **Shadow**: `shadow-md` (medium shadow)
- **Z-Index**: `z-50` (acima de outros elementos)
- **Arrow**: Pequeno, `fill-popover`, posicionado automaticamente

### Animation
- **Fade In**: 200ms ease-out
- **Zoom In**: 200ms ease-out (95% to 100%)
- **Slide In**: Dependendo do lado (top, right, bottom, left)

### Accessibility (ARIA)
- **Role**: `tooltip`
- **ARIA-describedby**: Automático via Radix
- **Trigger**: Focável via teclado
- **Screen Reader**: Anuncia o conteúdo do tooltip

---

## Acceptance Criteria Checklist

- [ ] Componente `CustomTooltip` reutilizável criado
- [ ] Tooltips substituídos na Navbar (prioridade)
- [ ] Design segue o design system (cores, bordas, tipografia)
- [ ] Acessibilidade implementada (ARIA, teclado, leitores de tela)
- [ ] Animações suaves de aparecimento (fade, zoom, slide)
- [ ] Posicionamento automático (top, right, bottom, left)
- [ ] Aplicado em outros componentes gradualmente
- [ ] Funciona em mobile (touch-friendly)
- [ ] Testes unitários para o novo componente
- [ ] Documentação atualizada (memory-bank/)
# Frontend Agent - FoodList
<!-- TRIGGER: Lê quando crias componentes React, hooks, páginas Next.js, trabalhas com Framer Motion, ou precisas de 'use client' -->

## Especialidade
React 19, Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, TypeScript

---

## Tech Stack Obrigatória

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 15.x | App Router, Server Components, API Routes |
| React | 19.x | Components, Hooks, Context |
| TypeScript | 5.8.x | Strict mode, interfaces, generics |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animações e transições |
| Lucide React | 0.482.x | Ícones |
| React Icons | 5.5.x | Bibliotecas de ícones adicionais |

---

## Padrões do Projeto

### Server Components vs Client Components
- **Default**: Server Components (sem `'use client'`)
- **Usar `'use client'` apenas quando**:
  - Precisa de hooks (`useState`, `useEffect`, etc.)
  - Precisa de event listeners (onClick, onChange, etc.)
  - Usa Context API
  - Usa Framer Motion

### Estrutura de Componentes
```
components/
├── ui/              # Componentes base (Button, Input, Modal, etc.)
├── layouts/         # Layouts principais
├── pages/           # Componentes de página
├── restaurant/      # Componentes específicos de restaurante
├── lists/           # Componentes específicos de listas
└── index.ts         # Barrel exports
```

### Hooks Personalizados
```
hooks/
├── auth/            # Hooks de autenticação
├── data/            # Hooks de fetch de dados
├── forms/           # Hooks de formulários
├── navigation/      # Hooks de navegação
└── ui/              # Hooks de UI
```

---

## Checklist para Novo Componente

- [ ] Definir interface TypeScript para props
- [ ] Criar componente como Server Component por default
- [ ] Adicionar `'use client'` apenas se necessário
- [ ] Usar Tailwind CSS exclusivamente (sem CSS inline)
- [ ] Implementar responsive design (mobile-first)
- [ ] Adicionar estados de loading e error
- [ ] Garantir acessibilidade (aria-labels, keyboard navigation)
- [ ] Exportar via `components/index.ts`
- [ ] Criar teste unitário em `__tests__/components/`

---

## Exemplos de Código

### Componente Base (Server Component)
```tsx
// components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
```

### Componente Cliente com Animação
```tsx
// components/ui/AnimatedButton.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AnimatedButton({ children, onClick, disabled }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
    >
      {children}
    </motion.button>
  );
}
```

### Custom Hook
```tsx
// hooks/data/useRestaurants.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase/client';
import { Restaurant } from '@/libs/types';

export function useRestaurants() {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  return { data, loading, error };
}
```

---

## Erros Comuns a Evitar

1. **Não usar `'use client'`** quando precisa de hooks ou event listeners
2. **CSS inline** em vez de Tailwind CSS
3. **Não definir interfaces TypeScript** para props
4. **Ignorar estados de loading/error** nos componentes
5. **Não usar `next/image`** para otimização de imagens
6. **Esquecer acessibilidade** (aria-labels, alt text, keyboard nav)
7. **Importar de caminhos relativos profundos** - usar aliases `@/`

---

## Performance Tips

- Usar `React.memo` para componentes que renderizam listas
- Usar `useMemo` para cálculos pesados
- Usar `useCallback` para funções passadas como props
- Lazy loading com `React.lazy` e `Suspense`
- Dynamic imports para componentes pesados

---

*Last updated: 2026-04-05*
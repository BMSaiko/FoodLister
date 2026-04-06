---
name: foodlister-frontend
description: FoodLister frontend development patterns. Use when creating React components, pages, hooks, or working with Next.js App Router in the FoodLister project. Covers Server vs Client components, TypeScript patterns, Tailwind CSS v4, Framer Motion animations, and project-specific conventions. Triggers when working with components/, hooks/, contexts/, or app/ pages in the FoodLister project.
---

# FoodLister Frontend Patterns

Project-specific frontend patterns for FoodLister (Next.js 15 + React 19 + TypeScript).

## Core Rules

### Server vs Client Components
- **Default**: Server Components (NO `'use client'`)
- **Use `'use client'` ONLY for**: hooks (`useState`, `useEffect`), event handlers (`onClick`), Context API, Framer Motion, browser APIs
- Always minimize client component boundaries — extract interactive parts into separate components

### TypeScript
- **Strict mode always** — no `any`, use `unknown` when uncertain
- Define interfaces for all props, API responses, database types
- Use utility types: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- Import types from `@/libs/types` and `@/types/database`

### Styling
- **Tailwind CSS exclusively** — no CSS inline, no styled-components
- Mobile-first responsive design (`sm:`, `md:`, `lg:`, `xl:`)
- Use semantic color tokens (`bg-primary`, `text-muted-foreground`)
- Extend theme in `tailwind.config.js` for custom values

### Language
- **All user-facing text in Portuguese** — buttons, labels, placeholders, error messages, toast notifications
- Variable/function names for UI can be in Portuguese (`handleEliminar`, `carregarDados`)

## Component Patterns

### Server Component (default)
```tsx
import { Restaurant } from '@/libs/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-lg font-semibold">{restaurant.name}</h3>
      <p className="text-sm text-muted-foreground">{restaurant.location}</p>
    </div>
  );
}
```

### Client Component (when needed)
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  restaurantId: string;
  initialFavorite: boolean;
}

export default function FavoriteButton({ restaurantId, initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsFavorite(!isFavorite)}
      className="p-2"
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </motion.button>
  );
}
```

### Loading State
```tsx
export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="h-4 w-1/2 bg-muted rounded mt-2" />
    </div>
  );
}
```

### Empty State
```tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-4xl mb-4">🍽️</p>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

## Hook Patterns

### Data Fetching Hook
```tsx
'use client';

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

## Form Patterns

### React Hook Form
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface RestaurantFormValues {
  name: string;
  location: string;
  cuisineType?: string;
}

export default function RestaurantForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RestaurantFormValues>();

  const onSubmit = async (data: RestaurantFormValues) => {
    try {
      // API call
      toast.success('Restaurante criado com sucesso!');
    } catch {
      toast.error('Erro ao criar restaurante');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Nome</label>
        <input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-md">
        {isSubmitting ? 'A guardar...' : 'Guardar'}
      </button>
    </form>
  );
}
```

## Project Structure
```
components/
├── ui/              # Base components (Button, Input, Modal)
├── layouts/         # Main layouts
├── pages/           # Page components
├── restaurant/      # Restaurant-specific components
├── lists/           # List-specific components
contexts/            # React Context (Auth, Filters, Modal)
hooks/
├── auth/            # Auth hooks
├── data/            # Data fetching hooks
├── forms/           # Form hooks
├── navigation/      # Navigation hooks
├── ui/              # UI hooks
```

## Common Imports
```tsx
import { supabase } from '@/libs/supabase/client';
import { createServerClient } from '@/libs/supabase/server';
import { useAuth } from '@/hooks/auth/useAuth';
import { Restaurant, UserList } from '@/libs/types';
import { toast } from 'react-toastify';
```

## Performance Tips
- Use `React.memo` for list items
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props
- Dynamic imports for heavy components: `const Heavy = dynamic(() => import('./Heavy'))`
- Keep client components small and extract interactive parts
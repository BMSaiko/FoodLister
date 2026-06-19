# Issue #265: Feed de Reviews Gerais de Todos os Restaurantes

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/265

**Status:** Pending

---

## Overview

Implementar um feed geral de reviews de todos os restaurantes, permitindo aos utilizadores verem todas as avaliações feitas na plataforma, ordenadas por data (mais recentes primeiro). Este feed funcionará como uma timeline de atividade culinária, semelhante ao feed de atividades em redes sociais.

---

## Contexto Atual

### API Existente
- `app/api/reviews/route.ts`: Atualmente suporta apenas GET com `restaurant_id` (reviews de um restaurante específico)
- `app/api/users/[id]/reviews/route.ts`: Obtém reviews de um utilizador específico com paginação

### Componentes Existentes
- `components/ui/profile/sections/reviews/ReviewCard.tsx`: Card de review reutilizável com info do restaurante
- `components/ui/profile/sections/reviews/UserReviewsSection.tsx`: Secção de reviews com paginação
- `components/ui/restaurantdetails/RestaurantReviewsSection.tsx`: Reviews de um restaurante específico

### Tipos de Dados (types/database.ts)
```typescript
reviews: {
  Row: {
    id: string;
    restaurant_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string | null;
    images: string[] | null;
  };
  // ... Insert, Update
}
```

---

## Types

### Database Schema Changes

#### 1.1 Create Index for Feed Performance

```sql
-- Add index for feed query (order by created_at desc)
CREATE INDEX IF NOT EXISTS idx_reviews_created_at_desc 
  ON public.reviews (created_at DESC);

-- Add composite index for feed with restaurant and user data
CREATE INDEX IF NOT EXISTS idx_reviews_feed 
  ON public.reviews (created_at DESC, restaurant_id, user_id);

-- Add RLS policy if not exists (reviews should already have RLS)
-- Verify existing policies cover public read access for active reviews
```

### TypeScript Type Updates

**File**: `types/database.ts`

```typescript
// No schema changes needed, but we'll create a new interface for feed items

// Add to database types if needed for JOIN queries
reviews_with_details: {
  Row: {
    id: string;
    restaurant_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    images: string[] | null;
    // Joined fields
    restaurant_name: string;
    restaurant_slug: string;
    restaurant_cover_image: string | null;
    user_username: string | null;
    user_full_name: string | null;
    user_avatar_url: string | null;
  };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface ReviewFeedItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantCoverImage: string | null;
  userId: string;
  userName: string | null;
  userFullName: string | null;
  userAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  images: string[] | null;
  createdAt: string;
}

export interface ReviewFeedFilters {
  minRating?: number;
  maxRating?: number;
  userId?: string;
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReviewFeedResponse {
  reviews: ReviewFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}
```

---

## Files

### New Files to Create

1. **`app/api/reviews/feed/route.ts`** - API endpoint para feed geral de reviews
2. **`app/feed/page.tsx`** - Página do feed geral
3. **`app/feed/loading.tsx`** - Loading state para o feed
4. **`components/feed/ReviewFeed.tsx`** - Componente principal do feed com infinite scroll
5. **`components/feed/ReviewFeedItem.tsx`** - Item individual do feed (baseado no ReviewCard)
6. **`components/feed/FeedFilters.tsx`** - Filtros do feed (rating, data, etc.)
7. **`hooks/data/useReviewFeed.ts`** - Hook para gerir feed com paginação
8. **`libs/feed.ts`** - Utilitários para processar feed
9. **`__tests__/api/reviews-feed.test.ts`** - Testes da API
10. **`__tests__/components/feed/ReviewFeed.test.tsx`** - Testes do feed
11. **`__tests__/hooks/data/useReviewFeed.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`app/api/reviews/route.ts`**
   - Modificar GET handler para suportar `feed=true` ou criar nova rota `feed/`
   - Adicionar suporte a cursor-based pagination
   - Adicionar JOINs com `restaurants` e `profiles` tables

2. **`components/ui/profile/sections/reviews/ReviewCard.tsx`**
   - Reutilizar ou estender para `ReviewFeedItem`
   - Adicionar link para restaurante e utilizador

3. **`components/layouts/Navbar.jsx`**
   - Adicionar link para `/feed` na navegação

4. **`types/database.ts`**
   - Adicionar tipo `reviews_with_details` se necessário

5. **`libs/types.ts`**
   - Adicionar interfaces `ReviewFeedItem`, `ReviewFeedFilters`, `ReviewFeedResponse`

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`GET /api/reviews/feed?cursor=&limit=20&minRating=&maxRating=`**
   - Location: `app/api/reviews/feed/route.ts`
   - Purpose: Obter feed geral de reviews com cursor pagination
   - Returns: `ReviewFeedResponse`
   - Query params: `cursor` (timestamp), `limit` (default 20), `minRating`, `maxRating`, `userId`, `restaurantId`

2. **`getReviewFeed(filters?: ReviewFeedFilters, cursor?: string): Promise<ReviewFeedResponse>`**
   - Location: `libs/api.ts` ou `libs/feed.ts`
   - Purpose: Buscar feed de reviews
   - Returns: Promise com reviews e cursor para próxima página

3. **`useReviewFeed(filters?: ReviewFeedFilters)`**
   - Location: `hooks/data/useReviewFeed.ts`
   - Returns: `{ reviews, loading, error, loadMore, hasMore, refresh }`
   - Purpose: Hook para gerir feed com infinite scroll

4. **`ReviewFeed({ filters, onReviewClick }: { filters?: ReviewFeedFilters, onReviewClick?: (review: ReviewFeedItem) => void })`**
   - Location: `components/feed/ReviewFeed.tsx`
   - Purpose: Feed com infinite scroll e loading states
   - Returns: JSX.Element

5. **`ReviewFeedItem({ review, onClick }: { review: ReviewFeedItem, onClick?: () => void })`**
   - Location: `components/feed/ReviewFeedItem.tsx`
   - Purpose: Card de review no feed (mostra restaurante + utilizador)
   - Returns: JSX.Element

6. **`FeedFilters({ filters, onChange }: { filters: ReviewFeedFilters, onChange: (filters: ReviewFeedFilters) => void })`**
   - Location: `components/feed/FeedFilters.tsx`
   - Purpose: Filtros do feed (rating, data)
   - Returns: JSX.Element

### Modified Functions

1. **`app/api/reviews/route.ts - GET handler`**
   - Modify: Adicionar suporte a `feed=true` query param
   - Add: JOIN com `restaurants` e `profiles` tables
   - Add: Cursor-based pagination usando `created_at` e `id`
   - Add: Filtros opcionais (rating, user, restaurant)

2. **`components/ui/profile/sections/reviews/ReviewCard.tsx`**
   - Modify: Tornar reutilizável para feed
   - Add: Link para restaurante e perfil do utilizador
   - Add: Mostrar nome do restaurante e utilizador

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

---

## Dependencies

### New Packages
- **`react-infinite-scroll-component`** (para infinite scroll): `npm install react-infinite-scroll-component`
- **`@types/react-infinite-scroll-component`**: `npm install -D @types/react-infinite-scroll-component`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/api/reviews-feed.test.ts`**
   - Testar GET `/api/reviews/feed` sem filtros
   - Testar cursor pagination
   - Testar filtros (minRating, maxRating, userId, restaurantId)
   - Testar ordenação por data (mais recentes primeiro)
   - Mock do cliente Supabase

2. **`__tests__/components/feed/ReviewFeed.test.tsx`**
   - Testar renderização do feed
   - Testar infinite scroll (load more)
   - Testar estado vazio (sem reviews)
   - Testar estados de loading

3. **`__tests__/hooks/data/useReviewFeed.test.ts`**
   - Testar hook com dados
   - Testar loadMore
   - Testar refresh
   - Testar filtros
   - Mock da API

### Existing Test Modifications
- Atualizar testes de API de reviews para cobrir novo endpoint `/feed`

---

## Implementation Order

1. **Database Optimization**
   - Criar índices para queries de feed (`idx_reviews_created_at_desc`, `idx_reviews_feed`)
   - Verificar se RLS permite leitura pública de reviews
   - Executar scripts SQL no Supabase

2. **Update Types**
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create API Endpoint**
   - Criar `app/api/reviews/feed/route.ts`
   - Implementar GET com cursor pagination
   - Adicionar JOINs com restaurants e profiles
   - Implementar filtros opcionais
   - Testar isoladamente

4. **Create Feed Utilities**
   - Criar `libs/feed.ts` se necessário
   - Funções auxiliares para processar feed

5. **Create Custom Hook**
   - Criar `hooks/data/useReviewFeed.ts`
   - Implementar infinite scroll logic
   - Seguir padrão dos hooks existentes
   - Testar hook isoladamente

6. **Create UI Components**
   - Criar `ReviewFeedItem.tsx` (baseado no ReviewCard)
   - Criar `ReviewFeed.tsx` com infinite scroll
   - Criar `FeedFilters.tsx` para filtros
   - Usar Tailwind CSS e design system

7. **Create Feed Page**
   - Criar `app/feed/page.tsx`
   - Integrar ReviewFeed e FeedFilters
   - Adicionar meta tags SEO
   - Criar loading state `app/feed/loading.tsx`

8. **Update Navigation**
   - Modificar `components/layouts/Navbar.jsx`
   - Adicionar link para `/feed`
   - Ícone apropriado (ex: 📰 ou ícone de feed)

9. **Testing**
   - Criar testes para API endpoint
   - Criar testes para novos componentes
   - Criar testes para hook
   - Atualizar testes existentes
   - Executar `npm test`

10. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(feed): add general reviews feed with infinite scroll`

---

## Design Specifications

### Feed Layout
- **Desktop**: 2-3 colunas de cards (grid)
- **Mobile**: 1 coluna (stacked)
- **Card Design**: Reutilizar estilo do ReviewCard com adições:
  - Nome do restaurante (link clicável)
  - Nome do utilizador (link clicável)
  - Rating com estrelas
  - Comment truncado (expandir se necessário)
  - Images (se houver) em miniatura
  - Data relativa ("há 2 horas", "ontem")

### Infinite Scroll
- Usar `react-infinite-scroll-component`
- Loader "Carregando mais reviews..."
- Fim do feed: "Não há mais reviews"

### Filters
- **Rating**: Slider ou seletor de estrelas (1-5)
- **Data**: Date picker (opcional)
- **Utilizador**: Filtrar por utilizador específico (opcional)
- **Restaurante**: Filtrar por restaurante específico (opcional)

---

## Acceptance Criteria Checklist

- [ ] Feed geral de reviews acessível em `/feed`
- [ ] Reviews ordenadas por data (mais recentes primeiro)
- [ ] Infinite scroll funcional (carrega mais ao rolar)
- [ ] Cada item mostra: restaurante, utilizador, rating, comment, data
- [ ] Links clicáveis para restaurante e perfil do utilizador
- [ ] Filtros funcionais (rating mínimo/máximo)
- [ ] Cursor-based pagination implementado (performance)
- [ ] Design responsivo (mobile e desktop)
- [ ] Loading states e empty states
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
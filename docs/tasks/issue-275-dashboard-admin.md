# Issue #275: Feat - Criar dashboard admin com todos os dados relevantes e estatisticas do uso da webapp

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/275

**Status:** Pending

---

## Overview

### Context
O FoodLister possui um sistema completo de gerenciamento de restaurantes, listas, avaliações e refeições agendadas. O sistema atual inclui:
- Autenticação e autorização com Supabase Auth
- Gerenciamento de restaurantes com visitas e avaliações
- Sistema de listas colaborativas com comentários
- Agendamento de refeições com participantes
- Perfis de usuário com estatísticas individuais
- Notificações em tempo real
- Row Level Security (RLS) implementado em todas as tabelas principais
- API endpoints para todas as entidades principais

### Why Needed
O sistema atual não possui uma interface administrativa para:
1. **Monitoramento de uso** - Não há visão consolidada das estatísticas de uso da aplicação
2. **Gestão de usuários** - Falta visão geral de cadastros, atividade e engajamento
3. **Análise de dados** - Ausência de métricas sobre restaurantes, listas e avaliações
4. **Acompanhamento de crescimento** - Não há dados históricos de crescimento da plataforma
5. **Moderação de conteúdo** - Falta ferramenta para moderar reviews e restaurantes
6. **Tomada de decisão** - Dados necessários para decisões de produto e negócio

### How It Fits Into the System
O dashboard admin será uma seção isolada da aplicação, acessível apenas a utilizadores com role `admin` na tabela `profiles`. Usará os dados existentes via novas queries de agregação e visualizações em tempo real.

---

## Types

### Database Schema Changes

#### 1.1 Add Admin Role to Profiles

```sql
-- Add admin role column to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if user has admin privileges';

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin 
  ON public.profiles(is_admin) WHERE is_admin = true;

-- Optional: Create admin roles table for more granular permissions
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'viewer')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_roles_pkey PRIMARY KEY (id),
  CONSTRAINT admin_roles_user_id_key UNIQUE (user_id)
);

-- RLS for admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only super admins can manage admin roles" 
  ON public.admin_roles USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );
```

#### 1.2 Create Analytics/Stats View (Optional - can use direct queries)

```sql
-- Create a view for daily stats (optional, for performance)
CREATE OR REPLACE VIEW public.daily_stats AS
SELECT 
  DATE(created_at) as day,
  COUNT(*) as new_users
FROM auth.users
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### TypeScript Type Updates

**File**: `types/database.ts`

```typescript
// Add to profiles table
profiles: {
  Row: {
    // ... existing fields ...
    is_admin: boolean | null;
  };
  Insert: {
    // ... existing fields ...
    is_admin?: boolean | null;
  };
  Update: {
    // ... existing fields ...
    is_admin?: boolean | null;
  };
}

// New table for admin roles (optional)
admin_roles: {
  Row: {
    id: string;
    user_id: string;
    role: 'super_admin' | 'moderator' | 'viewer';
    created_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface DashboardStats {
  users: UserStats;
  restaurants: RestaurantStats;
  reviews: ReviewStats;
  lists: ListStats;
  meals: MealStats;
  growth: GrowthStats;
}

export interface UserStats {
  total: number;
  active: number; // active in last 30 days
  newThisMonth: number;
  newThisWeek: number;
  byRole: { admin: number; regular: number };
  growthRate: number; // percentage
}

export interface RestaurantStats {
  total: number;
  verified: number;
  pending: number;
  byCuisine: { cuisine: string; count: number }[];
  averageRating: number;
  newThisMonth: number;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  byRating: { rating: number; count: number }[];
  newThisMonth: number;
  withPhotos: number;
}

export interface ListStats {
  total: number;
  public: number;
  private: number;
  collaborative: number;
  totalItems: number; // total restaurants in all lists
}

export interface MealStats {
  total: number;
  upcoming: number;
  thisMonth: number;
  averagePartySize: number;
}

export interface GrowthStats {
  users: { month: string; count: number }[]; // last 12 months
  restaurants: { month: string; count: number }[];
  reviews: { month: string; count: number }[];
}

export interface RecentActivity {
  id: string;
  type: 'user_signup' | 'restaurant_created' | 'review_added' | 'list_created';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export type AdminRole = 'super_admin' | 'moderator' | 'viewer';
```

---

## Files

### New Files to Create

1. **`supabase/migrations/YYYYMMDDHHMMSS_add_admin_role.sql`** - Migration para adicionar campo `is_admin`
2. **`app/admin/layout.tsx`** - Layout do admin (proteção de rota)
3. **`app/admin/page.tsx`** - Página principal do dashboard
4. **`app/admin/users/page.tsx`** - Gestão de usuários
5. **`app/admin/restaurants/page.tsx`** - Gestão de restaurantes
6. **`app/admin/reviews/page.tsx`** - Moderação de reviews
7. **`app/admin/statistics/page.tsx`** - Estatísticas detalhadas
8. **`components/admin/DashboardStats.tsx`** - Cards de estatísticas principais
9. **`components/admin/StatsCard.tsx`** - Card individual de estatística
10. **`components/admin/UsersTable.tsx`** - Tabela de usuários
11. **`components/admin/RestaurantsTable.tsx`** - Tabela de restaurantes
12. **`components/admin/ReviewsTable.tsx`** - Tabela de reviews para moderação
13. **`components/admin/GrowthChart.tsx`** - Gráfico de crescimento
14. **`components/admin/RecentActivity.tsx`** - Lista de atividade recente
15. **`hooks/admin/useAdminStats.ts`** - Hook para estatísticas
16. **`hooks/admin/useAdminUsers.ts`** - Hook para gestão de usuários
17. **`libs/admin.ts`** - Utilitários e queries de admin
18. **`__tests__/admin/DashboardStats.test.tsx`** - Testes do dashboard
19. **`__tests__/hooks/admin/useAdminStats.test.ts`** - Testes do hook
20. **`__tests__/libs/admin.test.ts`** - Testes de utilitários

### Existing Files to Modify

1. **`middleware.ts`** ou criação de middleware
   - Adicionar proteção de rota para `/admin/*`
   - Verificar se utilizador tem `is_admin = true`

2. **`libs/api.ts`**
   - Adicionar funções para buscar estatísticas agregadas
   - Adicionar funções para gestão de usuários (banir, tornar admin, etc.)

3. **`types/database.ts`**
   - Adicionar campo `is_admin` à tabela `profiles`
   - Adicionar tipo `admin_roles` se necessário

4. **`libs/types.ts`**
   - Adicionar interfaces `DashboardStats`, `UserStats`, etc.

5. **`components/layouts/Navbar.jsx`**
   - Adicionar link para admin se utilizador for admin (`is_admin = true`)

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`GET /api/admin/stats`** - Obter todas as estatísticas do dashboard
   - Location: `app/api/admin/stats/route.ts`
   - Returns: `DashboardStats`
   - Auth: Apenas admins

2. **`GET /api/admin/users?page=&limit=&search=`** - Listar usuários para gestão
   - Location: `app/api/admin/users/route.ts`
   - Returns: `{ users: Profile[], total: number, page: number }`
   - Auth: Apenas admins

3. **`PUT /api/admin/users/[id]`** - Atualizar usuário (banir, tornar admin)
   - Location: `app/api/admin/users/[id]/route.ts`
   - Body: `{ is_admin?: boolean, is_banned?: boolean }`
   - Returns: `Profile`

4. **`GET /api/admin/restaurants?page=&limit=&status=`** - Listar restaurantes
   - Location: `app/api/admin/restaurants/route.ts`
   - Returns: `{ restaurants: Restaurant[], total: number }`

5. **`GET /api/admin/reviews?page=&limit=&rating=`** - Listar reviews para moderação
   - Location: `app/api/admin/reviews/route.ts`
   - Returns: `{ reviews: Review[], total: number }`

6. **`DELETE /api/admin/reviews/[id]`** - Deletar review (moderação)
   - Location: `app/api/admin/reviews/[id]/route.ts`
   - Returns: `{ success: boolean }`

7. **`getDashboardStats(): Promise<DashboardStats>`**
   - Location: `libs/admin.ts`
   - Purpose: Buscar todas as estatísticas
   - Returns: Promise com estatísticas completas

8. **`getRecentActivity(limit?: number): Promise<RecentActivity[]>`**
   - Location: `libs/admin.ts`
   - Purpose: Buscar atividade recente
   - Returns: Promise com array de atividades

9. **`useAdminStats()`**
   - Location: `hooks/admin/useAdminStats.ts`
   - Returns: `{ stats, loading, error, refresh }`
   - Purpose: Hook para estatísticas do admin

10. **`useAdminUsers(page?: number, limit?: number)`**
    - Location: `hooks/admin/useAdminUsers.ts`
    - Returns: `{ users, total, page, loading, error }`

### Modified Functions

1. **`middleware.ts - middleware function`**
   - Modify: Adicionar verificação para rotas `/admin/*`
   - Add: Verificar se `is_admin = true` no token/session
   - Add: Redirecionar para `/unauthorized` se não for admin

2. **`libs/api.ts - getProfile(userId)`**
   - Modify: Retornar campo `is_admin`
   - Add: Incluir na query

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

---

## Dependencies

### New Packages
- **`recharts`** (para gráficos): `npm install recharts`
- **`@types/recharts`**: `npm install -D @types/recharts`
- Opcional: **`date-fns`** (para formatação de datas): `npm install date-fns`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/admin/DashboardStats.test.tsx`**
   - Testar renderização dos cards de estatísticas
   - Testar gráficos de crescimento
   - Testar tabelas de dados
   - Testar estados de loading e erro

2. **`__tests__/hooks/admin/useAdminStats.test.ts`**
   - Testar hook com dados
   - Testar refresh
   - Testar tratamento de erro
   - Mock da API

3. **`__tests__/libs/admin.test.ts`**
   - Testar `getDashboardStats`
   - Testar `getRecentActivity`
   - Mock do cliente Supabase

### Existing Test Modifications
- Atualizar testes de middleware se modificado
- Atualizar testes de perfil para cobrir `is_admin`

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_admin_role.sql`
   - Adicionar coluna `is_admin` à tabela `profiles`
   - Opcional: Criar tabela `admin_roles`
   - Adicionar políticas RLS se necessário
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novos campos/tabelas
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create Middleware/Route Protection**
   - Criar ou modificar `middleware.ts`
   - Adicionar proteção para `/admin/*`
   - Verificar `is_admin` na session
   - Redirecionar se não autorizado

4. **Create API Routes**
   - Criar `app/api/admin/stats/route.ts`
   - Criar `app/api/admin/users/route.ts` e `[id]/route.ts`
   - Criar `app/api/admin/restaurants/route.ts`
   - Criar `app/api/admin/reviews/route.ts` e `[id]/route.ts`
   - Implementar autenticação e autorização (apenas admins)
   - Testar isoladamente

5. **Create Admin Utilities**
   - Criar `libs/admin.ts`
   - Implementar queries de agregação (COUNT, GROUP BY, etc.)
   - Implementar funções de gestão (banir, tornar admin)
   - Testar isoladamente

6. **Create Custom Hooks**
   - Criar `hooks/admin/useAdminStats.ts`
   - Criar `hooks/admin/useAdminUsers.ts`
   - Seguir padrão dos hooks existentes
   - Testar hooks isoladamente

7. **Create UI Components**
   - Criar `DashboardStats.tsx` (cards principais)
   - Criar `StatsCard.tsx` (card individual)
   - Criar `GrowthChart.tsx` (gráfico de linhas)
   - Criar `RecentActivity.tsx` (lista de atividades)
   - Criar tabelas: `UsersTable.tsx`, `RestaurantsTable.tsx`, `ReviewsTable.tsx`
   - Usar `recharts` para gráficos
   - Seguir design system (Tailwind + CSS variables)

8. **Create Admin Pages**
   - Criar `app/admin/layout.tsx` (proteção de rota)
   - Criar `app/admin/page.tsx` (dashboard principal)
   - Criar `app/admin/users/page.tsx`
   - Criar `app/admin/restaurants/page.tsx`
   - Criar `app/admin/reviews/page.tsx`
   - Criar `app/admin/statistics/page.tsx`
   - Adicionar meta tags SEO

9. **Update Navigation**
   - Modificar `components/layouts/Navbar.jsx`
   - Adicionar link para `/admin` se `is_admin = true`
   - Ícone apropriado (ex: ⚙️ ou Shield)

10. **Testing**
    - Criar testes para páginas admin
    - Criar testes para novos componentes
    - Criar testes para hooks
    - Criar testes para utilitários
    - Atualizar testes existentes
    - Executar `npm test`

11. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(admin): add admin dashboard with statistics and user management`

---

## Dashboard Layout Design

### Main Dashboard (`/admin`)

```
+-------------------------------------------------------+
|  FoodLister Admin Dashboard            [User] [Logout] |
+-------------------------------------------------------+
|  Stats Cards Row:                                          |
|  [Users: 1,234] [Restaurants: 567] [Reviews: 890]    |
|  [Lists: 345] [Meals: 123] [Growth: +12%]           |
+-------------------------------------------------------+
|  Left Column:                  | Right Column:             |
|  [Growth Chart (12 months)]  | [Recent Activity]          |
|                                | - New user signup         |
|                                | - Restaurant added        |
|                                | - Review posted           |
+-------------------------------------------------------+
|  Quick Actions:                                           |
|  [Manage Users] [Manage Restaurants] [Moderate Reviews] |
+-------------------------------------------------------+
```

### Stats Cards Design
- **Background**: `var(--card)` ou `var(--background)`
- **Title**: `var(--muted-foreground)`, tamanho pequeno
- **Value**: `var(--foreground)`, tamanho grande, negrito
- **Icon**: Cor `var(--primary)`, tamanho 24x24
- **Trend**: Verde para positivo, vermelho para negativo

### Charts (using recharts)
- **Growth Chart**: Line chart com eixos X (meses) e Y (contagem)
- **Colors**: Usar paleta do design system
- **Tooltip**: Estilizado com Tailwind

---

## Acceptance Criteria Checklist

- [ ] Dashboard admin acessível em `/admin` (apenas para admins)
- [ ] Cards de estatísticas principais (usuários, restaurantes, reviews, listas, refeições)
- [ ] Gráfico de crescimento dos últimos 12 meses
- [ ] Lista de atividade recente (signups, restaurantes adicionados, reviews)
- [ ] Página de gestão de usuários com paginação
- [ ] Página de gestão de restaurantes
- [ ] Página de moderação de reviews (deletar, aprovar)
- [ ] Proteção de rota (middleware) para `/admin/*`
- [ ] Link no Navbar aparece apenas se `is_admin = true`
- [ ] Gráficos responsivos (mobile e desktop)
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)

---

## Security Considerations

1. **Route Protection**: Todas as rotas `/admin/*` devem verificar `is_admin = true`
2. **API Protection**: Todas as API routes de admin devem verificar autorização
3. **RLS**: Garantir que políticas RLS não permitam acesso não autorizado
4. **Audit Log**: Opcionalmente, criar tabela de log de ações administrativas
5. **Super Admin**: Apenas super admins podem criar outros admins
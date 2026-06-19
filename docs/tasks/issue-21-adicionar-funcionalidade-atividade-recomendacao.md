# Issue #21: Feature - Adicionar funcionalidade de escrever uma atividade e recomendar um sítio para comer consoante as preferências do utilizador

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/21

**Status:** Pending

---

## Overview

Implementação de uma funcionalidade que permite aos utilizadores:
1. Escrever atividades (ex: "Procurar um restaurante italiano para jantar")
2. Receber recomendações personalizadas de restaurantes com base nas suas preferências armazenadas
3. Visualizar histórico de atividades e recomendações no perfil

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface UserActivity {
  id: string;
  userId: string;
  type: 'recommendation' | 'search' | 'custom';
  title: string;
  description?: string;
  preferences: ActivityPreferences;
  createdAt: string;
  recommendations?: RestaurantRecommendation[];
}

export interface ActivityPreferences {
  cuisineTypes?: string[]; // IDs dos tipos de cozinha
  priceRange?: { min: number; max: number };
  location?: string;
  maxDistanceKm?: number;
  mealTypes?: string[]; // 'breakfast', 'lunch', 'dinner'
  features?: string[]; // IDs das features
  dietary?: string[]; // IDs das restrições alimentares
}

export interface RestaurantRecommendation {
  id: string;
  activityId: string;
  restaurantId: string;
  score: number; // 0-100 relevância
  matchedPreferences: string[]; // quais preferências foram matched
  restaurant?: Restaurant; // populated
  createdAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  priceMin?: number;
  priceMax?: number;
  preferredMealTypes?: string[];
  location?: string;
  maxDistanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  type: 'recommendation' | 'search' | 'custom';
  title: string;
  description?: string;
  preferences: ActivityPreferences;
}
```

### Database Types Update (types/database.ts)

```typescript
// Nova tabela user_preferences
user_preferences: {
  Row: {
    id: string;
    user_id: string;
    price_min: number | null;
    price_max: number | null;
    preferred_meal_types: string[] | null;
    location: string | null;
    max_distance_km: number | null;
    created_at: string;
    updated_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

// Nova tabela user_activities
user_activities: {
  Row: {
    id: string;
    user_id: string;
    type: string;
    title: string;
    description: string | null;
    preferences: any; // JSONB
    created_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}

// Nova tabela restaurant_recommendations
restaurant_recommendations: {
  Row: {
    id: string;
    activity_id: string;
    restaurant_id: string;
    score: number;
    matched_preferences: string[];
    created_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}
```

---

## Files

### New Files to Create

1. **`app/api/user-preferences/route.ts`** - GET e PUT para preferências do utilizador
2. **`app/api/activities/route.ts`** - GET (listar) e POST (criar atividade)
3. **`app/api/activities/[id]/route.ts`** - GET, DELETE para atividade específica
4. **`app/api/activities/[id]/recommendations/route.ts`** - GET recomendações para atividade
5. **`app/activities/page.tsx`** - Página de listagem de atividades
6. **`app/activities/new/page.tsx`** - Página de criação de nova atividade
7. **`app/activities/[id]/page.tsx`** - Página de detalhe da atividade com recomendações
8. **`components/activities/ActivityForm.tsx`** - Formulário de criação de atividade
9. **`components/activities/ActivityCard.tsx`** - Card de atividade
10. **`components/activities/RecommendationList.tsx`** - Lista de recomendações
11. **`components/activities/RecommendationCard.tsx`** - Card de recomendação
12. **`components/activities/PreferencesSelector.tsx`** - Seletor de preferências
13. **`hooks/data/useActivities.ts`** - Hook para gerir atividades
14. **`hooks/data/useRecommendations.ts`** - Hook para recomendações
15. **`hooks/data/useUserPreferences.ts`** - Hook para preferências
16. **`libs/recommendation-engine.ts`** - Motor de recomendação
17. **`supabase/migrations/YYYYMMDDHHMMSS_add_activities_recommendations.sql`** - Migration
18. **`__tests__/api/activities.test.ts`** - Testes da API
19. **`__tests__/libs/recommendation-engine.test.ts`** - Testes do motor

### Existing Files to Modify

1. **`libs/api.ts`**
   - Adicionar funções para activities, recommendations, user preferences

2. **`app/users/[id]/page.tsx`** ou perfil do utilizador
   - Adicionar secção de atividades recentes

3. **`types/database.ts`**
   - Adicionar novas tabelas

4. **`libs/types.ts`**
   - Adicionar novas interfaces

5. **`components/layouts/Navbar.jsx`**
   - Adicionar link para página de atividades

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`GET /api/user-preferences`** - Obter preferências do utilizador
2. **`PUT /api/user-preferences`** - Atualizar preferências
3. **`GET /api/activities`** - Listar atividades do utilizador
4. **`POST /api/activities`** - Criar nova atividade e gerar recomendações
5. **`GET /api/activities/[id]`** - Obter detalhe da atividade
6. **`DELETE /api/activities/[id]`** - Eliminar atividade
7. **`GET /api/activities/[id]/recommendations`** - Obter recomendações da atividade
8. **`generateRecommendations(activity: UserActivity): Promise<RestaurantRecommendation[]>`**
   - Location: `libs/recommendation-engine.ts`
   - Purpose: Gerar recomendações baseadas nas preferências
9. **`scoreRestaurant(restaurant: Restaurant, preferences: ActivityPreferences): number`**
   - Location: `libs/recommendation-engine.ts`
   - Purpose: Pontuar restaurante baseado no match de preferências

### Modified Functions
- Funções de perfil do utilizador para incluir atividades

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias)

---

## Dependencies

### New Packages
- Nenhum obrigatório (talvez `fuse.js` para busca fuzzy se necessário): `npm install fuse.js`

---

## Testing

### New Test Files
1. **`__tests__/api/activities.test.ts`** - Testes da API de atividades
2. **`__tests__/libs/recommendation-engine.test.ts`** - Testes do motor de recomendação
3. **`__tests__/components/activities/ActivityForm.test.tsx`** - Testes do formulário
4. **`__tests__/hooks/data/useActivities.test.ts`** - Testes do hook

---

## Implementation Order

1. **Database Migration**
   - Criar tabelas `user_preferences`, `user_activities`, `restaurant_recommendations`
   - Adicionar RLS policies
   - Executar migration

2. **Update Types**
   - Atualizar `types/database.ts`
   - Adicionar interfaces a `libs/types.ts`

3. **Create Recommendation Engine**
   - Criar `libs/recommendation-engine.ts`
   - Implementar algoritmo de scoring
   - Testar isoladamente

4. **Create API Routes**
   - Criar rotas para preferences, activities, recommendations
   - Implementar autenticação e autorização

5. **Create API Functions**
   - Adicionar funções a `libs/api.ts`

6. **Create Custom Hooks**
   - Criar hooks para activities, recommendations, preferences

7. **Create UI Components**
   - Criar formulários, cards, listas

8. **Create Pages**
   - Criar páginas de listagem, criação, detalhe

9. **Integrate in Navigation**
   - Adicionar link na navbar

10. **Testing**
    - Criar todos os testes
    - Executar `npm test`

11. **Final Validation**
    - `npm run lint` - 0 erros
    - `npm run build` - exit code 0
    - `npm test` - todos passam
    - Commit: `feat(activities): add activity and recommendation system`

---

## Acceptance Criteria Checklist

- [ ] Utilizador pode escrever atividades (ex: "Procurar restaurante italiano")
- [ ] Sistema gera recomendações baseadas nas preferências
- [ ] Utilizador pode ver histórico de atividades
- [ ] Recomendações mostram score de relevância
- [ ] Preferências de utilizador são guardadas e usadas
- [ ] Testes unitários implementados
- [ ] Documentação atualizada
# Issue #16: Utilizador poder criar categorias de tipo de restaurante

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/16

**Status:** Pending

---

## Overview

### Context
O FoodLister já possui uma tabela `user_cuisine_types` (em `database.sql` linhas 227-234) que permite aos utilizadores criar categorias personalizadas de tipos de cozinha. A tabela tem a seguinte estrutura:
```sql
CREATE TABLE public.user_cuisine_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_cuisine_types_pkey PRIMARY KEY (id),
  CONSTRAINT user_cuisine_types_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### Why Needed
- Permitir que utilizadores criem as suas próprias categorias de restaurantes
- Personalizar a experiência de classificação de restaurantes
- Expandir o sistema de filtros existente para incluir categorias personalizadas

### How It Fits Into the System
A funcionalidade usará a tabela `user_cuisine_types` já existente, criará novas API routes para CRUD de categorias, e modificará os componentes de seleção de categorias para mostrar tanto categorias globais quanto personalizadas.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface UserCuisineType {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface CreateUserCuisineTypeInput {
  name: string;
}

export interface UpdateUserCuisineTypeInput {
  name: string;
}
```

### Database Types Update (types/database.ts)

```typescript
// Já existe no database.ts, verificar se está correto:
user_cuisine_types: {
  Row: {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    created_at?: string;
  };
}
```

---

## Files

### New Files to Create

1. **`app/api/user-cuisine-types/route.ts`** - GET (listar categorias do utilizador) e POST (criar nova)
2. **`app/api/user-cuisine-types/[id]/route.ts`** - GET, PUT, DELETE para categoria específica
3. **`components/restaurant/UserCuisineTypeSelector.tsx`** - Seletor combinado de categorias globais e personalizadas
4. **`components/restaurant/UserCuisineTypeManager.tsx`** - Gestão (CRUD) de categorias personalizadas
5. **`components/restaurant/UserCuisineTypeForm.tsx`** - Formulário para criar/editar categoria
6. **`hooks/data/useUserCuisineTypes.ts`** - Hook para gerir categorias personalizadas
7. **`__tests__/api/user-cuisine-types.test.ts`** - Testes da API route
8. **`__tests__/components/restaurant/UserCuisineTypeSelector.test.tsx`** - Testes do seletor
9. **`__tests__/hooks/data/useUserCuisineTypes.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`libs/api.ts`**
   - Adicionar funções: `getUserCuisineTypes()`, `createUserCuisineType()`, `updateUserCuisineType()`, `deleteUserCuisineType()`

2. **`components/restaurant/`** - Componentes de criação/edição de restaurantes
   - Modificar seletor de tipo de cozinha para incluir categorias personalizadas

3. **`app/restaurants/new/page.tsx`** ou **`app/restaurants/[id]/edit/page.tsx`**
   - Integrar `UserCuisineTypeSelector` no formulário

4. **`types/database.ts`**
   - Verificar se tipo `user_cuisine_types` está correto

5. **`libs/types.ts`**
   - Adicionar interfaces `UserCuisineType`, `CreateUserCuisineTypeInput`, `UpdateUserCuisineTypeInput`

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`GET /api/user-cuisine-types`** - Listar categorias do utilizador autenticado
   - Location: `app/api/user-cuisine-types/route.ts`
   - Returns: `UserCuisineType[]`

2. **`POST /api/user-cuisine-types`** - Criar nova categoria personalizada
   - Location: `app/api/user-cuisine-types/route.ts`
   - Body: `{ name: string }`
   - Returns: `UserCuisineType`

3. **`GET /api/user-cuisine-types/[id]`** - Obter categoria específica
   - Location: `app/api/user-cuisine-types/[id]/route.ts`
   - Returns: `UserCuisineType`

4. **`PUT /api/user-cuisine-types/[id]`** - Atualizar categoria
   - Location: `app/api/user-cuisine-types/[id]/route.ts`
   - Body: `{ name: string }`
   - Returns: `UserCuisineType`

5. **`DELETE /api/user-cuisine-types/[id]`** - Eliminar categoria
   - Location: `app/api/user-cuisine-types/[id]/route.ts`
   - Returns: `{ success: boolean }`

6. **`getUserCuisineTypes(): Promise<UserCuisineType[]>`**
   - Location: `libs/api.ts`
   - Purpose: Buscar categorias do utilizador
   - Returns: Promise com array de categorias

7. **`createUserCuisineType(name: string): Promise<UserCuisineType>`**
   - Location: `libs/api.ts`
   - Purpose: Criar nova categoria
   - Returns: Promise com categoria criada

8. **`updateUserCuisineType(id: string, name: string): Promise<UserCuisineType>`**
   - Location: `libs/api.ts`
   - Purpose: Atualizar categoria existente
   - Returns: Promise com categoria atualizada

9. **`deleteUserCuisineType(id: string): Promise<void>`**
   - Location: `libs/api.ts`
   - Purpose: Eliminar categoria
   - Returns: Promise vazia

### Modified Functions

1. **Funções de criação/edição de restaurantes**
   - Modificar para aceitar tanto `cuisine_type_id` (global) quanto `user_cuisine_type_id` (personalizada)

---

## Classes

### New Classes
- Nenhuma classe nova (usando hooks e funções utilitárias)

### Modified Classes
- Nenhuma

---

## Dependencies

### New Packages
- Nenhum novo pacote necessário

### Version Changes
- Nenhuma alteração de versão obrigatória

---

## Testing

### New Test Files

1. **`__tests__/api/user-cuisine-types.test.ts`**
   - Testar GET (listar)
   - Testar POST (criar)
   - Testar PUT (atualizar)
   - Testar DELETE (eliminar)
   - Testar autorização (apenas próprio utilizador)

2. **`__tests__/components/restaurant/UserCuisineTypeSelector.test.tsx`**
   - Testar renderização com categorias globais e personalizadas
   - Testar seleção de categoria
   - Testar criação rápida de nova categoria

3. **`__tests__/hooks/data/useUserCuisineTypes.test.ts`**
   - Testar hook de listagem
   - Testar hook de criação
   - Testar hook de eliminação

### Existing Test Modifications
- Atualizar testes de criação de restaurantes para cobrir novas categorias

---

## Implementation Order

1. **Verify Database Schema**
   - Verificar se tabela `user_cuisine_types` existe e tem RLS
   - Criar migration se necessário: `supabase/migrations/YYYYMMDDHHMMSS_ensure_user_cuisine_types.sql`
   - Adicionar políticas RLS se não existirem

2. **Update Types**
   - Atualizar `types/database.ts` se necessário
   - Adicionar interfaces a `libs/types.ts`

3. **Create API Routes**
   - Criar `app/api/user-cuisine-types/route.ts` (GET, POST)
   - Criar `app/api/user-cuisine-types/[id]/route.ts` (GET, PUT, DELETE)
   - Implementar autenticação e autorização

4. **Create API Functions**
   - Adicionar funções a `libs/api.ts`
   - Seguir padrão das funções existentes

5. **Create Custom Hook**
   - Criar `hooks/data/useUserCuisineTypes.ts`
   - Implementar CRUD operations
   - Seguir padrão dos hooks existentes

6. **Create UI Components**
   - Criar `UserCuisineTypeSelector.tsx`
   - Criar `UserCuisineTypeManager.tsx`
   - Criar `UserCuisineTypeForm.tsx`

7. **Integrate in Restaurant Forms**
   - Modificar formulário de criação de restaurante
   - Modificar formulário de edição de restaurante
   - Testar fluxo completo

8. **Update Filters**
   - Modificar sistema de filtros para incluir categorias personalizadas
   - Atualizar `utils/filters.ts` se necessário

9. **Testing**
   - Criar testes para API routes
   - Criar testes para componentes
   - Criar testes para hooks
   - Executar `npm test`

10. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(restaurants): add user custom cuisine type categories`

---

## Acceptance Criteria Checklist

- [ ] Utilizador pode criar novas categorias de tipo de restaurante personalizadas
- [ ] Utilizador pode ver e selecionar as suas categorias personalizadas ao criar/editar restaurantes
- [ ] Utilizador pode editar e eliminar as suas próprias categorias
- [ ] As categorias personalizadas são associadas ao utilizador (user_id)
- [ ] Restaurantes podem ser filtrados por categorias personalizadas
- [ ] Categorias personalizadas aparecem no seletor de categorias juntamente com as globais
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
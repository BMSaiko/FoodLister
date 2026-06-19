# Issue #224: Feature - O user ter uma lista de restaurantes

**Issue Link**: https://github.com/BMSaiko/FoodLister/issues/224  
**Status**: Pending  
**Priority**: Medium  
**Type**: Feature

---

## Overview

Implementar um sistema de lista gerada automaticamente para cada utilizador contendo todos os restaurantes que adicionou à plataforma. Esta lista integrar-se-á perfeitamente com o sistema de listas existente, aparecendo junto com as listas criadas pelo utilizador e suportando todas as funcionalidades de listas (visibilidade pública/privada, tags, imagens de capa, comentários, colaboradores, etc.).

---

## Goals

1. Criar automaticamente uma lista padrão "Meus Restaurantes" para cada utilizador no registo
2. Preencher automaticamente a lista padrão com restaurantes adicionados pelo utilizador
3. Integrar a lista padrão com a funcionalidade existente de listas
4. Exibir a lista padrão nas visualizações de listas voltadas ao utilizador e seções de perfil
5. Manter consistência com a arquitetura de listas existente

---

## Types

### Database Schema Changes

#### 1.1 Add `is_default` Column to `lists` Table
Marcar listas padrão geradas pelo sistema para distingui-las de listas criadas pelo utilizador.

**Migration File**: `supabase/migrations/YYYYMMDDHHMMSS_add_is_default_to_lists.sql`

```sql
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

COMMENT ON COLUMN public.lists.is_default IS 'Indica se é uma lista padrão gerada pelo sistema (ex: Meus Restaurantes)';
```

#### 1.2 Add `is_default` to `types/database.ts`

```typescript
lists: {
  Row: {
    // ... existing fields ...
    is_default: boolean | null;
  };
  Insert: {
    // ... existing fields ...
    is_default?: boolean | null;
  };
  Update: {
    // ... existing fields ...
    is_default?: boolean | null;
  };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface DefaultList extends List {
  isDefault: boolean;
  autoPopulated: boolean;
}

export interface CreateDefaultListInput {
  userId: string;
  name: string;
  description?: string;
  isDefault: true;
}
```

---

## Files

### New Files to Create

1. **`supabase/migrations/YYYYMMDDHHMMSS_add_is_default_to_lists.sql`** - Migration para adicionar coluna `is_default`
2. **`libs/default-lists.ts`** - Utilitários para gerir listas padrão
3. **`hooks/data/useDefaultList.ts`** - Hook para obter/criar lista padrão do utilizador
4. **`__tests__/libs/default-lists.test.ts`** - Testes de utilitários
5. **`__tests__/hooks/data/useDefaultList.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`libs/api.ts`**
   - Adicionar função: `createDefaultList(userId: string): Promise<List>`
   - Adicionar função: `getDefaultList(userId: string): Promise<List | null>`
   - Adicionar função: `addRestaurantToDefaultList(listId: string, restaurantId: string): Promise<void>`
   - Modificar `createRestaurant` para adicionar à lista padrão

2. **`contexts/AuthContext.tsx`**
   - Modificar `signUp` ou callback de registo para criar lista padrão
   - Ou usar trigger na base de dados (ver abaixo)

3. **`app/lists/page.tsx`** ou listagem de listas
   - Modificar para exibir listas padrão ("Meus Restaurantes") junto com listas normais
   - Adicionar badge ou indicador visual de lista padrão

4. **`components/lists/ListCard.tsx`** ou componente de card de lista
   - Adicionar indicador visual para listas padrão (`is_default: true`)
   - Opcionalmente desabilitar edição de nome/descrição para listas padrão

5. **`types/database.ts`**
   - Adicionar campo `is_default` à tabela `lists`

6. **`libs/types.ts`**
   - Adicionar interfaces `DefaultList`, `CreateDefaultListInput`

### Database Trigger Option (Alternative to AuthContext modification)

```sql
-- Trigger para criar lista padrão automaticamente no registo
CREATE OR REPLACE FUNCTION public.handle_new_user_default_list()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.lists (user_id, name, description, is_default, is_public)
  VALUES (NEW.id, 'Meus Restaurantes', 'Lista automática com todos os restaurantes que adicionei', true, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_default_list
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_default_list();
```

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`createDefaultList(userId: string): Promise<List>`**
   - Location: `libs/default-lists.ts`
   - Purpose: Criar lista padrão "Meus Restaurantes" para o utilizador
   - Returns: Promise com a lista criada

2. **`getDefaultList(userId: string): Promise<List | null>`**
   - Location: `libs/default-lists.ts`
   - Purpose: Obter lista padrão do utilizador
   - Returns: Promise com a lista ou null

3. **`ensureDefaultList(userId: string): Promise<List>`**
   - Location: `libs/default-lists.ts`
   - Purpose: Garantir que o utilizador tem uma lista padrão (cria se não existir)
   - Returns: Promise com a lista

4. **`addRestaurantToDefaultList(listId: string, restaurantId: string): Promise<void>`**
   - Location: `libs/default-lists.ts` / `libs/api.ts`
   - Purpose: Adicionar restaurante à lista padrão
   - Returns: Promise vazia

5. **`useDefaultList(): { defaultList: List | null, loading: boolean, error: any, addRestaurant: (restaurantId: string) => Promise<void> }`**
   - Location: `hooks/data/useDefaultList.ts`
   - Purpose: Hook para gerir lista padrão
   - Returns: Objeto com lista, estados e função para adicionar restaurante

### Modified Functions

1. **`libs/api.ts - createRestaurant(restaurantData)`**
   - Modify: Após criar restaurante com sucesso, obter lista padrão do utilizador
   - Add: Adicionar restaurante à lista padrão automaticamente
   - Add: Tratar erros graciosamente (falha ao adicionar à lista não deve falhar criação do restaurante)

2. **`contexts/AuthContext.tsx - signUp(email, password, userData)`**
   - Option 1: Usar trigger de BD (recomendado)
   - Option 2: Após registo bem-sucedido, chamar `createDefaultList(userId)`

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias seguindo o padrão do projeto)

---

## Dependencies

### New Packages
- Nenhum novo pacote necessário

### Version Changes
- Nenhuma alteração de versão obrigatória

---

## Testing

### New Test Files

1. **`__tests__/libs/default-lists.test.ts`**
   - Testar `createDefaultList`
   - Testar `getDefaultList`
   - Testar `ensureDefaultList` (cria se não existe)
   - Mock do cliente Supabase

2. **`__tests__/hooks/data/useDefaultList.test.ts`**
   - Testar hook com utilizador autenticado
   - Testar hook sem lista padrão (deve criar)
   - Testar função `addRestaurant`

3. **`__tests__/api/lists.test.ts`** (atualizar)
   - Testar criação de lista padrão via trigger/API
   - Testar adição automática de restaurante à lista padrão

### Existing Test Modifications
- Atualizar testes de criação de restaurante para verificar adição à lista padrão
- Atualizar testes de listagem de listas para incluir listas padrão

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_add_is_default_to_lists.sql`
   - Adicionar coluna `is_default` à tabela `lists`
   - Criar trigger para criação automática de lista padrão no registo
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com novo campo
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create Default Lists Utilities**
   - Criar `libs/default-lists.ts` com funções utilitárias
   - Implementar `createDefaultList`, `getDefaultList`, `ensureDefaultList`
   - Testar isoladamente

4. **Update API Functions**
   - Atualizar `libs/api.ts`
   - Adicionar funções para listas padrão
   - Modificar `createRestaurant` para adicionar à lista padrão

5. **Create Custom Hook**
   - Criar `hooks/data/useDefaultList.ts`
   - Seguir padrão dos hooks existentes
   - Testar hook isoladamente

6. **Update UI Components**
   - Modificar `ListCard` para indicar lista padrão
   - Modificar listagem de listas para exibir lista padrão
   - Adicionar badge "Padrão" ou ícone para listas `is_default=true`

7. **Update Profile/User Pages**
   - Adicionar secção "Meus Restaurantes" no perfil
   - Link para a lista padrão

8. **Testing**
   - Criar testes para utilitários
   - Criar testes para novo hook
   - Atualizar testes existentes
   - Executar `npm test`

9. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `feat(lists): add automatic default "My Restaurants" list for users`

---

## Acceptance Criteria Checklist

- [ ] Cada utilizador tem uma lista "Meus Restaurantes" criada automaticamente no registo
- [ ] Restaurantes adicionados pelo utilizador são automaticamente adicionados à lista padrão
- [ ] Lista padrão aparece na listagem de listas do utilizador
- [ ] Lista padrão suporta funcionalidades de listas (pública/privada, tags, capa, comentários)
- [ ] Indicador visual de que é uma lista padrão (badge, ícone)
- [ ] Utilizador pode ver a lista padrão no perfil
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
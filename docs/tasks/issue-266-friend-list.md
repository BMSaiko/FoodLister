# Issue #266: Feature - Criar Friend List

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/266

**Status:** Pending

---

## Descrição

Implementação de um sistema de lista de amigos (seguidores/seguindo) na aplicação FoodLister, permitindo que utilizadores sigam outros utilizadores, visualizem listas de seguidores e utilizadores que seguem, e vejam estatísticas relacionadas na página de perfil.

## Objetivos

- Criar tabela `followers` na base de dados para gerir relações de seguimento
- Implementar funcionalidades de seguir/deixar de seguir utilizadores
- Adicionar endpoints de API para gerir e consultar relações de seguimento
- Atualizar a interface do utilizador para exibir estatísticas de seguidores/seguindo
- Criar componentes para listar seguidores e utilizadores seguidos
- Integrar botões de seguimento em páginas de perfil e resultados de pesquisa

## Requisitos Técnicos

### Base de Dados

#### 1.1 Nova Tabela `followers`

```sql
-- Create followers table
CREATE TABLE IF NOT EXISTS public.followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT followers_pkey PRIMARY KEY (id),
  CONSTRAINT followers_unique_relation UNIQUE (user_id, follower_id),
  CONSTRAINT followers_no_self_follow CHECK (user_id != follower_id)
);

-- Add comments
COMMENT ON TABLE public.followers IS 'Stores follower relationships between users';
COMMENT ON COLUMN public.followers.user_id IS 'User being followed';
COMMENT ON COLUMN public.followers.follower_id IS 'User who is following';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_followers_user_id ON public.followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON public.followers(created_at DESC);
```

#### 1.2 Add Follower Counts to `profiles` (Optional - can use views/counts)

```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- Create function to update counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.user_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = followers_count - 1 WHERE user_id = OLD.user_id;
    UPDATE public.profiles SET following_count = following_count - 1 WHERE user_id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE OR REPLACE TRIGGER trigger_update_follower_counts
  AFTER INSERT OR DELETE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();
```

#### 1.3 Row Level Security (RLS)

```sql
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all follower relationships (public info)
CREATE POLICY "Follower relationships are viewable by everyone" 
  ON public.followers FOR SELECT 
  USING (true);

-- Policy: Users can follow others (insert their own follower_id)
CREATE POLICY "Users can follow others" 
  ON public.followers FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can unfollow (delete their own follow records)
CREATE POLICY "Users can unfollow" 
  ON public.followers FOR DELETE 
  USING (auth.uid() = follower_id);
```

### TypeScript Type Updates

**File**: `types/database.ts`

```typescript
// Add followers table
followers: {
  Row: {
    id: string;
    user_id: string;
    follower_id: string;
    created_at: string;
    // Joined fields (for queries)
    follower?: Database['public']['Tables']['profiles']['Row'];
    following?: Database['public']['Tables']['profiles']['Row'];
  };
  Insert: {
    id?: string;
    user_id: string;
    follower_id: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    follower_id?: string;
    created_at?: string;
  };
}

// Update profiles table
profiles: {
  Row: {
    // ... existing fields ...
    followers_count: number | null;
    following_count: number | null;
  };
  Insert: {
    // ... existing fields ...
    followers_count?: number | null;
    following_count?: number | null;
  };
  Update: {
    // ... existing fields ...
    followers_count?: number | null;
    following_count?: number | null;
  };
}
```

### New Type Definitions (libs/types.ts)

```typescript
export interface FollowRelation {
  id: string;
  userId: string; // user being followed
  followerId: string; // user who follows
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowButtonState {
  isFollowing: boolean;
  loading: boolean;
  followersCount: number;
}
```

---

## Files

### New Files to Create

1. **`supabase/migrations/YYYYMMDDHHMMSS_create_followers_table.sql`** - Migration para tabela followers
2. **`app/api/followers/route.ts`** - GET (listar seguidores/seguindo), POST (seguir)
3. **`app/api/followers/[id]/route.ts`** - DELETE (deixar de seguir)
4. **`app/api/users/[id]/followers/route.ts`** - GET seguidores de um utilizador
5. **`app/api/users/[id]/following/route.ts`** - GET utilizadores que um utilizador segue
6. **`components/user/FollowButton.tsx`** - Botão de seguir/deixar de seguir
7. **`components/user/FollowersList.tsx`** - Lista de seguidores
8. **`components/user/FollowingList.tsx`** - Lista de utilizadores seguidos
9. **`components/user/FollowStats.tsx`** - Estatísticas de seguidores/seguindo
10. **`app/users/[id]/followers/page.tsx`** - Página de seguidores
11. **`app/users/[id]/following/page.tsx`** - Página de utilizadores seguidos
12. **`hooks/data/useFollow.ts`** - Hook para gerir relações de seguimento
13. **`libs/follow.ts`** - Utilitários para seguidores
14. **`__tests__/api/followers.test.ts`** - Testes da API
15. **`__tests__/components/user/FollowButton.test.tsx`** - Testes do botão
16. **`__tests__/hooks/data/useFollow.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`libs/api.ts`**
   - Adicionar funções: `followUser(userId)`, `unfollowUser(userId)`, `getFollowers(userId)`, `getFollowing(userId)`
   - Atualizar `getProfile` para retornar `followers_count`, `following_count`

2. **`app/users/[id]/page.tsx`** ou perfil do utilizador
   - Adicionar `FollowStats` no perfil
   - Adicionar `FollowButton` se não for o próprio perfil

3. **`components/ui/profile/UserProfileHeader.tsx`**
   - Adicionar estatísticas de seguidores/seguindo
   - Adicionar botão de seguir se aplicável

4. **`types/database.ts`**
   - Adicionar tipo `followers`
   - Atualizar tipo `profiles` com contagens

5. **`libs/types.ts`**
   - Adicionar interfaces `FollowRelation`, `FollowStats`, `FollowButtonState`

6. **`components/ui/navigation/Searchbar.tsx`** ou resultados de pesquisa
   - Adicionar `FollowButton` nos resultados de pesquisa de utilizadores

### Files to Delete
- Nenhum

---

## Functions

### New Functions

1. **`GET /api/followers?userId=&followerId=`**
   - Location: `app/api/followers/route.ts`
   - Purpose: Listar relações de seguimento
   - Returns: `FollowRelation[]`

2. **`POST /api/followers`** - Seguir utilizador
   - Location: `app/api/followers/route.ts`
   - Body: `{ user_id: string }` (utilizador a seguir)
   - Returns: `FollowRelation`

3. **`DELETE /api/followers/[id]`** - Deixar de seguir
   - Location: `app/api/followers/[id]/route.ts`
   - Returns: `{ success: boolean }`

4. **`GET /api/users/[id]/followers`** - Seguidores de um utilizador
   - Location: `app/api/users/[id]/followers/route.ts`
   - Returns: `FollowRelation[]` (com dados do seguidor)

5. **`GET /api/users/[id]/following`** - Utilizadores que um utilizador segue
   - Location: `app/api/users/[id]/following/route.ts`
   - Returns: `FollowRelation[]` (com dados do seguido)

6. **`followUser(userId: string): Promise<void>`**
   - Location: `libs/api.ts` ou `libs/follow.ts`
   - Purpose: Seguir utilizador
   - Returns: Promise vazia

7. **`unfollowUser(userId: string): Promise<void>`**
   - Location: `libs/api.ts` ou `libs/follow.ts`
   - Purpose: Deixar de seguir
   - Returns: Promise vazia

8. **`getFollowers(userId: string): Promise<FollowRelation[]>`**
   - Location: `libs/api.ts` ou `libs/follow.ts`
   - Purpose: Obter seguidores
   - Returns: Promise com array de relações

9. **`getFollowing(userId: string): Promise<FollowRelation[]>`**
   - Location: `libs/api.ts` ou `libs/follow.ts`
   - Purpose: Obter utilizadores seguidos
   - Returns: Promise com array de relações

10. **`useFollow(targetUserId: string)`**
    - Location: `hooks/data/useFollow.ts`
    - Returns: `{ isFollowing, followersCount, followingCount, follow, unfollow, loading, error }`
    - Purpose: Hook para gerir seguimento

### Modified Functions

1. **`libs/api.ts - getProfile(userId)`**
   - Modify: Retornar `followers_count`, `following_count`
   - Add: Incluir contagens na query

2. **`components/ui/profile/UserProfileHeader.tsx`**
   - Modify: Adicionar estatísticas de seguidores
   - Add: Botão de seguir se não for o próprio utilizador
   - Add: Link para páginas de seguidores/seguindo

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

1. **`__tests__/api/followers.test.ts`**
   - Testar GET (listar seguidores/seguindo)
   - Testar POST (seguir)
   - Testar DELETE (deixar de seguir)
   - Testar autorização (só pode seguir/deixar de seguir a si próprio)
   - Mock do cliente Supabase

2. **`__tests__/components/user/FollowButton.test.tsx`**
   - Testar renderização (seguindo vs não seguindo)
   - Testar clique para seguir
   - Testar clique para deixar de seguir
   - Testar estados de loading

3. **`__tests__/hooks/data/useFollow.test.ts`**
   - Testar hook com utilizador não seguido
   - Testar hook com utilizador já seguido
   - Testar funções `follow` e `unfollow`
   - Mock da API

### Existing Test Modifications
- Atualizar testes de perfil para cobrir novas estatísticas
- Atualizar testes de pesquisa se adicionado FollowButton

---

## Implementation Order

1. **Database Migration**
   - Criar migration `supabase/migrations/YYYYMMDDHHMMSS_create_followers_table.sql`
   - Criar tabela `followers` com restrições
   - Adicionar colunas `followers_count`, `following_count` a `profiles`
   - Criar função e trigger para atualizar contagens
   - Adicionar políticas RLS
   - Executar migration no Supabase

2. **Update Types**
   - Atualizar `types/database.ts` com nova tabela
   - Atualizar `profiles` com contagens
   - Adicionar interfaces a `libs/types.ts`
   - Verificar se tipos estão corretos com `npm run build`

3. **Create API Routes**
   - Criar `app/api/followers/route.ts` (GET, POST)
   - Criar `app/api/followers/[id]/route.ts` (DELETE)
   - Criar `app/api/users/[id]/followers/route.ts`
   - Criar `app/api/users/[id]/following/route.ts`
   - Implementar autenticação e autorização
   - Testar isoladamente

4. **Create API Functions**
   - Adicionar funções a `libs/api.ts` ou criar `libs/follow.ts`
   - Seguir padrão das funções existentes

5. **Create Custom Hook**
   - Criar `hooks/data/useFollow.ts`
   - Implementar lógica de seguir/deixar de seguir
   - Seguir padrão dos hooks existentes
   - Testar hook isoladamente

6. **Create UI Components**
   - Criar `FollowButton.tsx` (seguir/deixar de seguir)
   - Criar `FollowStats.tsx` (estatísticas)
   - Criar `FollowersList.tsx` (lista de seguidores)
   - Criar `FollowingList.tsx` (lista de seguidos)
   - Usar Tailwind CSS e design system

7. **Create Pages**
   - Criar `app/users/[id]/followers/page.tsx`
   - Criar `app/users/[id]/following/page.tsx`
   - Listar seguidores/seguiados com paginação

8. **Update Profile Page**
   - Modificar página de perfil do utilizador
   - Adicionar `FollowStats` no cabeçalho
   - Adicionar `FollowButton` se não for o próprio perfil
   - Adicionar links para páginas de seguidores/seguiados

9. **Update Search Results**
   - Modificar resultados de pesquisa de utilizadores
   - Adicionar `FollowButton` nos resultados

10. **Testing**
    - Criar testes para API routes
    - Criar testes para novos componentes
    - Criar testes para novo hook
    - Atualizar testes existentes
    - Executar `npm test`

11. **Final Validation**
    - Executar `npm run lint` - 0 erros
    - Executar `npm run build` - exit code 0
    - Executar `npm test` - todos os testes passam
    - Fazer commit: `feat(users): add friend/follower system`

---

## Acceptance Criteria Checklist

- [ ] Utilizadores podem seguir outros utilizadores
- [ ] Utilizadores podem deixar de seguir outros utilizadores
- [ ] Página de seguidores criada (`/users/[id]/followers`)
- [ ] Página de utilizadores seguidos criada (`/users/[id]/following`)
- [ ] Estatísticas de seguidores/seguindo exibidas no perfil
- [ ] Botão de seguir/deixar de seguir funcional nos perfis e pesquisa
- [ ] Contagens de seguidores/seguiados atualizadas automaticamente
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
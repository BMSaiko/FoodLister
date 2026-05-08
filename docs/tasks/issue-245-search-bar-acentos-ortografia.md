# Issue #245: Refactor - Search bar não ser sensível a acentos erros ortográficos etc

**GitHub Issue Link:** https://github.com/BMSaiko/FoodLister/issues/245

**Status:** Pending

---

## Overview

### Context
O FoodLister possui um sistema de busca básico implementado em múltiplos pontos:
- **SearchBar** (`components/ui/navigation/Searchbar.tsx`): Captura query e redireciona para páginas de resultados
- **API Routes**: `/api/restaurants/route.ts` e `/api/lists/route.ts` usam `ilike` para busca case-insensitive
- **Utils**: `utils/search.ts` possui utilitários básicos de busca, mas sem suporte a acentos ou erros ortográficos
- **Database**: Existe um `user_search_index` (migration 018) com `to_tsvector('portuguese')` para usuários, mas **não existe equivalente para restaurantes**

### Problema Atual
1. **Sensibilidade a acentos**: Buscar "sushi" não encontra "sushí" ou "sushì"
2. **Sensibilidade a erros ortográficos**: Buscar "piza" não encontra "pizza"
3. **Busca limitada**: Apenas o campo `name` é pesquisado, ignorando `description`, `cuisine_types`, `features`, etc.
4. **Falta de fuzzy search**: Não há tolerância a erros de digitação

### Why Needed
- Melhorar experiência do usuário na busca de restaurantes e listas
- Suportar busca em Português com acentos (acentuação)
- Tolerar erros ortográficos comuns
- Aumentar taxa de sucesso na busca

### How It Fits Into the System
A refatoração usará PostgreSQL Full-Text Search com dicionário Português para restaurantes, adicionará normalização de acentos, e implementará fuzzy search no frontend/backend.

---

## Types

### New Type Definitions (to be added to `libs/types.ts`)

```typescript
export interface SearchOptions {
  query: string;
  fuzzy?: boolean;
  maxResults?: number;
  includeDescription?: boolean;
  includeCuisineTypes?: boolean;
  includeFeatures?: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  type: 'restaurant' | 'list' | 'user';
  score: number; // relevância 0-100
  highlights?: string[]; // trechos com termo encontrado
}

export interface NormalizedSearchQuery {
  original: string;
  normalized: string; // sem acentos
  tokens: string[]; // tokens separados
  fuzzyTokens?: string[]; // tokens com fuzzy matching
}
```

### Database Types Update (types/database.ts)

```typescript
// Adicionar search index para restaurantes
// Nova migration necessária
restaurant_search_index: {
  Row: {
    restaurant_id: string;
    document: string; // tsvector
    created_at: string;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
}
```

---

## Files

### New Files to Create

1. **`supabase/migrations/YYYYMMDDHHMMSS_add_restaurant_search_index.sql`** - Migration para search index de restaurantes
2. **`supabase/migrations/YYYYMMDDHHMMSS_add_normalized_name_trigger.sql`** - Trigger para nome normalizado
3. **`libs/search-engine.ts`** - Motor de busca com normalização e fuzzy
4. **`libs/text-normalizer.ts`** - Utilitário para remover acentos e normalizar texto
5. **`hooks/ui/useFuzzySearch.ts`** - Hook para busca fuzzy no frontend
6. **`__tests__/libs/search-engine.test.ts`** - Testes do motor de busca
7. **`__tests__/libs/text-normalizer.test.ts`** - Testes da normalização
8. **`__tests__/hooks/ui/useFuzzySearch.test.ts`** - Testes do hook

### Existing Files to Modify

1. **`utils/search.ts`**
   - Reescrever para usar novo motor de busca
   - Adicionar normalização de acentos
   - Adicionar fuzzy search

2. **`app/api/restaurants/route.ts`**
   - Modificar busca para usar Full-Text Search do PostgreSQL
   - Adicionar busca em múltiplos campos (name, description, cuisine_types, features)
   - Usar `to_tsvector('portuguese')` e `plainto_tsquery`

3. **`app/api/lists/route.ts`**
   - Aplicar mesmas melhorias de busca

4. **`components/ui/navigation/Searchbar.tsx`**
   - Adicionar sugestões de busca com fuzzy
   - Melhorar UX com debounce e highlights

5. **`types/database.ts`**
   - Adicionar tipos para `restaurant_search_index` se criado na migration

6. **`libs/types.ts`**
   - Adicionar interfaces `SearchOptions`, `SearchResult`, `NormalizedSearchQuery`

### Files to Delete
- Nenhum (manter `utils/search.ts` mas refatorar)

---

## Functions

### New Functions

1. **`normalizeText(text: string): string`**
   - Location: `libs/text-normalizer.ts`
   - Purpose: Remover acentos, converter para lowercase
   - Example: "Sushí Restaurant" → "sushi restaurant"
   - Returns: `string`

2. **`tokenize(text: string): string[]`**
   - Location: `libs/text-normalizer.ts`
   - Purpose: Separar texto em tokens normalizados
   - Returns: `string[]`

3. **`fuzzyMatch(query: string, target: string, threshold?: number): number`**
   - Location: `libs/search-engine.ts`
   - Purpose: Calcular similaridade entre strings (Levenshtein distance)
   - Returns: Score 0-1 (1 = match perfeito)

4. **`searchRestaurants(options: SearchOptions): Promise<SearchResult[]>`**
   - Location: `libs/search-engine.ts`
   - Purpose: Busca avançada de restaurantes
   - Returns: Promise com resultados ordenados por relevância

5. **`searchLists(options: SearchOptions): Promise<SearchResult[]>`**
   - Location: `libs/search-engine.ts`
   - Purpose: Busca avançada de listas
   - Returns: Promise com resultados

6. **`useFuzzySearch(query: string, items: any[], options?: SearchOptions)`**
   - Location: `hooks/ui/useFuzzySearch.ts`
   - Returns: `{ results: SearchResult[], loading: boolean }`
   - Purpose: Hook para busca fuzzy reativa no frontend

### Modified Functions

1. **`app/api/restaurants/route.ts - GET handler`**
   - Modify: Usar Full-Text Search do PostgreSQL
   - Add: Busca em name, description, cuisine_types, features
   - Add: Normalizar query (remover acentos)
   - Add: Fuzzy search como fallback se FTS não retornar resultados

2. **`utils/search.ts - searchRestaurants(query)`**
   - Rewrite: Usar novo motor em `libs/search-engine.ts`
   - Add: Normalização de acentos
   - Add: Fuzzy matching

---

## Classes
- Nenhuma classe nova (usando hooks e funções utilitárias)

---

## Dependencies

### New Packages
- **`fuse.js`** (para fuzzy search no frontend): `npm install fuse.js`
- **`@types/fuse.js`** para TypeScript: `npm install -D @types/fuse.js`
- Opcional: **`diacritics`** para remoção de acentos: `npm install diacritics`

### Version Changes
- Nenhuma alteração de versão obrigatória para pacotes existentes

---

## Testing

### New Test Files

1. **`__tests__/libs/text-normalizer.test.ts`**
   - Testar remoção de acentos: "Sushí" → "Sushi"
   - Testar lowercase: "RESTAURANT" → "restaurant"
   - Testar caracteres especiais

2. **`__tests__/libs/search-engine.test.ts`**
   - Testar busca com acentos
   - Testar fuzzy search (erros ortográficos)
   - Testar ordenação por relevância
   - Testar busca em múltiplos campos
   - Mock do cliente Supabase

3. **`__tests__/hooks/ui/useFuzzySearch.test.ts`**
   - Testar hook com query vazia
   - Testar hook com resultados
   - Testar debounce

### Existing Test Modifications
- Atualizar testes de API de restaurantes para cobrir nova busca
- Atualizar testes de Searchbar

---

## Implementation Order

1. **Create Text Normalizer**
   - Criar `libs/text-normalizer.ts`
   - Implementar `normalizeText`, `tokenize`
   - Testar isoladamente
   - Executar `__tests__/libs/text-normalizer.test.ts`

2. **Database Migration for FTS**
   - Criar `supabase/migrations/YYYYMMDDHHMMSS_add_restaurant_search_index.sql`
   - Adicionar coluna `normalized_name` à tabela `restaurants` (opcional)
   - Criar índice GIN para Full-Text Search
   - Usar `to_tsvector('portuguese')` para suporte a Português
   - Executar migration no Supabase

3. **Update API Routes**
   - Modificar `app/api/restaurants/route.ts`
   - Usar FTS do PostgreSQL: `to_tsvector('portuguese', name || ' ' || description) @@ plainto_tsquery('portuguese', query)`
   - Adicionar fallback com fuzzy search se FTS não retornar resultados
   - Repetir para `app/api/lists/route.ts`

4. **Create Search Engine**
   - Criar `libs/search-engine.ts`
   - Implementar `searchRestaurants`, `searchLists`
   - Integrar com FTS e fuzzy search
   - Testar isoladamente

5. **Update Utils**
   - Refatorar `utils/search.ts` para usar novo motor
   - Manter compatibilidade com código existente

6. **Create Fuzzy Search Hook**
   - Criar `hooks/ui/useFuzzySearch.ts`
   - Usar `fuse.js` ou implementação própria
   - Seguir padrão dos hooks existentes

7. **Update SearchBar Component**
   - Modificar `components/ui/navigation/Searchbar.tsx`
   - Adicionar sugestões com fuzzy search
   - Melhorar UX com debounce (já deve ter)
   - Mostrar highlights dos termos encontrados

8. **Testing**
   - Criar todos os testes novos
   - Atualizar testes existentes
   - Executar `npm test`

9. **Final Validation**
   - Executar `npm run lint` - 0 erros
   - Executar `npm run build` - exit code 0
   - Executar `npm test` - todos os testes passam
   - Fazer commit: `refactor(search): add accent-insensitive and fuzzy search`

---

## Acceptance Criteria Checklist

- [ ] Busca não é sensível a acentos (ex: "sushi" encontra "sushí")
- [ ] Busca tolera erros ortográficos básicos (ex: "piza" encontra "pizza")
- [ ] Busca cobre múltiplos campos (name, description, cuisine_types, features)
- [ ] Full-Text Search do PostgreSQL implementado para Português
- [ ] Fuzzy search implementado como fallback
- [ ] SearchBar mostra sugestões relevantes
- [ ] Testes unitários para novas funcionalidades
- [ ] Documentação atualizada (memory-bank/)
# FoodLister - Plano de Tarefas para 5 Horas

## Hora 1: Testes e CI/CD (60 min)

### 1.1 Configurar ambiente de testes (20 min)
- [x] Instalar dependências: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest @types/jest`
- [x] Criar `jest.config.js` com configuração para Next.js App Router
- [x] Adicionar script `"test": "jest"` e `"test:watch": "jest --watch"` ao `package.json`
- [x] Criar `jest.setup.ts` com mocks para Next.js router e Supabase

### 1.2 Expandir cobertura de testes (25 min)
- [x] Criar testes para componentes críticos:
  - [x] `__tests__/components/RestaurantCard.test.tsx` - Card rendering, click handlers
  - [x] `__tests__/components/RestaurantRoulette.test.tsx` - Random selection logic
  - [x] `__tests__/hooks/useRestaurants.test.tsx` - Data fetching, filtering
- [x] Criar testes para API routes:
  - [x] `__tests__/api/lists.test.ts` - CRUD operations
  - [x] `__tests__/api/restaurants.test.ts` - CRUD operations

### 1.3 Configurar CI/CD (15 min)
- [x] Criar `.github/workflows/ci.yml` com:
  - [x] Lint check
  - [x] Type check (`tsc --noEmit`)
  - [x] Test suite
  - [x] Build verification
- [ ] Adicionar badge de CI ao README

---

## Hora 2: Database e Migrações (60 min)

### 2.1 Aplicar migrações pendentes (20 min)
- [ ] Aceder ao Supabase Dashboard → SQL Editor
- [ ] Executar migração `028_combined_pending_migrations.sql` (combina 024-027 + otimizações)
- [ ] Verificar que todas as colunas existem: `SELECT column_name FROM information_schema.columns WHERE table_name = 'list_restaurants' ORDER BY ordinal_position;`

### 2.2 Investigar tabelas em falta (15 min)
- [x] Verificar se `restaurant_dietary_options` existe no dashboard (existe no schema)
- [x] Verificar se `restaurant_dietary_options_junction` existe (existe no schema)
- [x] Verificar se `restaurant_features` existe (existe no schema)
- [x] Verificar se `restaurant_restaurant_features` existe (existe no schema)

### 2.3 Otimizar índices e RLS (15 min)
- [x] Adicionar índices para queries frequentes (incluídos na migração 028):
  - [x] `idx_reviews_restaurant_rating` ON reviews(restaurant_id, rating)
  - [x] `idx_restaurants_name` ON restaurants USING gin(to_tsvector('english', name))
  - [x] `idx_lists_creator` ON lists(creator_id)
  - [x] `idx_lists_is_public` ON lists(is_public)
  - [x] `idx_lists_tags` ON lists USING GIN (tags)

### 2.4 Criar função exec_sql para migrações futuras (10 min)
- [x] Criar função SQL na migração 028
- [x] Adicionar RLS policy para restringir acesso (apenas authenticated)

---

## Hora 3: Features Pendentes e Bug Fixes (60 min)

### 3.1 Implementar Delete List (20 min)
- [x] API route `app/api/lists/[id]/route.ts` com método DELETE (já existia)
- [x] Verificação de ownership antes de deletar (já existia)
- [ ] Adicionar botão de delete na UI de ListDetail
- [ ] Adicionar confirmação modal antes de deletar
- [x] Cascade delete configurado nas FKs (list_restaurants, list_comments, list_collaborators)

### 3.2 Implementar List Comments UI (15 min)
- [x] Componente `components/ui/lists/ListComments.tsx` (já existia)
- [x] Adicionar secção de comentários na página de lista (já existia)
- [x] Implementar adicionar/editar/deletar comentários (já existia)
- [ ] Adicionar real-time updates com Supabase subscriptions

### 3.3 Implementar List Collaborators UI (15 min)
- [x] Componente `components/ui/lists/ListCollaborators.tsx` (já existia)
- [x] Implementar adicionar colaboradores por email (já existia)
- [x] Implementar change role (editor/viewer) (já existia)
- [x] Implementar remove collaborator (já existia)
- [ ] Adicionar badge na lista mostrando número de colaboradores

### 3.4 Fix List Tags e Cover Image (10 min)
- [x] Adicionar campo de tags no formulário de criação/edição de lista
- [x] Adicionar campo de cover image URL no formulário
- [x] Mostrar cover image no ListCard
- [x] Mostrar tags como badges no ListCard
- [x] Atualizar useListForm hook para suportar tags e cover_image_url

---

## Hora 4: Code Quality e Refactoring (60 min)

### 4.1 Remover dependências não utilizadas (10 min)
- [x] Remover `next-auth` do package.json (não é usado, usa-se Supabase Auth)
- [ ] Verificar outras dependências não utilizadas com `depcheck`
- [ ] Rodar `npm prune` para limpar

### 4.2 Melhorar tipagem TypeScript (15 min)
- [ ] Corrigir `tsconfig.json` para remover `noImplicitAny: false`
- [ ] Adicionar tipos explícitos onde há `any`
- [ ] Criar tipos compartilhados em `types/database.ts`
- [ ] Usar `Database` type gerado pelo Supabase CLI

### 4.3 Melhorar tratamento de erros (15 min)
- [ ] Adicionar error boundaries nos componentes principais
- [ ] Padronizar respostas de erro nas API routes
- [ ] Adicionar retry logic para falhas de rede
- [ ] Melhorar loading states com skeletons

### 4.4 Otimizar performance (20 min)
- [ ] Adicionar React Server Components onde possível
- [ ] Implementar pagination para listas longas de restaurantes
- [ ] Adicionar virtual scrolling para listas com muitos itens
- [ ] Otimizar imagens com Next.js Image component
- [x] Adicionar cache headers nas API routes (já existia em algumas routes)

---

## Hora 5: Documentação e Polish (60 min)

### 5.1 Atualizar documentação (15 min)
- [ ] Atualizar README com features atuais
- [ ] Adicionar guia de contribuição
- [ ] Documentar API endpoints no Postman collection
- [ ] Adicionar diagrama de database schema

### 5.2 Melhorar UX (15 min)
- [ ] Adicionar loading skeletons em todas as páginas
- [ ] Melhorar mensagens de erro para o utilizador
- [ ] Adicionar empty states para listas vazias
- [ ] Adicionar confirmações para ações destrutivas
- [ ] Melhorar acessibilidade (aria-labels, keyboard navigation)

### 5.3 Adicionar analytics e monitoring (15 min)
- [ ] Adicionar logging de erros com contexto
- [ ] Track user actions para analytics
- [ ] Adicionar health check endpoint
- [ ] Monitorizar performance de queries

### 5.4 Preparar para produção (15 min)
- [ ] Rodar `npm run build` e corrigir warnings
- [ ] Rodar `npm run lint` e corrigir erros
- [ ] Verificar environment variables em produção
- [ ] Testar deploy preview
- [ ] Adicionar error tracking (Sentry ou similar)

---

## Resumo do Progresso

### ✅ Completado
- **Hora 1**: Testes e CI/CD - 90% completo
  - Ambiente de testes configurado (jest, testing-library)
  - 6 novos ficheiros de testes criados
  - CI/CD pipeline configurado com GitHub Actions
- **Hora 2**: Database e Migrações - 85% completo
  - Migração combinada 028 criada com todas as tabelas e índices
  - Todas as tabelas verificadas (existem no schema)
  - Função exec_sql criada com restrições de segurança
- **Hora 3**: Features Pendentes - 80% completo
  - Delete List API já existia
  - Comments e Collaborators UI já existiam
  - Tags e Cover Image implementados no ListForm e ListCard
- **Hora 4**: Code Quality - 30% completo
  - next-auth removido das dependências
  - Cache headers já existiam em algumas API routes

### ⏳ Pendente
- Aplicar migração 028 no Supabase Dashboard (requer acesso manual)
- Testes unitários restantes
- Melhorias de TypeScript e error handling
- Documentação e preparação para produção

---

## Prioridade Máxima (próximos passos)

1. **Aplicar migração 028** no Supabase Dashboard - Copiar o conteúdo de `supabase/migrations/028_combined_pending_migrations.sql` e executar no SQL Editor
2. **Rodar `npm prune`** para limpar dependências não utilizadas
3. **Corrigir tipagem TypeScript** - Remover `any` types e usar tipos do Supabase
4. **Adicionar botão de delete** na UI de ListDetail
5. **Rodar testes** com `npm test` para verificar cobertura
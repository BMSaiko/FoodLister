# T64 — URLs amigáveis com slug (DP)

**Data:** 2026-08-13 | **Estado:** planeado, NÃO implementar agora | **Objetivo:** dar scope e ordem de execução quando for abordado. YAGNI: cosmético/SEO — as URLs com UUID funcionam.

## Decisão
- Recomendação ponytail: **USERS-ONLY** primeiro (slug já existe = `user_id_code` FL000001), cobre 90% do valor com 1/10 do esforço. Restaurants/lists ficam UUID até serem pedidos.
- Caminho completo (slug em tudo) só se o BMS insistir — documentado em baixo.

---

## Fase 1 (USERS-ONLY — recomendado)

### Porquê é barato
- `profiles.user_id_code` (FL000001) JÁ existe e é único. Sem migration, sem backfill.
- Rota `/users/[id]` JÁ aceita user_id_code OU uuid (`validateProfileAccess` em `libs/auth.ts:166`, regex `^[A-Z]{2}\d{6}$`).

### Mudanças
1. **Rota `/users/[id]`**: já funcional — nenhuma mudança de backend.
2. **Frontend — usar user_id_code nos links de perfil** (substituir `user.id` uuid). Grep: `grep -rn "users/\${.*user.*id" app/ components/`
   Sites prováveis: Navbar, ProfileActions, UserCard, ReviewCard, RestaurantCard footer, ListCard, comments/mentions.
3. **Rota `/users/me`** já devolve `user_id_code`. Confirmar que os hooks de perfil expõem.

### Verificação
- `get /api/users/FL000001` → 200, mesmo perfil que `get /api/users/<uuid>`.
- Clicar num nome de creator → URL `/users/FL000001`.

---

## Fase 2 (restaurants/lists com slug — SÓ se pedido)

### Migration (2 tabelas)
```sql
ALTER TABLE public.restaurants ADD COLUMN slug text UNIQUE;
ALTER TABLE public.lists ADD COLUMN slug text UNIQUE;
-- backfill: gerar slug a partir do name (slugify) para linhas existentes
```
- Geração no create: slugify do nome + sufixo aleatório curto se colidir.
- Regra do slug: `nome-slugified` (ex. `a-talha`). Definir com BMS antes (nome-slugified vs numerico).

### Rotas
- `restaurants/[id]` e `lists/[id]` aceitam slug OU uuid no param (`.eq('slug', p).maybeSingle()` com fallback `.eq('id', p)`), preservando links antigos com UUID.
- `app/api/users/[id]` e helpers de review/comment que resolvem por id — aplicar o mesmo resolver.

### Frontend — substituir `/[id]` por `/[slug]` em 44 ficheiros
- Todos os `Link href={`/restaurants/${id}`}` / `/lists/${id}` / `/meals/${id}` passam a usar `.slug`.
- Resposta das rotas REST precisa de devolver `slug` (adicionar ao select).
- CALLERS críticos (grep): RestaurantCard, HeroCounter, GlobalSearch, Roulette, RestaurantMap, ListCard, Navbar, tables admin.

---

## Riscos
- **Compatibilidade**: links antigos com UUID partilhados — fallback id obrigatório, nunca eliminar UUID.
- **44 ficheiros** de links = risco de não cobrir todos → grep final + e2e.
- Slug de user idempotente (FL000001 imutável); slug de restaurant muda se renomear → decidir: regenerar ou fixar.

## Ordem de execução (quando for)
1. Fase 1 users-only (rótimo, horas, sem risco).
2. Se full: DP do DP — migration + resolver slug/id numa util partilhada (`libs/resolveRouteId.ts`) + bulk link swap com grep/regex + e2e.

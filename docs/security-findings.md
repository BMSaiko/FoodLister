# FoodLister — Security Findings & API Hardening (Auditoria)

> Card: `4n52aby1` · Ideia: hardening de API REST + rate limiting universal. Gerado a partir da **auditoria real do código** (a `docs/security-findings` e `infra/foodlister-security-audit` referidas no card não existiam — este ficheiro é a auditoria injetada).

## Estado (TL;DR)

O código já está **mais endurecido do que o DP original assumia**:
- `requireUser` / `requireAdmin` **já existem** (`libs/supabase/server.ts`) e já são usados por várias rotas (guard W1 único).
- `validateProfileAccess` + `getUser{Profile,Reviews,Lists,Restaurants}Data` **já existem** (`libs/auth.ts`) e outram por `OWNER | PUBLIC | PRIVATE`.
- Rate-limit **já existe** por rota (`libs/rate-limit.ts`, opt-in: reviews, meals/*, upload) — mas não era **universal**.
- RLS + security definer em `supabase/migrations/007/028/030/051`; CSP Report-Only em `next.config.mjs`.

### O que este card alterou (verificação: `tsc --noEmit` + `next build` + lint + jest)

1. **CORS whitelist** — `middleware.ts` deixou de responder `Access-Control-Allow-Origin: *`. Agora só devolve o header quando o `Origin` está na whitelist (`NEXT_PUBLIC_APP_URL` + `CORS_ALLOWED_ORIGINS` + localhost dev); preflight de origem não permitida → **403**; `Vary: Origin` nos restantes.
2. **Rate limiting universal** — `middleware.ts` aplica limitação em memória (edge-safe) a **todo o `/api/*`**, por IP, devolvendo **429 + `Retry-After`**; budgets configuráveis por env; prefixes sensíveis (`/api/osm/geocode`, `/api/resolve-google-maps-url`, `/api/users/search`, `/api/notifications/email`) com limite mais baixo. (`libs/security.ts`, ponytail: per-instance/efémero, trocar por Upstash quando multi-region.)
3. **IDOR em `/api/users/{uuid}/lists`** — num perfil público, um visitante não-owner passou a ver **apenas listas `is_public=true`** (query, fallback e count); listas privadas deixaram de vazar.
4. **Auditoria** (este ficheiro).

## Matriz de rotas `app/api` (68)

Colunas: **AUTH** = `admin`(requer admin) · `auth`(requer sessão) · `session/pub`(usa cliente de sessão/público; decide na rota) · `public`(intencional) · `NONE`(sem guard detectado).

| Route | Métodos | AUTH | Tabelas supabase | Notas |
|---|---|---|---|---|
| `admin/lists` | GET | admin | lists | usa service_role |
| `admin/marketing/analytics` | GET | admin | marketing_campaigns, social_media_posts |  |
| `admin/reports/[id]` | PATCH | admin | reports |  |
| `admin/reports` | GET | admin | reports |  |
| `admin/restaurants` | GET | admin | restaurants | usa service_role |
| `admin/reviews/[id]` | DELETE | session/pub | profiles, reviews | usa service_role |
| `admin/reviews` | GET | admin | reviews | usa service_role |
| `admin/stats` | GET | admin | cuisine_types, list_collaborators, list_likes, list_restaurants, lists, profiles, restaurants, reviews, scheduled_meals, user_events |  |
| `admin/users/[id]` | GET,PUT | session/pub | lists, profiles, reviews | usa service_role |
| `admin/users/deactivate` | POST | session/pub | profiles | usa service_role |
| `admin/users` | GET | admin | profiles | usa service_role |
| `analytics/events` | POST | auth | user_events |  |
| `cuisine-types` | GET,POST | public | cuisine_types | dados de referencia OK |
| `dietary-options` | GET,POST | public | restaurant_dietary_options | dados de referencia OK |
| `features` | GET,POST | public | restaurant_features | dados de referencia OK |
| `feed` | GET | public | lists, profiles, reviews, user_follows | feed publico |
| `health` | GET | public | - | healthcheck OK |
| `home/stats` | GET | public | profiles, restaurants, reviews | stats home |
| `lists/[id]/activities` | GET | session/pub | list_activities |  |
| `lists/[id]/collaborators` | DELETE,GET,POST | session/pub | list_collaborators, lists, profiles |  |
| `lists/[id]/comments` | DELETE,GET,POST,PUT | session/pub | list_comments, lists, profiles |  |
| `lists/[id]/export` | GET | session/pub | list_collaborators, list_restaurants, lists, restaurants |  |
| `lists/[id]/like` | GET,POST | session/pub | list_likes, lists, profiles |  |
| `lists/[id]/restaurants/[restaurantId]` | DELETE | session/pub | list_collaborators, list_restaurants, lists, profiles, restaurants |  |
| `lists/[id]/restaurants` | POST | session/pub | list_collaborators, list_restaurants, lists, profiles, restaurants |  |
| `lists/[id]` | DELETE,GET,POST,PUT | session/pub | list_collaborators, list_restaurants, lists, profiles, restaurants |  |
| `lists` | GET | session/pub | list_collaborators, list_restaurants, lists |  |
| `marketing/campaigns/[id]` | DELETE,PUT | session/pub | marketing_campaigns |  |
| `marketing/campaigns` | GET,POST | session/pub | marketing_campaigns |  |
| `marketing/posts` | GET,POST | public | restaurants, social_media_posts | posts marketing |
| `marketing/workflows` | GET,POST | session/pub | ai_workflows |  |
| `meals/[id]/ics` | GET | session/pub | scheduled_meals |  |
| `meals/[id]` | DELETE,GET,PATCH | session/pub | meal_participants, notifications, scheduled_meals | usa service_role |
| `meals/participants` | DELETE,PATCH,POST | session/pub | meal_participants, scheduled_meals |  |
| `meals/schedule` | POST | session/pub | meal_participants, notifications, profiles, restaurants, scheduled_meals | usa service_role |
| `meals/scheduled` | GET | session/pub | - |  |
| `notifications/create` | POST | NONE | - | SEM AUTH - qualquer caller cria notif p/ qq userId [M] |
| `notifications/email` | POST | NONE | notifications, profiles | SEM AUTH + admin-client (relay/abuso email) [ALTA] |
| `notifications/preferences` | GET,PUT | auth | notification_preferences |  |
| `notifications/push/subscribe` | POST | session/pub | notification_preferences |  |
| `notifications/push/vapid-key` | GET | public | - | chave publica VAPID OK |
| `notifications` | DELETE,GET,PATCH | auth | notifications |  |
| `osm/geocode` | GET | public | - | proxy Nominatim; sensible -> rate limit baixo |
| `reports` | POST | auth | reports |  |
| `resolve-google-maps-url` | GET | public | - | proxy GMaps; sensible -> rate limit baixo |
| `restaurants/[id]/rating` | POST | session/pub | restaurants, reviews |  |
| `restaurants/[id]` | DELETE,GET,PATCH | admin | restaurants |  |
| `restaurants/batch/check` | POST | admin | restaurants |  |
| `restaurants/batch` | POST | admin | profiles, restaurants |  |
| `restaurants/nearby` | GET | session/pub | restaurants |  |
| `restaurants/no-coords` | GET | session/pub | restaurants |  |
| `restaurants` | GET,POST | auth | profiles, restaurants |  |
| `reviews/[id]` | DELETE,GET,PUT | auth | profiles, reviews |  |
| `reviews` | GET,POST | auth | profiles, restaurants, reviews |  |
| `stripe/webhook` | POST | public | profiles, subscription_plans, user_subscriptions | valida assinatura do evento (index.ts webhook) |
| `subscriptions/[id]` | DELETE,PUT | session/pub | profiles, user_subscriptions |  |
| `subscriptions` | GET,POST | session/pub | subscription_plans, user_subscriptions |  |
| `upload` | POST | NONE | - | SEM AUTH - upload anonimo Cloudinary (rate 10/min) [M] |
| `users/[id]/access` | GET | session/pub | - |  |
| `users/[id]/follow` | GET,POST | session/pub | user_follows |  |
| `users/[id]/lists` | GET | session/pub | lists, profiles |  |
| `users/[id]/restaurants` | GET | session/pub | profiles, restaurants |  |
| `users/[id]/reviews` | GET | session/pub | profiles, reviews |  |
| `users/[id]` | GET | session/pub | restaurants, user_follows |  |
| `users/me` | GET,PUT | session/pub | lists, profiles, restaurants |  |
| `users/me/stats` | GET | session/pub | restaurants, reviews |  |
| `users/search` | GET | SESSION/pub | profiles | search; enumerate-de-limit baixo |
| `users/settings` | GET,PUT | session/pub | lists, profiles, restaurants |  |

## Achados (novos, priorizados)

| # | Severidade | Endpoint | Problema | Remediação / sub-card |
|---|---|---|---|---|
| A1 | **ALTA** | `POST /api/notifications/email` | Sem auth, usa `createAdminClient` para ir buscar e enviar email — pode ser abusado como *email relay/spam* e custo. Comentário no código diz que é *chamado internamente* por outras APIs. | Não forçar sessão (partiria a cadeia interna). Expor a rota só para chamadas internas: `x-internal-secret` (env) no header, ou mover a lógica para uma lib e remover a `route.ts` pública. **Sub-card.** |
| A2 | MÉDIA | `POST /api/notifications/create` | Sem auth: qualquer caller cria notificação para um `userId` arbitrário (spoof). | Exigir `requireUser` e ancorar `userId` ao user da sessão (ou admin). **Sub-card.** |
| A3 | MÉDIA | `POST /api/upload` | Sem auth: upload de imagem para Cloudinary anónimo (só rate-limit 10/min) — custo/abuso de armazenamento. | Exigir `requireUser`; guardar `owner_id` (user da sessão) na imagem. **Sub-card.** |
| A4 | MÉDIA | `/api/admin/users/deactivate` e `/api/admin/*` | Dependem de checks `is_admin` internos + `service_role`; o middleware `ADMIN_ROUTES=['/admin']` **não** cobre `/api/admin/*` (matcher exclui só assets). | Confirmar que **todas** as rotas admin chamam `requireAdmin` (não só ver um `is_admin`); qualquer rota admin sem guard é IDOR admin. **Sub-card de revisão dedicado.** |
| A5 | BAIXA | `/api/users/{uuid}/*` resto | Perfis privados já devolvem 404 nas rotas de listas/reviews/restaurants; contagens privadas (followers) visíveis em `/users/[id]/follow`. | Decidir se `followers` deve ser público; enumerar `follow` com 404 indistinto p/ não existente. **Sub-card.** |

## Já em vigor (não duplicar)

- `requireUser`/`requireAdmin` — `libs/supabase/server.ts` (W1 ponytail), já usado por: analytics/events, notifications, notifications/preferences, reports, restaurants, reviews, reviews/[id], meals/*, etc.
- `validateProfileAccess` (OWNER/PUBLIC/PRIVATE) + `getUser*Data` — `libs/auth.ts`, usado por `users/me`, `users/[id]`, `users/[id]/access`.
- Rate-limit por rota — `libs/rate-limit.ts` (reviews, meals/participants, meals/scheduled, upload).
- RLS + security definer — migrações `007`, `028`, `030`, `051`, `20260626160000`, `205`.
- CSP Report-Only (`next.config.mjs`); `frame-ancestors 'none'`.

## Recomendação de sub-cards (o DP original previa 6 fases; o estado real reduz o escopo)

1. **SC-1 — Internal-only endpoints**: fechar `notifications/email` + `notifications/create` (secret interno ou mover para lib). Cobre A1/A2.
2. **SC-2 — Revisão `admin/*`**: garantir guard `requireAdmin` em todas as rotas admin (não só `is_admin`). Cobre A4.
3. **SC-3 — `upload` autenticado**: `requireUser` + `owner_id`. Cobre A3.
4. **SC-4 — (Opcional) headless-check / UA** em endpoints públicos enumeráveis — a Fase 3 (rate-limit) já mitiga a maior parte do scraping.

## Correções ao DP `4n52aby1`

O DP assumia 'auth inconsistente', 'nenhuma dependência de rate-limit' e '68 rotas a blindar'. A auditoria mostra que `requireUser/requireAdmin` e `validateProfileAccess` já existem e que há rate-limit por rota; as lacunas reais são as do [Achados] deste ficheiro. Por isso este card não alterou as 68 rotas — entregou CORS whitelist + rate-limit universal + fix IDOR + auditoria, e deixou os endpoints problemáticos como sub-cards de escopo pequeno.

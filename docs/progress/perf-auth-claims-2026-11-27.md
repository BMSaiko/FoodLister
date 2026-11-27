# Medição de chamadas ao Auth por pedido (#378 + `/api/lists`)

Ambiente: Supabase local com chaves ES256 (`signing_keys_path`), utilizador `perf-auth@example.com` com sessão real, build de produção, 20 pedidos por rota.
Antes = `1af9490` (pré-#378). Depois = `origin/dev` (#378) + migração de `/api/lists` para `getAuthUserResult`.

Comando: `node scripts/perf-auth-claims.mjs --key <publishable> --n 20` (conta `GET /user` no log do contentor Auth).

| rota | GET /user antes | depois | p50 antes→depois (ms) | p95 antes→depois (ms) |
|---|---|---|---|---|
| /api/restaurants | 0 | 0 | 18→18 | 39→34 |
| /api/feed | 0 | 0 | 38→34 | 49→47 |
| /api/home/stats | 0 | 0 | 32→33 | 40→37 |
| /api/cuisine-types | 0 | 0 | 17→17 | 25→25 |
| /api/dietary-options | 0 | 0 | 19→17 | 27→25 |
| /api/features | 0 | 0 | 15→16 | 20→22 |
| /api/lists | 20 (1,00/pedido) | 0 | 41→37 | 54→67 |
| /api/meals/scheduled | 20 (1,00) | 0 | 25→26 | 54→37 |
| /api/notifications | 20 (1,00) | 0 | 25→26 | 72→34 |

Total `GET /user`: 60 → 0 (as 6 rotas públicas nunca chamam o Auth). Latência local sem diferença relevante (ruído; o Auth está a ~1 ms de rede). O ganho esperado é em produção, com round-trip real ao Auth.

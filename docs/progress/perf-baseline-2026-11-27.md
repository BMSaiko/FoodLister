# Baseline de performance — 2026-11-27

- Commit base: `22df6a2` (dev) + `scripts/perf-baseline.mjs`
- Máquina: Linux 7.2 (Omarchy), Node v26.12.0, build de produção local (`npm run build && npm start`)
- Método: `node scripts/perf-baseline.mjs` (N=30 por rota, 3 de aquecimento, GET sem sessão)

## Limitações (ler antes de comparar)

- **Base de dados local vazia**: `/api/restaurants` e `/api/lists` devolvem listas vazias. Os tempos medem Node + middleware + latência da BD local, **não** o custo de dados reais nem a latência Supabase (us-west-1) em produção. Para ganhos reais repetir contra staging com dados (SP `regiao-latencia`).
- Sem sessão: `/api/feed`, `/api/meals/scheduled`, `/api/notifications` devolvem 401; medem só o middleware/auth. Falta um token de teste para os medir autenticados.
- `/api/meals` não existe (só subrotas); medida `/api/meals/scheduled`.
- Nº de queries: `apiMonitor`/`dbMonitor` são só de cliente (localStorage), sem contagem no servidor. Coluna `n/d`; contar queries pede instrumentação própria.

## Resultados

| rota | status | p50 ms | p95 ms | bytes | queries |
|---|---|---|---|---|---|
| /api/restaurants | 200 | 13 | 18 | 283 | n/d |
| /api/feed | 401 | 5 | 8 | 54 | n/d |
| /api/home/stats | 200 | 17 | 22 | 82 | n/d |
| /api/cuisine-types | 200 | 8 | 12 | 9884 | n/d |
| /api/dietary-options | 200 | 7 | 11 | 23266 | n/d |
| /api/features | 200 | 8 | 11 | 17471 | n/d |
| /api/lists | 200 | 10 | 15 | 76 | n/d |
| /api/meals/scheduled | 401 | 5 | 8 | 93 | n/d |
| /api/notifications | 401 | 4 | 8 | 65 | n/d |

## 5 mais lentas por p95 (respostas 200)

1. `/api/home/stats` — 22 ms: agregados por pedido; hipótese: sem cache, várias contagens.
2. `/api/restaurants` — 18 ms: filtros/paginação dinâmicos; hipótese: sem índices nem cache (vazio aqui, esperar pior com dados).
3. `/api/lists` — 15 ms: consulta por utilizador + paginação; hipótese: auth + query sem índice.
4. `/api/cuisine-types` — 12 ms, 9,9 kB: dados de referência quase estáticos; hipótese: falta `Cache-Control`/cache de referência.
5. `/api/dietary-options` e `/api/features` — 11 ms, 23 kB e 17 kB: mesmo padrão e respostas maiores; hipótese: cache de referência, projeção de colunas.

Ordem relativa útil, valores absolutos não: repetir com dados reais antes de priorizar.

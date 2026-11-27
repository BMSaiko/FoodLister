# Baseline de performance — 2026-11-27

- Commit base: `22df6a2` (dev) + `scripts/perf-baseline.mjs`
- Máquina: Linux 7.2 (Omarchy), Node v26.12.0, build de produção local (`npm run build && npm start`)
- Método: `node scripts/perf-baseline.mjs` (N=30 por rota, 3 de aquecimento, GET sem sessão)

## Limitações (ler antes de comparar)

- **BD local, não produção**: a 1.ª medição foi com a BD vazia; a 2.ª (abaixo, a de referência) com 3000 restaurantes, 6000 ligações a cozinhas e 200 listas sintéticos (`creator_name='perf-seed'`, só local). Mede Node + middleware + BD local, **não** a latência Supabase (us-west-1) em produção nem a distribuição de dados reais. Para ganhos reais repetir contra staging (SP `regiao-latencia`).
- Sem sessão: `/api/feed`, `/api/meals/scheduled`, `/api/notifications` devolvem 401; medem só o middleware/auth. Falta um token de teste para os medir autenticados.
- `/api/meals` não existe (só subrotas); medida `/api/meals/scheduled`.
- Nº de queries: `apiMonitor`/`dbMonitor` são só de cliente (localStorage), sem contagem no servidor. Coluna `n/d`; contar queries pede instrumentação própria.

## Resultados (referência: BD local com 3000 restaurantes e 200 listas sintéticos)

| rota | status | p50 ms | p95 ms | bytes | queries |
|---|---|---|---|---|---|
| /api/restaurants | 200 | 12 | 17 | 17183 | n/d |
| /api/feed | 401 | 6 | 10 | 54 | n/d |
| /api/home/stats | 200 | 25 | 52 | 1969 | n/d |
| /api/cuisine-types | 200 | 11 | 15 | 9884 | n/d |
| /api/dietary-options | 200 | 8 | 11 | 23266 | n/d |
| /api/features | 200 | 8 | 14 | 17471 | n/d |
| /api/lists | 200 | 16 | 19 | 20707 | n/d |
| /api/meals/scheduled | 401 | 5 | 8 | 93 | n/d |
| /api/notifications | 401 | 4 | 7 | 65 | n/d |

Com a BD vazia (1.ª medição): todas p95 ≤ 22 ms; `/api/home/stats` 22 ms.

## 5 mais lentas por p95 (respostas 200, com dados)

1. `/api/home/stats` — p95 52 ms (p50 25): agregados por pedido, o único que escala claramente com os dados; hipótese: várias contagens sem cache.
2. `/api/lists` — 19 ms, 20,7 kB: devolve 50 listas por pedido; hipótese: paginação/colunas a mais, sem índice.
3. `/api/restaurants` — 17 ms, 17 kB: filtros/paginação dinâmicos; hipótese: ordenação por nome sem índice, sem cache.
4. `/api/cuisine-types` — 15 ms, 9,9 kB: dados de referência quase estáticos; hipótese: falta `Cache-Control`/cache.
5. `/api/features` — 14 ms, 17,5 kB (e `/api/dietary-options` 11 ms, 23 kB): mesmo padrão; hipótese: cache de referência, projeção de colunas.

A escala é pequena (tudo < 60 ms em local); o ganho em produção virá sobretudo da latência de rede à BD e de cache. Repetir contra staging.

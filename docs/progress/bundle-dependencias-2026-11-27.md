# Bundle: dependências (2026-11-27)

First Load JS por rota (`npm run build`, antes → depois).

| Rota | Antes | Depois | Δ |
|---|---|---|---|
| /admin | 216 kB | 112 kB | -104 kB |
| /admin/statistics | 212 kB | 107 kB | -105 kB |
| /lists/[id] | 380 kB | 277 kB | -103 kB |
| /map, /restaurants, /feed | 259/270/256 kB | igual | 0 |
| Partilhado | 103 kB | 103 kB | 0 |

Alterações: `framer-motion` removido (único uso `Card.tsx` migrado para `motion/react`); `GrowthChart` e `ListStatistics` com `dynamic()` (recharts fora do bundle inicial); export morto de `PerformanceDashboard` retirado do barrel; `optimizePackageImports` alargado (`recharts`, `motion`, `react-toastify`). Leaflet já era `dynamic`. `openai`/`stripe`/`cloudinary`: sem imports em componentes cliente.

Gate: `npm run check` verde (625 testes); `npm run build` rc 0. E2E não corrido localmente (sem Supabase local); fica ao CI.

# Região das funções Vercel

**Contexto:** utilizadores em Portugal; Supabase em `us-west-1` (N. Califórnia).

## Decisão
`vercel.json` com `regions: ["sfo1"]` (junto à BD). Cada query passa a ~45–90 ms em vez de ~250–300 ms.

## Medição (preview, `/api/health?db=1`, mediana de 3 queries, 4–5 chamadas)
| Região | RTT função→BD |
|---|---|
| `iad1` | 248–298 ms |
| `sfo1` | 46–91 ms |

Páginas com vários round-trips à BD poupam ~200 ms por query; o custo PT→`sfo1` face a `iad1` é uma só vez por pedido.

## Alternativa fora deste SP
Migrar o Supabase para a UE (decisão do BMS): aproxima BD e utilizadores.

## Rollback
Repor `"regions": ["iad1"]` em `vercel.json` e fazer deploy.

## Medir
`vercel curl "<preview>/api/health?db=1"` (preview protegido por Vercel Authentication).

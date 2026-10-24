# Paridade funcional: /restaurants (direções A e B)

| Funcionalidade atual | A «descoberta» | B «painel lateral» |
|---|---|---|
| Herói aleatório com crossfade e pontos | Herói grande full-width | Herói compacto (texto + imagem) |
| Ver restaurante / criador / rating / preço / local | Dentro do herói | Dentro do herói |
| Filtro preço min/max | Painel «Filtros» expansível | Painel lateral fixo |
| Filtro rating mínimo (1-5) | Painel expansível | Painel lateral |
| Filtro localização (cidade/país) | Painel expansível | Painel lateral |
| Filtro culinária (oculto sem dados) | Painel expansível | Painel lateral |
| Perto de mim + raio + estados (a localizar, sem localização, ativo) | Botão na barra | Botão no painel |
| Ordenar (6 opções + Aleatório novo, por defeito) | Select na barra | Select no painel |
| Limpar filtros | No painel | No painel |
| Contagem de resultados | Barra | Título «Explorar» |
| Pesquisa `?search` | Barra do topo (navbar existente) + estado «Pesquisa ativa» | Idem |
| Skeleton / vazio / sem resultados / erro | Barra de estados | Barra de estados |
| Load-more por sentinela | Mantém-se (fim da grelha) | Mantém-se |
| FAB criar restaurante (só com sessão) | Canto inferior direito | Idem |
| Cartão: rating/preço/nome/criador/local/ver | Grelha 3 col | Cartões em linha |
| Ações de hover | Visíveis em touch | Visíveis em touch |
| Mobile: filtros | Painel expansível | Folha de filtros |

## Verificação na implementação (A, 2026-10-24)

Todas as linhas da coluna A verificadas no código (`app/restaurants/page.js`, `RestaurantFilters.tsx`, `NearbyBar.tsx`, `RestaurantGrid.tsx`) e nas screenshots `proofs/impl-desktop.png` e `proofs/impl-mobile.png`: herói, filtros, Perto de mim, ordenação (Aleatório por defeito), limpar, contagem, skeleton/vazio/erro, load-more, FAB `/restaurants/create`, cartões 3:2 em 4 colunas. Gates: tsc OK, jest 439/439, e2e `restaurants.spec.ts` 5/5.

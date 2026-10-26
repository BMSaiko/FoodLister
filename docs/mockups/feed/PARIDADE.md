# Paridade /feed: 15 funcionalidades (FLOW.md) vs mockups

Dados: seed de desenvolvimento (Ana Teste, Restaurante Teste 1-5, listas de `docs/mockups/listas/data.json`); atores sem perfil e nomes longos como casos extremos. Estados via `?state=` ou painel no canto.

| # | Funcionalidade | A Linha do tempo | B Cartões |
|---|---|---|---|
| 1 | Título + ícone | cabeçalho + subtítulo | idem |
| 2 | Auth (401) | cai no «Erro total» | idem |
| 3 | Item review | nó ★ no trilho, link ao restaurante | cartão com foto do restaurante |
| 4 | Item lista | nó lista, link à lista | cartão com 3 capas (ou vazio tracejado) |
| 5 | Item follow | nó seguidor | cartão compacto sem media |
| 6 | Cartão clicável | linha inteira | cartão inteiro (link esticado) |
| 7 | Avatar (+ ícone sem foto, link ao perfil) | sim, link irmão (sem `<a>` aninhado) | idem |
| 8 | Tempo relativo | mesma regra | idem |
| 9 | Privacidade | lógica da API, sem UI | idem |
| 10 | Ordem/janela | agrupado em Hoje/Ontem/Esta semana/Mais antigo (**novo**) | sequência simples |
| 11 | Carregar mais + spinner | botão de largura total | **scroll infinito** como `/restaurants` (sentinela 600px, 2 skeletons a carregar, «Chegaste ao fim»; botão só como «Tentar novamente» se falhar) |
| 12 | Loading inicial | spinner centrado (propõe skeleton na implementação) | idem |
| 13 | Vazio | Tovi a dormir + CTA «Explorar restaurantes» | idem |
| 14 | Erro | banner por cima da lista; «Erro total» com Tovi e «Tentar novamente» (**novo**) | idem |
| 15 | Navbar + tab bar | mantêm-se (tab bar com «Feed» ativo: **novo acesso**) | idem |

## Decisões a levar ao BMS
1. Escolher A (linhas leves, leitura por dia) ou B (cartões visuais, mais altos).
2. Entrada «Feed» na navegação (hoje nada liga a `/feed`).
3. Ecrã de erro total com «Tentar novamente».
4. Foto do review/capas da lista exigem a API devolver imagem (hoje não devolve: `buildFeedItems` só envia texto). Mudaria o contrato; em B seria só frontend se se omitir a foto. A não precisa.

## Ronda 2 (2026-10-26): B escolhida pelo BMS
- Scroll infinito igual ao `RestaurantGrid` (IntersectionObserver, `rootMargin 600px`); sem botão «Carregar mais». Mockup simula 3 páginas e fim. Provas `proofs/b2-*`.
- Implementação: reutilizar o padrão do `RestaurantGrid`/`hooks/ui/useInfiniteScroll`.

# Paridade funcional — `/roulette`

Fonte: `app/roulette/page.tsx` (258 l), `components/ui/RestaurantRoulette.tsx` (270 l), `RestaurantFilters` (372 l), `NearbyBar` (66 l), `RestaurantCard`.
Entrada: Navbar «Roleta» (desktop e tab bar mobile). Saída: `/restaurants/<slug|id>`; Navbar.
Baseline: `tsc --noEmit` rc 0 em `dev` (8e152fa).

| # | Funcionalidade atual | Onde fica no novo design | Verificado |
|---|---|---|---|
| 1 | Hero (badge, h1, subtítulo) | A: cabeçalho; B: título sobre a roda | [ ] |
| 2 | Fonte «Todos (n)» | A: chip «Todos» na caixa Fonte; B: chips por cima da roda | [ ] |
| 3 | Fonte por lista do utilizador (nome truncado a 18, contagem, spinner de carregamento, só autenticado) | Igual, chips com spinner (estado «A carregar») | [ ] |
| 4 | Cache de listas por id (`/api/lists/:id`) | Lógica inalterada (cache por id) | [ ] |
| 5 | Filtros reutilizados de `/restaurants` (`RestaurantFilters`) | A: caixa Filtros; B: dentro de «Perto de mim e filtros» | [ ] |
| 6 | Perto de mim: ligar/desligar, pedir localização, raio, loading, erro, erro de localização | A: caixa própria; B: no painel recolhível; erro visível (estado «Erro de localização») | [ ] |
| 7 | Contagem «n restaurantes a X km» (perto) | Texto sob o raio, junto à contagem | [ ] |
| 8 | Contagem «n disponíveis (filtrados de m)», plural | Linha de contagem acima do botão (estado «200 itens») | [ ] |
| 9 | Botão «Girar Roleta» (desativado com 0 resultados) | Botão principal, desativado com 0 | [ ] |
| 10 | Pré-visualização: grelha de 9 `RestaurantCard` + «+N mais» | Secção «Na roleta»: 9 cartões + «+N mais» | [ ] |
| 11 | Estado loading (6 esqueletos) | Esqueletos (estado «A carregar») | [ ] |
| 12 | Estado vazio «Sem restaurantes» (fonte vazia) vs «Sem resultados» (filtros) | Texto vazio na grelha e no ecrã da roleta | [ ] |
| 13 | Roleta (ecrã inteiro): animação com abrandamento aleatório, nome em máquina de escrever | A: slot de nomes; B: roda a rodar; ambos respeitam reduced-motion | [ ] |
| 14 | Ecrã da roleta: imagem (fallback 🍽️), nome, rating, preço €, localização, até 3 cozinhas | A: cartão de resultado; B: folha por baixo da roda (foto, nome, nota, preço, local, 3 cozinhas; sem foto = 🍽️) | [ ] |
| 15 | Texto de estado: parado / «A girar...» / «Resultado!» | Texto da roleta: Pronto / A girar… / Restaurante selecionado | [ ] |
| 16 | Botão girar: «Girar Roleta» → «Girar Novamente», desativado a girar | Botão passa a «Girar novamente», desativado a girar | [ ] |
| 17 | Resultado: «Restaurante Selecionado!», «Ver Restaurante» (link), «Girar» (repor) | «Ver restaurante» e «Girar de novo» no resultado | [ ] |
| 18 | Swipe >50 px no resultado volta a girar (mobile) | Swipe >50 px no cartão de resultado | [ ] |
| 19 | Teclado: Espaço gira, Esc fecha (bloqueados a girar) | Espaço gira, Esc fecha (bloqueado a girar) | [ ] |
| 20 | Fechar (X) desativado a girar | Esc em vez de X: fechar só quando parado | [ ] |
| 21 | Modal «Sem restaurantes» com Fechar (roleta com lista vazia) | Diálogo «Sem restaurantes» com Fechar | [ ] |
| 22 | Rodapé «n restaurantes na lista • Espaço para girar» | Linha de contagem + dica «Espaço para girar» | [ ] |
| 23 | `usePageTitle("Roleta - FoodLister")`, Navbar | Título e Navbar mantidos | [ ] |
| 24 | `prefers-reduced-motion` (a garantir; hoje ausente) | CSS: prefers-reduced-motion desliga animações; resultado imediato | [ ] |

## Observações do baseline
- Visual atual usa gradiente roxo/rosa/âmbar, não só âmbar: a SP pede identidade âmbar/laranja, menos efeitos.
- Casos extremos a mostrar nos mockups: nome longo, sem imagem, lista vazia, 200 restaurantes, sem rating/preço.
- Strings sem acentos («Nao», «Espaco»): decidir se corrige no redesign.

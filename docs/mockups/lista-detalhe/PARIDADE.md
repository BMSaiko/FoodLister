# Paridade `/lists/[id]` (1ª ronda, 2026-10-25)

Dados reais: lista pública `restaurantes-tascas-por-visitar` (snapshot `data.json`, 94 restaurantes, 22 sem imagem). Estados no seletor inferior de cada HTML: normal, loading, vazia, erro, não encontrada, 94 itens, texto longo, sem imagem; desktop e mobile 390.

Direções: **A Editorial** (`a-editorial.html`: herói com mosaico de fotos, barra de ações fixa, estatísticas em faixa, grelha 3 colunas) e **B Painel** (`b-painel.html`: painel lateral fixo com capa, ações e estatísticas; lista/mosaico alternável à direita).

| # | Funcionalidade atual | A Editorial | B Painel |
|---|---|---|---|
| 1 | Voltar às listas | link «Listas» acima do herói | link «Listas» no topo do painel |
| 2 | Capa (nome, descrição, Pública/Privada, nº, criador) | herói com badge, título, criador e data | cartão do painel |
| 3 | Partilhar | botão na barra de ações | ícone no painel |
| 4 | Roleta | botão primário na barra | botão primário do painel (desativado se vazia) |
| 5 | Editar | botão na barra | ícone no painel |
| 6 | Duplicar | menu «Mais ações» | menu «Mais ações» |
| 7 | Eliminar | menu «Mais ações» (com confirmação) | idem |
| 8 | Gosto + Denunciar | Gosto na barra; Denunciar no menu | Gosto no painel; Denunciar no menu |
| 9 | Meta bar (nº, rating, preço, locais, data) | faixa de estatísticas + data no herói | cartões do painel + data |
| 10 | Aplicar filtros da lista (`list.filters`) | **a desenhar**: banner sob a barra quando existe (a lista de demo não tem) | idem, banner no topo da coluna da lista |
| 11 | Estatísticas | faixa (ocultada se vazia) | cartão «Estatísticas» (oculto se vazia) |
| 12 | Filtros avançados | chip «Filtros avançados» | chip «Filtros» |
| 13 | Perto de mim | chip + raio + contador | idem |
| 14 | Grelha: chips de cozinha, remover, vazio | chips; remover no cartão (sempre visível em touch); vazio com CTA | idem, em lista ou mosaico |
| 16 | Colaboradores (só dono) | painel no fim | painel lateral |
| 17 | Comentários (só pública) | painel no fim | no fim da coluna principal |
| 18 | Atividade | painel no fim | no fim da coluna principal |
| 19 | Estados loading / não encontrada / erro | seletor de estados | seletor de estados |
| 20 | Título da página | inalterado | inalterado |

Pendente para a ronda de refinamento: banner do filtro da lista (#10), cozinhas reais por restaurante nos chips (os chips do mockup são ilustrativos), mapa de «Perto de mim».

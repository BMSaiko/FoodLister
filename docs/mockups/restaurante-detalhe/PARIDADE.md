# Paridade funcional: /restaurants/[id] (direções A e B)

Fonte: `app/restaurants/[id]/page.tsx`, `HeroSection`, `RestaurantActions`, `InfoBento`, `CategoryChips`, `ReviewsFeed`, `ReviewForm`, `ListsSection`, `AddToList`, `ScheduleMealModal`, `ReportButton` (lidos a 2026-10-24).

Direções: **A «galeria + coluna lateral»** (mosaico de fotos, coluna fixa com título e ações, secções empilhadas); **B «faixa + abas»** (faixa de fotos compacta, abas Sobre / Avaliações / Listas, barra de ações fixa em mobile).

| # | Funcionalidade atual | A | B |
|---|---|---|---|
| 1 | Título da página «{nome} - FoodLister» | igual | igual |
| 2 | Carrossel de fotos (restaurante + fotos das avaliações, sem duplicados, sem `placeholder`/`data:`) | Mosaico 1+3 + «Ver as N fotos»; swipe em mobile | Faixa horizontal com scroll-snap |
| 3 | Contador `n / N` e miniaturas | Contador no botão do mosaico | Miniaturas na faixa |
| 4 | Lightbox (anterior/seguinte, fechar, `n / N`) | Mantém | Mantém |
| 5 | Sem fotos: mascote `tovi-a-dormir` | Bloco de marca no lugar do mosaico | Faixa de marca |
| 6 | «Por {criador}» (link para o perfil) | Por cima do título | Por baixo do título |
| 7 | Nome (h1) | Coluna lateral | Cabeçalho |
| 8 | Rating (só com avaliações) + contagem | Coluna lateral | Cabeçalho |
| 9 | Preço (nível €/€€ + «€N por pessoa») | Coluna lateral | Cabeçalho |
| 10 | Localização (texto) | Coluna lateral | Cabeçalho |
| 11 | Atalhos Mapa / Menu / Ligar / Site (só se existirem) | Linha de chips | Linha de chips |
| 12 | Avaliar (só com sessão) | Botão principal da coluna | Botão principal; barra fixa em mobile |
| 13 | Agendar (abre modal) | Botão da coluna | Idem |
| 14 | Partilhar (Web Share, fallback clipboard, toasts de erro) | Ícone na coluna | Ícone no cabeçalho |
| 15 | Menu «⋯»: Editar (dono/admin), Guardar numa lista, Denunciar (sessão), Eliminar (admin, com confirmação) | Menu da coluna | Menu do cabeçalho |
| 16 | Guardar numa lista (filtro, já-na-lista, toasts) | Botão visível ≥1024 px e no menu | Botão no menu |
| 17 | Localização: mapa + morada + «Abrir no Google Maps»; sem coordenadas só morada | Secção «Localização» | Aba Sobre |
| 18 | Telefones adicionais (`tel:`) | Secção «Contactos» | Aba Sobre |
| 19 | Galeria do menu (imagens) | Secção «Menu» | Aba Sobre |
| 20 | Chips: culinária / dietas / características (só se existirem) | Secção «Sobre» | Aba Sobre |
| 21 | Resumo de avaliações: nota, estrelas, distribuição 5→1 | Secção Avaliações | Aba Avaliações |
| 22 | Formulário de avaliação (nova/editar: estrelas, comentário com @, valor gasto, fotos; cancelar) | Inline | Inline |
| 23 | Cartão de avaliação: avatar/inicial, nome→perfil, estrelas, data, comentário truncado 150 (ver mais) | Mantém | Mantém |
| 24 | Editar/eliminar avaliação (autor ou admin; confirmação) e denunciar (sessão) | Sempre visíveis (hoje só em hover) | Idem |
| 25 | `?review=<id>` faz scroll + realce 3 s | Mantém | Mantém e abre a aba Avaliações |
| 26 | Sem avaliações: estado vazio + «Fazer avaliação» | Mantém | Mantém |
| 27 | Listas que contêm o restaurante → `/lists/{slug\|id}` | Secção Listas | Aba Listas (com contagem) |
| 28 | Loading (esqueleto), não encontrado (+ link «Voltar aos restaurantes») | Mantém | Mantém |
| 29 | Notificação de partilha (sucesso/erro) e toasts de avaliação | Toast | Toast |
| 30 | Botão voltar ao topo | Mantém | Mantém |

Estados extremos a mostrar nos mockups: normal, loading, não encontrado, erro, sem fotos, nome/morada longos, sem avaliações, muitas avaliações (dados repetidos dos 4 reais). Papéis: visitante, utilizador, dono, admin.

## Decisões da ronda de refinamento (A aprovado, 2026-10-24)
- Direção **A (galeria + coluna lateral)** escolhida e aprovada pelo BMS.
- «Informações»: só a informação crítica visível (morada, preço, horário, telefone, cozinha); resto (opções alimentares, características, website, menu online, avaliação, coordenadas, criador, datas) atrás de «Ver mais informações» (animado, respeita `prefers-reduced-motion`). Campos vazios: «Não indicado».
- Mapa clicável + único botão «Como chegar» → modal próprio (Google Maps, Waze, Apple Maps, copiar morada, lembrar escolha) em vez de abrir direto o Google Maps (substitui `GoogleMapsModal` atual).
- Visitante: botão «Avaliar» (leva a /auth/signin) + nota «Inicie sessão para avaliar e guardar em listas.».

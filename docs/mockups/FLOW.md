# Fluxo e inventário: /auth/signin

Fonte: `app/auth/signin/page.js` (lido a 2026-10-22). Rota real: `/auth/signin` (o SP diz `/signin`).

## Funcionalidades
| # | Funcionalidade | Detalhe |
|---|---|---|
| 1 | Email | `type=email`, `autoComplete=email`, required, label `sr-only`, placeholder «Endereço de email» |
| 2 | Password | required, `autoComplete=current-password`, label `sr-only` |
| 3 | Mostrar/ocultar password | botão com `aria-pressed` e `aria-label` |
| 4 | Esqueceu a password? | link para `/auth/reset-password` |
| 5 | Entrar | submit; spinner (`ToviSpinner`) e campos desativados durante loading |
| 6 | Criar conta | link «Crie uma gratuita» para `/auth/signup` |
| 7 | Aviso check-email | `?message=check-email` mostra toast info «Verifique o seu email…» |
| 8 | Erro de login | toast «Erro ao fazer login: {erro}» |
| 9 | Erro inesperado | toast «Erro inesperado. Tente novamente.» |
| 10 | Fallback Suspense | `ToviLoader` a ecrã inteiro |
| 11 | Título da página | «Entrar - FoodLister» (`usePageTitle`) |
| 12 | i18n | todos os textos via `t()` |

## Fluxo
- Chega de: `/auth/signup` (redirect com `?message=check-email`), `/auth/reset-password`, rotas protegidas, navegação.
- Segue para: sucesso vai para `/restaurants`; esqueceu vai para `/auth/reset-password`; sem conta vai para `/auth/signup`.

## Estado visual atual (para a auditoria)
Fundo `--background` (#050505) com 2 orbes âmbar desfocados; ícone de seta no topo (genérico); título «Bem-vindo de volta»; cartão duplo-bisel 3xl/2xl; ícones lucide (Mail, Lock, Eye, ArrowRight); erros só em toast; sem estado de erro inline.

---

# Fluxo e inventário: `/` (home)

Fonte: `app/page.js` (352 linhas), `components/landing/*`, `Navbar.tsx`, `app/api/home/stats/route.ts` (lido a 2026-10-23).

## Funcionalidades
| # | Funcionalidade | Detalhe |
|---|---|---|
| 1 | Título da página | «FoodLister - Início» (`usePageTitle`) |
| 2 | Barra de progresso de scroll | linha âmbar 2px no topo (`useSpring`) |
| 3 | Navbar | logo→`/`, Restaurantes/Mapa/Listas, pesquisa global (⌘K), idioma, Entrar (anónimo) ou criar/roleta/notificações/menu de utilizador (autenticado); tab bar fixa em mobile (Home, Restaurantes, Mapa, Pesquisa, Roleta, Listas, Perfil) |
| 4 | Hero | eyebrow «FoodLister Journal», título com typewriter, parágrafo, 2 CTAs: `/auth/signup` «Começar Jornada» e `/restaurants` «Explorar Restaurantes» |
| 5 | Stats | restaurantes, utilizadores (arredondados por `formatCount`), rating médio; «...» enquanto carrega; sem estado de erro (falha silenciosa) |
| 6 | Cartão de restaurante | só `lg+`; um dos `topRestaurants` escolhido por semente utilizador+dia; foto/emoji se sem imagem, preço, nº reviews, rating, localização; não é link |
| 7 | Indicador de scroll | seta animada |
| 8 | 4 funcionalidades | descobrir, listas, avaliar, roleta (texto, sem links) |
| 9 | Perfil de paladar | 6 chips multi-seleção (estado local, sem persistência) + mensagem por nº escolhido |
| 10 | Testemunhos | 3 inventados (a remover: regra «sem dados inventados») |
| 11 | FAQ | 6 perguntas em `<details>` |
| 12 | CTA final | «Criar Conta Gratuita» → `/auth/signup`, «Grátis para sempre · Sem cartão · Começa em segundos» |
| 13 | Estados | stats a carregar («...»); API falha → fica «...» e sem cartão; `prefers-reduced-motion` só parcial |

## Fluxo
- Chega de: URL direta, logo da Navbar, sair (`signOut` → `/`), tab «Home».
- Segue para: `/auth/signup` (CTAs 4 e 12), `/restaurants` (CTA 4 e Navbar), `/map`, `/lists`, `/roulette` e `/auth/signin` (Navbar). Utilizador autenticado também vê a "/" (sem redirect).

## Estado visual atual (para a auditoria)
Fundo #050505 com 2 orbes âmbar e grain; hero split com typewriter; bento de 4 cartões iguais com ícones lucide coloridos (verde/azul/roxo fora da paleta); chips com emoji; testemunhos genéricos; muitos efeitos (parallax, grain, mesh blur, barra de scroll).

---

# Fluxo e inventário: `/` (home)

Fonte: `app/page.js` (352 linhas), `components/landing/*`, `Navbar.tsx`, `app/api/home/stats/route.ts` (lido a 2026-10-23).

## Funcionalidades
| # | Funcionalidade | Detalhe |
|---|---|---|
| 1 | Título da página | «FoodLister - Início» (`usePageTitle`) |
| 2 | Barra de progresso de scroll | linha âmbar 2px no topo (`useSpring`) |
| 3 | Navbar | logo→`/`, Restaurantes/Mapa/Listas, pesquisa global (⌘K), idioma, Entrar (anónimo) ou criar/roleta/notificações/menu de utilizador (autenticado); tab bar fixa em mobile (Home, Restaurantes, Mapa, Pesquisa, Roleta, Listas, Perfil) |
| 4 | Hero | eyebrow «FoodLister Journal», título com typewriter, parágrafo, 2 CTAs: `/auth/signup` «Começar Jornada» e `/restaurants` «Explorar Restaurantes» |
| 5 | Stats | restaurantes, utilizadores (arredondados por `formatCount`), rating médio; «...» enquanto carrega; sem estado de erro (falha silenciosa) |
| 6 | Cartão de restaurante | só `lg+`; um dos `topRestaurants` escolhido por semente utilizador+dia; foto/emoji se sem imagem, preço, nº reviews, rating, localização; não é link |
| 7 | Indicador de scroll | seta animada |
| 8 | 4 funcionalidades | descobrir, listas, avaliar, roleta (texto, sem links) |
| 9 | Perfil de paladar | 6 chips multi-seleção (estado local, sem persistência) + mensagem por nº escolhido |
| 10 | Testemunhos | 3 inventados (a remover: regra «sem dados inventados») |
| 11 | FAQ | 6 perguntas em `<details>` |
| 12 | CTA final | «Criar Conta Gratuita» → `/auth/signup`, «Grátis para sempre · Sem cartão · Começa em segundos» |
| 13 | Estados | stats a carregar («...»); API falha → fica «...» e sem cartão; `prefers-reduced-motion` só parcial |

## Fluxo
- Chega de: URL direta, logo da Navbar, sair (`signOut` → `/`), tab «Home».
- Segue para: `/auth/signup` (CTAs 4 e 12), `/restaurants` (CTA 4 e Navbar), `/map`, `/lists`, `/roulette` e `/auth/signin` (Navbar). Utilizador autenticado também vê a "/" (sem redirect).

## Estado visual atual (para a auditoria)
Fundo #050505 com 2 orbes âmbar e grain; hero split com typewriter; bento de 4 cartões iguais com ícones lucide coloridos (verde/azul/roxo fora da paleta); chips com emoji; testemunhos genéricos; muitos efeitos (parallax, grain, mesh blur, barra de scroll).

---

# Fluxo e inventário: /restaurants

## Fluxo
- Entrada: navbar («Restaurantes»), pesquisa (`?search=`), links da home. Tarefas: descobrir, filtrar, ordenar, procurar perto, abrir restaurante, criar (FAB, com sessão).
- Saída: `/restaurants/[id]`, perfil do criador, `/restaurants/new`.
- Paridade por direção: `restaurants/PARIDADE.md`. Navbar fora do âmbito (sem mudanças de acessos).

---

# Fluxo e inventário: /restaurants/[id]

Inventário completo (30 linhas) e destino de cada funcionalidade nas direções A e B: `restaurante-detalhe/PARIDADE.md`.

## Fluxo
- Entrada: cartão em `/restaurants`, mapa, listas (`/lists/...`), pesquisa global, notificações (`?review=<id>`), partilha por link.
- Tarefas: ver fotos/info, contactar (ligar, site, menu, mapa), avaliar, agendar, guardar numa lista, partilhar, denunciar; dono/admin: editar; admin: eliminar.
- Saída: `/restaurants` (não encontrado), `/users/<código>` (criador, autores), `/lists/<slug>`, `/restaurants/<id>/edit`, Google Maps, `tel:`, menu e site externos.
- Navbar fora do âmbito (sem mudanças de acessos).

---

# Fluxo e inventário: `/lists`

Fonte: `app/lists/page.js` (198 linhas), `ListCard.tsx`, `ListCardCover.tsx`, `app/api/lists/route.ts` (lido a 2026-10-25). Paridade nas direções A e B: `listas/PARIDADE.md`.

## Fluxo
- Entrada: Navbar «Listas» e tab bar, home (`/`), pesquisa global (`?search=`), «guardar numa lista» no detalhe de restaurante.
- Tarefas: ver listas, filtrar por tag, pesquisar, criar lista, abrir lista, ir ao perfil do criador; admin: eliminar.
- Saída: `/lists/<slug>`, `/users/<código>`, criar lista (botão/FAB), `/lists` (limpar pesquisa).
- Navbar e tab bar fora do âmbito (sem mudanças de acessos).
---

# Fluxo e inventário: /lists/[id]

Fonte: `app/lists/[id]/page.tsx` (458 linhas) e `components/ui/lists/*` (lidos a 2026-10-25). Ramo: `feat/foodlister-reformular-lista-detalhe-mockups` (de `dev`).

## Funcionalidades
| # | Funcionalidade | Detalhe / permissão |
|---|---|---|
| 1 | Voltar às listas | link para `/lists` |
| 2 | Capa (ListCover) | nome, descrição, badge Pública/Privada, nº restaurantes, «Criada por» (CreatorLink) |
| 3 | Partilhar | `useShare` (título, descrição, `/lists/[id]`) |
| 4 | Roleta | abre `RestaurantRoulette` (modal) com todos os restaurantes |
| 5 | Editar | `/lists/[id]/edit`, owner/editor |
| 6 | Duplicar | POST `/api/lists/[id]` «(Copia)», owner; redireciona para a cópia |
| 7 | Eliminar | confirm + DELETE, owner; volta a `/lists` |
| 8 | Gosto + Denunciar | `LikeButton`, `ReportButton` (lista) |
| 9 | Meta bar | nº restaurantes, rating médio, preço médio, locais únicos, data de criação |
| 10 | Aplicar filtros da lista | só se `list.filters`; consulta Supabase e substitui os restaurantes |
| 11 | Estatísticas | `ListStatistics`, só com ≥1 restaurante |
| 12 | Filtros avançados | `RestaurantFilters` sobre os restaurantes da lista |
| 13 | Perto de mim | `NearbyBar`: toggle, raio (km), loading, erro, erro de localização, contador «N a X km» |
| 14 | Grelha de restaurantes | filtro por cozinha (chips), remover restaurante (confirm + DELETE, owner/editor), vazio «Não há restaurantes nesta lista» |
| 16 | Colaboradores | `ListCollaborators`, só owner |
| 17 | Comentários | `ListComments`, só lista pública; destaque via `?comment=<id>` |
| 18 | Atividade | `ListActivityFeed` (sempre) |
| 19 | Estados | loading (skeleton capa+meta+6 cartões), lista não encontrada (link para `/lists`), `ErrorBoundary` |
| 20 | Título | «{nome} - FoodLister» |

## Fluxo
- Chega de: `/lists`, partilha por link, notificações (`?comment=`), duplicar.
- Segue para: `/lists/[id]/edit`, `/lists` (voltar, eliminar), `/lists/[novo-id]` (duplicar), restaurante (cartão da grelha), perfil do criador.

---

# Fluxo e inventário: /map

Fonte: `app/map/page.tsx` (339 l), `components/ui/RestaurantMap/RestaurantMap.tsx` (275 l), `components/ui/Nearby/NearbyBar.tsx` (60 l), hooks `useAllRestaurants`, `useNearbyRestaurants` (lido a 2026-10-25).

## Funcionalidades
| # | Funcionalidade | Detalhe |
|---|---|---|
| 1 | Mapa Leaflet OSM | centro [39.4,-8.3] zoom 10; `FitToMarkers` enquadra tudo na abertura (padding 48, maxZoom 15); scroll zoom |
| 2 | Pins por restaurante | pin âmbar garfo; ativo = pin estrela maior; só coords válidas; clusters (`MarkerClusterGroup`) |
| 3 | Hover no pin | troca para pin ativo e abre popup (se nada selecionado) |
| 4 | Click no pin / item da lista | `selectedId`; `FlyToMarker` zoom 16; popup programático |
| 5 | Popup | nome, estrelas+rating, localização, link «Explorar» para `/restaurants/{slug\|id}` |
| 6 | Fechar popup | desseleciona e `ZoomOutOnClose` recua 2 níveis (mín. 10) |
| 7 | Controlos mapa | zoom +/- (44px), reset zoom (flyTo zoom 10) |
| 8 | Pesquisa | nome ou localização, botão limpar ✕ |
| 9 | Perto de mim | toggle pede geolocalização; seletor de raio 2/5/10/25/50/100 km; mapa recentra (`FlyToFocus`, zoom por raio); pin azul da posição do utilizador; mostra só resultados no raio |
| 10 | Estados do Perto de mim | «A localizar…», erro de localização, erro de pesquisa, «Sem resultados Perto de..» |
| 11 | Lista lateral (desktop ≥lg) | título «Restaurantes no Mapa» + contagem; item: ícone, nome, localização («Sem localização»), ★ rating; item ativo destacado |
| 12 | Aviso sem coordenadas | «N restaurante(s) sem coordenadas — ver lista completa» → `/restaurants/no-coords` (só na lista desktop) |
| 13 | Mobile: botão «Lista (N)» / «Esconder lista» | overlay com NearbyBar, pesquisa e até 30 itens (nome — localização); selecionar fecha overlay |
| 14 | Estados da página | loading (skeleton lista + skeleton mapa + loader do mapa com ToviLoader), erro («Erro: …», «Erro ao carregar mapa: …»), vazio («Nenhum restaurante com coordenadas para mostrar.», «Nenhum resultado.») |
| 15 | Navbar + barra inferior mobile | entrada «Mapa» ativa em `/map`; `pb-[88px]` reserva a barra |
| 16 | Título | «Mapa - FoodLister» |

## Lacunas atuais (a auditar)
Lista mobile sem rating, sem aviso de sem-coordenadas e cortada a 30; sem filtros além de texto e raio; erros sem ação de repetir; textos de popup com classes `className` em string HTML (bug cosmético no popup programático); ícones lucide (Filter, Search, MapPin, X) a substituir pelo SP `foodlister-icones-custom-substituir-lucide`.

## Fluxo
- Chega de: Navbar/barra inferior («Mapa»), links «ver no mapa» em `restaurants/[id]` (HeroSection) e importação Google Maps.
- Segue para: `/restaurants/{slug|id}` (Explorar no popup), `/restaurants/no-coords` (aviso).

---

# Fluxo e inventário: `/users/settings` (definições)

Fonte: `app/users/settings/page.tsx` (517 linhas), `app/users/settings/notifications/page.tsx`, `hooks/data/useSettings.ts`, `Navbar.tsx` (lido a 2026-10-26).

## Funcionalidades
| # | Funcionalidade | Detalhe |
|---|---|---|
| 1 | Título da página | «Definições - FoodLister» (`usePageTitle`); h1 «Configurações» + subtítulo |
| 2 | Guarda de auth | sem sessão redireciona para `/auth/signin` |
| 3 | Separadores | Perfil, Privacidade, Estatísticas (`role=tablist`, 44px, estado só local, sem URL) |
| 4 | Foto de perfil | preview ou ícone; upload `image/*` (JPG/PNG/GIF, max 5MB) grava logo (`uploadImage` + `saveProfile`), toast sucesso/erro |
| 5 | Nome de exibição | obrigatório, erro inline `display_name` |
| 6 | Email | só leitura, nota «não pode ser alterado» |
| 7 | Telefone | `tel`, opcional |
| 8 | Localização | texto, opcional |
| 9 | Website | `url`, valida com `new URL`, erro inline |
| 10 | Bio | textarea, máx. 500, contador, erro inline |
| 11 | Privacidade | opção Público / Privado; clique grava logo (`handlePrivacyToggle`), toast |
| 12 | Ver perfil público | link para `/users/{userIdCode}` (só se existir) |
| 13 | Estatísticas | reviews, listas, restaurantes adicionados (0 por defeito); `joinedDate` existe nos dados mas não é mostrado |
| 14 | Guardar | submit; valida, spinner e campos desativados; sucesso abre modal «Perfil Atualizado!» e vai para `/restaurants` após 2,5 s |
| 15 | Cancelar | `router.back()` |
| 16 | Barra de ações | fixa acima da tab bar em mobile, estática em `md+` |
| 17 | Erro geral | `error` do hook: ecrã com «Tentar Novamente» (`refreshProfile`) |
| 18 | Perfil não encontrado | ecrã com «Tentar Novamente» |
| 19 | Loading | `ToviLoader` + «Carregando perfil...» |
| 20 | ScrollToTop + Navbar | mantêm-se |
| 21 | Preferências de notificações | subpágina `/users/settings/notifications` (8 interruptores: email, push, resumo semanal, convites, colaboradores, atividade, sistema; nota sobre permissões push). **Não há link para ela na página de definições**: só chega de `/subscribe/success` |
| 22 | i18n | textos via `t()` |

## Achados (a decidir com o BMS)
- Notificações sem entrada na UI de definições (#21): propor ligação visível; muda o fluxo.
- Bug: `publicProfile: p?.publicProfile || true` em `handleSubmit` força sempre `true` (privado volta a público ao guardar). Corrigir na implementação, contrato de API inalterado.
- Guardar redireciona para `/restaurants` em vez de ficar nas definições.
- Cores fora da paleta nas estatísticas (azul/verde), vermelho/verde na privacidade.

## Fluxo
- Chega de: menu de utilizador da `Navbar` (linha 231), `ProfileStickyNavbar` (push), cabeçalho do perfil próprio `UserProfileHeader` (botão), `/subscribe/success` (só para notificações).
- Segue para: `/restaurants` (guardar), página anterior (cancelar), `/users/{userIdCode}` (ver perfil), `/users/settings/notifications`, `/auth/signin` (sem sessão).

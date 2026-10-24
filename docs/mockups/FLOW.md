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

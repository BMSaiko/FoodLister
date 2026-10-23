# Paridade `/` (home): funcionalidades atuais vs mockups

Skills aplicadas: taste-skill, soft-skill, ui-ux-pro-max, redesign-skill, artifact-design. Dados reais: Restaurante Teste 1-5 (fotos `assets/r1-r5`), stats 10 / 9 / 4.2. Estados na barra do fundo.

| # | Funcionalidade atual | A Diário | B Roleta |
|---|---|---|---|
| 1 | Título «FoodLister - Início» (`usePageTitle`) | `<title>` | `<title>` |
| 2 | Barra de progresso de scroll | mantida (2px âmbar) | idem |
| 3 | Navbar completa (logo, links, pesquisa ⌘K, idioma, Entrar / menu autenticado, tab bar mobile) | inalterada (estado «Autenticado» mostra os ícones) | idem |
| 4 | Hero com 2 CTAs (`/auth/signup`, `/restaurants`) | H1 + subtítulo + «Criar conta» + link «Explorar restaurantes» | H1 + subtítulo + roleta + «Criar conta»; «Explorar» no fim (CTA final autenticado) e na Navbar |
| 5 | Stats (restaurantes, utilizadores, rating) + «...» ao carregar | faixa sob o hero; skeleton ao carregar; ocultas se API falha (sem «...» eterno) | idem |
| 6 | Cartão de restaurante (foto, nome; só `lg+`) | mosaico de 5 fotos reais, também em mobile | baralho de 5 cartas, também em mobile |
| 7 | Indicador de scroll | removido (hero de altura natural; scroll óbvio) | idem |
| 8 | 4 funcionalidades (descobrir, listas, avaliar, roleta) | lista editorial com ícones Phosphor-style | grelha de 4 colunas |
| 9 | Perfil de paladar (6 chips multi-seleção + mensagem) | mantido, chips sem emoji | idem |
| 10 | Testemunhos inventados | removidos (regra «sem dados inventados») | idem |
| 11 | FAQ (6 perguntas, `<details>`) | mantida | idem |
| 12 | CTA final «Criar Conta Gratuita» + «Grátis para sempre…» | mantido (Tovi a celebrar); autenticado: «Explorar restaurantes» | idem |
| 13 | Estados: carregar, API falha, autenticado, texto longo, sem foto, sem restaurantes | todos na barra | idem (+ roleta sem restaurantes) |
| 14 | `prefers-reduced-motion` | respeitado (CSS) | idem |

Novo (nada removido): roleta interativa (B), estado vazio com «Sugere o primeiro restaurante», CTA «Explorar» também para anónimos.
Em aberto para o BMS: autenticado deve ser redirecionado da home? (hoje não; mockups assumem que não). Cartão de restaurante real mostra preço/rating/localização vindos da API (não inventados aqui).

## Decisões 2026-10-23 (BMS)
- Navbar: «+», notificações, perfil (e roleta) só autenticado; «Entrar» só anónimo.
- Roleta da home: top 10 restaurantes por melhor avaliação (`rating` desc). Implementação: `/api/home/stats` passa a devolver `topRestaurants` ordenado por rating (hoje ordena por review_count/composto); mockup mostra 5 dos dados de teste.

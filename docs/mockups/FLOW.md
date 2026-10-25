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

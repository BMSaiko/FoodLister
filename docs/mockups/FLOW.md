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

# Fluxo e inventário: /restaurants

## Fluxo
- Entrada: navbar («Restaurantes»), pesquisa (`?search=`), links da home. Tarefas: descobrir, filtrar, ordenar, procurar perto, abrir restaurante, criar (FAB, com sessão).
- Saída: `/restaurants/[id]`, perfil do criador, `/restaurants/new`.
- Paridade por direção: `restaurants/PARIDADE.md`. Navbar fora do âmbito (sem mudanças de acessos).


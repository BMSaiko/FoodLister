# Paridade signin: 12 funcionalidades (FLOW.md) vs mockups

| # | Funcionalidade | A centrado | B split |
|---|---|---|---|
| 1 | Email | sim | sim |
| 2 | Password | sim | sim |
| 3 | Mostrar/ocultar | sim (aria-pressed) | sim |
| 4 | Esqueceu a password | sim | sim |
| 5 | Entrar + loading | sim (spinner, campos desativados) | sim |
| 6 | Criar conta | sim | sim |
| 7 | Aviso check-email | banner inline | banner inline |
| 8 | Erro login | banner + campos a vermelho | idem |
| 9 | Erro inesperado | banner | banner |
| 10 | Fallback Suspense | fora do âmbito (ToviLoader existente) | idem |
| 11 | Título da página | `<title>` | `<title>` |
| 12 | i18n | textos PT, mapeáveis para `t()` | idem |

Mudanças face ao atual: labels visíveis (antes `sr-only`), erros inline (antes só toast), CTA âmbar com texto escuro, logótipo em vez de seta genérica, sem orbes nem duplo-bisel.
Estados: Normal, Check-email, Erro login, Erro inesperado, Loading, Campos longos (barra no fundo da página). Mobile por media query (A ≤480px; B ≤820px esconde o painel de marca).

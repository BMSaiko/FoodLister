# Paridade signup: funcionalidades (page.js, 154 linhas) vs mockups

| # | Funcionalidade atual | A centrado | B split |
|---|---|---|---|
| 1 | Email (`autoComplete=email`, required) | sim, label visível | sim |
| 2 | Password (`new-password`, mín. 6) | sim + medidor de força | idem |
| 3 | Mostrar/ocultar (`aria-pressed`, só na password) | sim | idem |
| 4 | Confirmar password (`aria-invalid`, `aria-describedby`) | sim | idem |
| 5 | Erro «senhas não coincidem» | inline (campo a vermelho, `role=alert`) | idem |
| 6 | Erro «mínimo 6 caracteres» | inline | idem |
| 7 | Erro do Supabase «Erro ao criar conta: …» | banner (antes toast) | banner |
| 8 | Erro inesperado | banner | banner |
| 9 | Criar Conta + loading (`ToviSpinner`, campos desativados) | sim | sim |
| 10 | Redirect `/auth/signin?message=check-email` | inalterado | inalterado |
| 11 | Link «Faça login» -> `/auth/signin` | sim | sim |
| 12 | Fallback Suspense `ToviLoader` | fora do âmbito (existente) | idem |
| 13 | Título «Criar conta - FoodLister» | `<title>` | `<title>` |
| 14 | i18n `t()` | textos PT mapeáveis | idem |

Novo (nada removido): medidor de força, labels visíveis, Tovi por estado (A), painel de marca (B, escondido ≤820px). Estados na barra do fundo. Coerente com signin (mesmos tokens, `shared.css`, assets).

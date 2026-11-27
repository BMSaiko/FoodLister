# Paridade — /notifications

Estados via `?state=default|loading|empty|unread-empty|error` e `?filter=`. Dados: tipos/cores de `types/notification.ts`; nomes da BD de dev.

| # | Funcionalidade atual | A · Cronologia | B · Caixa de entrada |
|---|---|---|---|
| 1 | Título «Notificações» | H1 | H1 |
| 2 | Voltar a `/restaurants` | Link no topo | Idem |
| 3 | Contagem «N não lidas» / «Todas lidas» | Sob o título | Idem |
| 4 | «Marcar todas» (só com não lidas) | Botão no cabeçalho | Idem |
| 5 | Filtros com contagens | Chips (scroll horizontal) | Barra lateral (desktop), chips (mobile) |
| 6 | Agrupar Hoje/Ontem/data | Trilho vertical por dia | Faixas na caixa |
| 7 | Item: ícone de tipo, título, mensagem 2 linhas, tempo, etiqueta, ponto não lida, acento | Cartão | Linha densa |
| 8 | Clique = marcar lida + navegar `link`; Enter/Espaço | Cartão inteiro (`role=link`) | Linha inteira |
| 9 | Marcar lida / apagar | Menu «⋯» sempre visível (decisão 2) | Idem |
| 10 | Skeleton (3) | `?state=loading` | Idem |
| 11 | Vazio com mascote + CTA `/restaurants`; variante «não lidas» | `?state=empty`, `unread-empty` | Idem |
| 12 | **Erro (novo)** com «Tentar de novo» | `?state=error` | Idem |
| 13 | **Atalho para preferências (novo, decisão 3; FLOW #21)** | Ícone de engrenagem no cabeçalho | Engrenagem + ligação na lateral |
| 14 | Filtros corrigidos (decisão 1) | Refeições, Social, Listas, Sistema | Idem |

Nota: `review_created` (antigo filtro «Reviews») fica em **Social**; a confirmar pelo BMS.

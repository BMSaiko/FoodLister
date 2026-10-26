# Paridade /users/settings: 22 funcionalidades (FLOW.md) vs mockups

Dados: não há seed de perfis (`supabase/seed` só tem filtros); usados dados representativos (Ana Ferreira, Porto) e casos extremos (campos longos, perfil novo com stats a 0).

| # | Funcionalidade | A separadores | B página única |
|---|---|---|---|
| 1 | Título + subtítulo | h1 «Definições» + subtítulo | h1 + email e membro desde |
| 2 | Guarda de auth | comportamento (sem UI) | idem |
| 3 | Separadores Perfil/Privacidade/Estatísticas | lista lateral (chips em mobile), `role=tablist` | secções empilhadas + chips de âncora |
| 4 | Foto de perfil | cartão com avatar + «Alterar foto» (guarda logo) | botão «Alterar foto», avatar no topo |
| 5 | Nome (obrigatório) | sim, erro inline | idem |
| 6 | Email só leitura | sim | sim |
| 7 | Telefone | sim | sim |
| 8 | Localização | sim | sim |
| 9 | Website (valida URL) | sim, erro inline | idem |
| 10 | Bio 500 + contador | sim | sim |
| 11 | Privacidade público/privado (guarda logo) | radiogroup, painel próprio | radiogroup lado a lado |
| 12 | Ver perfil público | linha-link (só se público/existe código) | idem |
| 13 | Estatísticas (+ joinedDate, hoje oculto) | painel com 3 números + «membro desde» | faixa de 3 números no topo |
| 14 | Guardar + loading + sucesso | barra fixa; estado «A guardar»; toast «Perfil atualizado» (propõe ficar na página, não ir a /restaurants) | idem |
| 15 | Cancelar | `router.back()` | idem |
| 16 | Barra de ações fixa acima da tab bar | sim | sim |
| 17 | Erro geral | ecrã Tovi + «Tentar novamente» | idem |
| 18 | Perfil não encontrado | mesmo ecrã | idem |
| 19 | Loading | barra de progresso + conteúdo atenuado (propõe skeleton) | idem |
| 20 | ScrollToTop + Navbar | mantêm-se | mantêm-se |
| 21 | Notificações | entrada «Notificações» na navegação (**novo acesso**) | secção com link |
| 22 | i18n | textos PT mapeáveis para `t()` | idem |

## Decisões a levar ao BMS
1. Notificações passam a ter acesso nas definições (hoje só via `/subscribe/success`).
2. Guardar deixa de redirecionar para `/restaurants` (toast e fica); remove o modal «Perfil Atualizado!».
3. Bug `publicProfile || true` corrigido na implementação (privado deixa de voltar a público ao guardar).
4. Cores azul/verde/vermelho das estatísticas e privacidade passam para a paleta âmbar.

Estados (painel no canto, em mobile junto ao fundo): Normal, Perfil novo, Erro validação, A guardar, Guardado, Privado, Campos longos, Loading, Erro ao carregar. Mobile por media query (≤720px).

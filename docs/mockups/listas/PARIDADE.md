# Paridade funcional: `/lists` (2 direções)

Fonte: `app/lists/page.js` (198 linhas), `ListCard.tsx`, `ListCardCover.tsx`, `app/api/lists/route.ts` (lidos a 2026-10-25). Dados dos mockups: BD local de dev (seed `ana.teste`).
Skills aplicadas nesta ronda: `taste-skill`, `soft-skill`, `redesign-skill`, `ui-ux-pro-max`.

Estados: `?state=default|loading|empty|search|noresults|error|admin` em ambos os ficheiros.

| # | Funcionalidade atual | A · Mosaico (`a-mosaico.html`) | B · Estante (`b-estante.html`) |
|---|---|---|---|
| 1 | Título + subtítulo | Cabeçalho grande à esquerda | Cabeçalho na coluna principal |
| 2 | Modo pesquisa (`?search=`): «Resultados para…» + contagem | Mesmo cabeçalho (estado `search`) | Idem |
| 3 | «Nova Lista» (desktop) | Botão no cabeçalho (`hide-m`) | Idem |
| 4 | FAB «Criar lista» (mobile) | FAB | FAB |
| 5 | Filtro por tags («Todas» + tags com contagem) | Chips em linha com scroll horizontal | Coluna lateral no desktop, chips no mobile |
| 6 | Grelha de listas | Grelha 1/2/3 colunas, capa 4:3 | Linhas com capa à esquerda |
| 7 | Skeleton de carregamento | `?state=loading` | Idem |
| 8 | Capa (0-4 fotos reais, gradiente + inicial sem fotos, «+N») | Mosaico 4:3 | Mosaico 4:3 / 16:9 mobile |
| 9 | Nome (link para a lista) | Título 2 linhas | Título link |
| 10 | Pública / Privada | Texto + ícone discreto (privada em âmbar) | Idem |
| 11 | Descrição | 2 linhas | 2 linhas |
| 12 | Tags (≤3 + «+N») | Sob a descrição | Linha inferior |
| 13 | Nº de restaurantes | Topo do cartão | Topo da linha |
| 14 | Likes | Rodapé | Linha de metadados |
| 15 | Data de criação | Rodapé | Linha de metadados |
| 16 | Criador → `/users/<código>` | Rodapé | Linha de metadados |
| 17 | Hover preview (nomes dos restaurantes) | Sobreposição na capa ao hover/foco (desktop) | Linha extra ao hover (desktop) |
| 18 | Eliminar (só admin) | Botão no cartão (`?state=admin`) | Botão na linha |
| 19 | Estado vazio «Nenhuma lista criada» + CTA | `?state=empty` | Idem |
| 20 | Sem resultados + «Limpar pesquisa» | `?state=noresults` | Idem |
| 21 | Tab bar mobile | Referência | Referência |
| 22 | **Estado de erro (novo)**: hoje a app mostra lista vazia em erro | `?state=error` com «Tentar de novo» | Idem |

Acrescento: #22. Nenhuma funcionalidade sem lugar.

## Direção escolhida: C · Lateral (`c-lateral.html`, aprovada 2026-10-25)

Todas as 22 linhas acima têm lugar em C (mesma lista de estados, `?state=...`). Extras de C:
- Sidebar sticky de etiquetas com pesquisa de etiqueta e contagens (chips no mobile).
- Ordenar: recentes / gostadas / restaurantes / nome.
- Gostar e partilhar no cartão (hover/foco); eliminar só admin.
- Capa 16/10 com 0-4 fotos; sem fotos, Tovi estável por nome.
- Estado de erro (#22) com «Tentar de novo».

Nenhuma funcionalidade sem lugar.

## Direção aprovada: C · Lateral (`c-lateral.html`, aprovada 2026-10-25)

Todas as linhas 1-22 acima mantêm-se em C (`?state=default|loading|empty|search|noresults|error|admin`). Extras de C:

| # | Funcionalidade | Onde fica em C |
|---|---|---|
| 23 | Filtro por etiqueta («Todas» + contagens) | Sidebar sticky (desktop); chips (mobile) |
| 24 | Pesquisa de etiqueta (novo) | Campo na sidebar |
| 25 | Ordenar: recentes / gostadas / restaurantes / nome (novo) | Sidebar |
| 26 | Gostar e partilhar (novo) | Ações no hover do cartão (sempre visíveis em toque) |
| 27 | Eliminar (admin) | Ação no hover (`?state=admin`) |
| 28 | Capa sem fotos | Tovi aleatório sobre tom frio, capa 16/10 |
| 29 | Erro com «Tentar de novo» | `?state=error` |

Implementação: `app/lists/page.js`, `ListCard.tsx`, `ListCardCover.tsx`. Provas dos mockups em `proofs/` (`c3-*`).

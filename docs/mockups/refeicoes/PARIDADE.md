# Paridade funcional: `/meals` (2 direções)

Fonte: `app/meals/page.tsx` (115 linhas), `app/api/meals/scheduled/route.ts`, `app/meals/[id]/page.tsx` (lidos a 2026-11-27).
Dados: restaurantes do seed de dev (`Restaurante Teste 1-5`); a BD de dev não tem refeições, por isso datas, horas e participantes são **exemplos** em `data.js`, com casos extremos (nome longo, sem imagem, sem hora, sem localização, sem data, 12 participantes).
Skills aplicadas: `ui-ux-pro-max`, `artifact-design` (as restantes skills de design do §0 do SP não estão disponíveis nesta sessão: ronda a rever).
Estados: `?state=default|loading|empty|noresults|error|auth`.

| # | Funcionalidade atual | A · Agenda (`a-agenda.html`) | B · Próxima mesa (`b-destaque.html`) |
|---|---|---|---|
| 1 | Título + subtítulo | Cabeçalho | Idem |
| 2 | Sem sessão: aviso de autenticação | `?state=auth` | Idem |
| 3 | Loading | `?state=loading` (skeletons) | Idem |
| 4 | Vazio: mascote, texto, CTA «Explorar Restaurantes» | `?state=empty` | Idem |
| 5 | Cartão → `/meals/[id]` | Linha inteira clicável | Hero e cartões clicáveis |
| 6 | Badge de data (mês + dia, «—» sem data) | Coluna de data (mês, dia, dia da semana) | Data em mono no cartão; hero com contagem |
| 7 | Nome do restaurante (fallbacks) | 2 linhas com corte | Idem |
| 8 | Hora, localização (omitida se igual ao nome), participantes (>0) | Linha de metadados | Idem |
| 9 | Seta de navegação | Seta à direita | Hero/cartão inteiro; passadas com seta |
| 10 | `type=all` (organizadas + participadas) | Filtro Todas/Organizo/Participo + etiqueta por refeição | Idem |
| 11 | Tab bar / navbar | Referência | Referência |
| 12 | **Novo:** estado de erro com «Tentar de novo» | `?state=error` | Idem |
| 13 | **Novo:** separação próximas / passadas / por agendar | Grupos por mês | Hero + «A seguir» + «Passadas» |
| 14 | **Novo:** tipo de refeição (Almoço/Jantar/Lanche) | Etiqueta | Etiqueta |

Sem funcionalidade sem lugar. Pendente: validar a paridade das ações de `/meals/[id]` (editar, eliminar, .ics, Google Calendar) quando essa página entrar no âmbito, e adicionar `/meals` ao `FLOW.md`.

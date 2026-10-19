# Mascote Tovi

Tovi é a cloche (conceito 7 da marca) com cara. Aparece onde a app espera, vazia ou falha: nunca como decoração solta.

## Personalidade
Curiosa, cozinheira, discreta. Fala pouco, espreita muito (a tampa levanta para mostrar a próxima descoberta). Nunca é infantil nem sarcástica.

## Paleta
Usa os tokens, não hex soltos: corpo `--primary`, brilho e estrela `--tovi-light` (`#fde68a`), olhos e boca `--tovi-ink` (`#1a1203`), prato `--tovi-plate` (claro no tema escuro, escuro no tema claro). Definidos em `app/globals.css`, bloco "Tovi".

## Emotes (`public/mascot/`)
| Ficheiro | Quando |
|---|---|
| `tovi-feliz.svg` | sucesso simples, boas-vindas |
| `tovi-a-pensar.svg` | pesquisa sem resultados, onboarding |
| `tovi-surpreendida.svg` | descoberta (tampa levantada, estrela) |
| `tovi-triste.svg` | erros 404/500 |
| `tovi-a-dormir.svg` | offline, sessão inativa |
| `tovi-a-celebrar.svg` | roleta, lista concluída, toast de sucesso |

## Loader
`components/loading/ToviLoader.tsx` (`size` sm|md|lg, `text`, `rotateMessages`). Ciclo de 2,6 s só em CSS; com `prefers-reduced-motion` fica parado com a tampa entreaberta; `sm` não mostra vapor nem estrela. `PageLoader` (variante `spinner`) já o usa.

## Onde usar
Loading, estados vazios, erros 404/500, onboarding, toasts de sucesso, roleta, OG image.

## Proibido
- Distorcer ou rodar fora das animações definidas.
- Pôr sobre fundo âmbar sem versão invertida (corpo `--ink`, prato `--primary`).
- Mais de um Tovi por ecrã.
- Mudar a cor do corpo para fora de `--primary`.

## Estado
Nome "Tovi": verificar disponibilidade como marca antes de o fixar em material público.

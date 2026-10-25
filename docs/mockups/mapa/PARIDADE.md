# Paridade funcional: /map (B · Mapa total, ronda de refinamento, 2026-10-25)

Direção escolhida pelo BMS: **B · Mapa total** (`b-mapa-total.html`; `a-painel.html` fica como alternativa descartada). Botões no topo alternam Desktop/Mobile e os estados. Dados: BD de dev (`data.js`), 6 com coordenadas + 4 «Restaurante Prova E6» sem coordenadas. O mockup usa mapa estilizado (pins nas coordenadas reais); a implementação mantém Leaflet.

Skills aplicadas: taste-skill, soft-skill, redesign-skill, ui-ux-pro-max, artifact-design. Ícones: `components/ui/icons/Ico.tsx` (fork, star, pin, search, plus, arrow) + propostos x, locate, chevron, minus.

Refinamentos aprovados nesta ronda: pins por estado + clusters, folha com 3 alturas, chip «N sem localização», atalhos e foco.

| # | Funcionalidade atual | Onde fica em B |
|---|---|---|
| 1 | Mapa OSM, enquadra tudo | mapa a toda a largura |
| 2 | Pins, clusters, pin ativo | pin ★ âmbar claro (4,5+), fork âmbar (avaliado), contorno (sem avaliações), ativo ampliado; **clusters** com contagem ao afastar; legenda no canto |
| 3 | Hover no pin abre popup | igual (implementação) |
| 4 | Click pin / item → zoom 16 + popup | igual; clicar num cluster aproxima |
| 5 | Popup nome, rating, localização, «Explorar» | igual + «Fechar» |
| 6 | Fechar popup recua 2 níveis | «Fechar», ⌖ ou `Esc` |
| 7 | Zoom +/−/reset | canto superior direito (aproximar/afastar ligados ao agrupamento) |
| 8 | Pesquisa + limpar | flutuante sobre o mapa; `/` foca a pesquisa |
| 9 | Perto de mim + raios | chip + chips de raio flutuantes |
| 10 | Estados de localização/erro | mensagem sobre o mapa (a ligar na implementação) |
| 11 | Lista com ★ e contagem | folha com 3 alturas (fechada/meia/cheia; clicar cicla, arrastar ajusta; desktop: cartão recolhível); setas ↑↓ navegam itens; contagem `aria-live` |
| 12 | Aviso sem coordenadas | chip «N sem localização» sempre visível (abre a folha cheia no aviso) + rodapé da lista |
| 13 | Mobile «Lista (N)» | a própria folha; **passa a mostrar rating e aviso, sem corte a 30** |
| 14 | Loading / erro / vazio | estados incluídos (erro ganha «Tentar novamente») |
| 15 | Navbar + barra inferior | inalterado |
| 16 | Título «Mapa - FoodLister» | inalterado |

Acessibilidade: `:focus-visible` âmbar, alvos ≥44 px, `aria-label` com rating em cada pin, `prefers-reduced-motion` desliga transições. Casos extremos: «sem avaliações» e lista vazia cobertos; texto longo com ellipsis; imagem em falta não existe nos dados reais.

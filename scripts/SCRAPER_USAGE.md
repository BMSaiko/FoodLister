# Scraper Google Maps — como usar

Script: `scripts/scrap-city-links.mjs`
Faz scrape de `google.com/maps/search` e grava os links `/maps/place/` dos restaurantes, prontos para o batch import da webapp (max 1000/batch (raised 2026-08-16, antes 150)).

## Pré-requisitos

- Node.js (usa-se `C:\nvm4w\nodejs\node.exe` no Lenovo).
- Playwright instalado no projecto (já é devDep). Browser Chromium instalado (`npx playwright install chromium` se faltar).

## Dados de entrada

| Ficheiro | Função |
|---|---|
| `cities.json` | Lista das **308 concelhos** de Portugal (unidade do loop). |
| `subzones.json` | Sub-zonas/freguesias por concelho (2.978 no total). Fundidas com dedup para ir além do feed da cidade. |

## Modos de utilização

### 1. Uma cidade (interactivo)
```bash
node scripts/scrap-city-links.mjs                    # menu com as 308 cidades
node scripts/scrap-city-links.mjs Lisboa             # directo pelo nome
node scripts/scrap-city-links.mjs "Lisboa" "Alfama,Belém,Campo de Ourique"
```
- Se a cidade estiver em `cities.json` e tiver sub-zonas, mostra um menu numerado; `0` = TODAS, `Enter` = só a cidade.
- Se a zona não estiver em `cities.json`, faz scrap normal sem sub-zonas.

### 2. Todas as cidades (batch)
```bash
node scripts/scrap-city-links.mjs --all                            # run completo (308 concelhos)
node scripts/scrap-city-links.mjs --all --limit 10                 # só os primeiros 10 (teste)
node scripts/scrap-city-links.mjs --all --resume                   # continuar onde parou
node scripts/scrap-city-links.mjs --all --resume --delay 1500      # pacing + resume
```

Flags do `--all`:

| Flag | Efeito |
|---|---|
| `--limit N` | Só os primeiros N concelhos. Bom para testes. |
| `--resume` | Salta concelhos cujo `output/<cidade>-mapas-links.json` já exista. Recomeça onde parou. |
| `--delay MS` | Pausa entre queries (default 1200). Aumentar contra detecção/bot do Google. |

## Output

- 1 ficheiro por cidade: `output/<cidade>-mapas-links.json` (array JSON de URLs).
- Nome normalizado: sem acentos, espaços→hífen. Ex.: "São João da Madeira" → `s-o-jo-o-da-madeira-mapas-links.json`.
- Mostra progresso e ETA por concelho: `[12/308] (4%) Cidade (n subzonas) ~ETA 4.2h`.

## O que fazer com os links

- Cole o conteúdo (array de URLs) no **batch import** da webapp → `POST /api/restaurants/batch` → dedup por `source_url`, max 50 por batch.
- **NÃO** usar para "Importar lista" do Google Maps — isso só aceita CSV (`Title,Latitude,Longitude,Address`, UTF-8).

## Dicas / pitfalls

- O feed de 1 query satura (~110-120 links). Para mais: sub-zonas (cada uma é um viewport novo). Está automatizado via `subzones.json`.
- Query simples `restaurantes em <zona>` — nunca acrescentar sufixo (`restaurantes em Alfama+Lisboa` dá 0 links).
- Se o count duma cidade parecer anormalmente baixo, re-corre (variação de timing do consentimento/scroll).
- Scrapper toca o Google milhares de vezes no `--all` — usa `--delay` ≥1200ms para não ser bloqueado; se bloquear, baixa o ritmo e recorre com `--resume`.
- `--resume` grava em `output/`; nomes de runs manuais antigos (ex.: `gaia`, `lissabon`) são re-scraped — normal e inofensivo.
---

## Scraper Scrapling — `scrap-maps-places.py` (Python, alternativa ao .mjs)

Mesma fonte de dados (`cities.json`, `subzones.json`), mesmos outputs (`output/<cidade>-mapas-links.json`), mesmas flags `--all / --resume / --limit / --delay`. Em vez de Playwright direto usa **Scrapling `StealthyFetcher`** (browser camoufox + `page_action` scroll-feed; contorna consent wall via cookie `SOCS`). Skills: `scrapling-browser-scraping`.

```bash
python scripts/scrap-maps-places.py "Vila do Conde"            # 1 cidade + sub-zonas auto
python scripts/scrap-maps-places.py "Vila do Conde" "Ribeira,Centro"  # sub-zonas manuais
python scripts/scrap-maps-places.py --all                      # 308 concelhos
python scripts/scrap-maps-places.py --all --resume --delay 1500
```

Requires the scrapling venv: `C:\Users\bruno\AppData\Local\hermes\vendors\scrapling\venv\Scripts\python.exe` (browsers já instalados com `scrapling.exe install`).

### Multi-país (documentação de suporte)

O padrão é geografia-agnóstico — só muda a fonte de topónimos e a frase da query:

| Input | Default | Para outro país |
|---|---|---|
| Cidades | `cities.json` (308 concelhos PT) | `data/<pais>.json` (lista) + `--cities` |
| Sub-zonas | `subzones.json` | `data/<pais>-subzones.json` + `--subzones` |
| Frase query | `MAP_LANGS["pt"]` | `--lang en\|fr\|es` (ou adicionar em `MAP_LANGS`) |
| Output | `output/` | `--out <dir>` |

Ex.: França → criar `data/france.json` (`["Paris","Lyon",...]`) + `--cities data/france.json --lang fr`; para arrondissements/metrópoles a sub-zona é `Metropolis` → `data/france-subzones.json` com chaves minusculas. Cada cena = 1 nova query `restaurants à <x>` + scroll-feed até saturar. **Não precisa tocar em código** — os objetos já estão parametrizados.

### Pitfall conhecido

- Sub-zonas isoladas podem dar `0 links` num dado run (variação de timing/scroll do consent). Re-corre (`--resume` já salta o que estiver feito). Documentado no `.mjs`, aplica-se igual.
- URLs de saída diferem em formato entre scrapers — dedup por **feature-ID `ChIJ...`/`/g/...`** (não string crua) ao importar, para não duplicar restaurantes com URL de shape diferente.

## Ligações rápidas

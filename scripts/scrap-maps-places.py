#!/usr/bin/env python3
# scripts/scrap-maps-places.py
# Scraper Google Maps con Scrapling (StealthyFetcher) -> output/<city>-mapas-links.json
# Drop-in paralelo a scrap-city-links.mjs: mesma font de dados (cities.json/subzones.json),
# mesmos ficheiros output, mesmas flags --all/--resume/--limit/--delay. Uso a lib scrapling
# (browser real + page_action scroll) em vez de Playwright direto.
#
# Uso:
#   python scripts/scrap-maps-places.py [cidade] ["subzona1,subzona2"] [--lang pt]
#   python scripts/scrap-maps-places.py --all [--limit N] [--resume] [--delay MS] [--lang pt]
#
# --lang: frase-filtro da query -> --lang pt  = "restaurantes em <x>"
#                              -> --lang en  = "restaurants in <x>"
#                              -> --lang fr  = "restaurants à <x>"  (docs: adicionar no MAP_LANGS)
# Outros paises: criar ou data/<country>.json (lista cidades) + data/<country>-subzones.json
# (dict chave-minuscula -> subzonas), e apontar --cities/--subzones/--lang. O padrão é agnóstico
# de geografia: so muda a fonte de toponimos e a frase da query.
import argparse, json, re, sys, time
from pathlib import Path

from scrapling.fetchers import StealthyFetcher

DIR = Path(__file__).resolve().parent
OUT_DEFAULT = DIR / "output"

# Frases de query por lingua/base. <x> e substituido pelo toponimo.
MAP_LANGS = {
    "pt": "restaurantes em {x}",
    "en": "restaurants in {x}",
    "fr": "restaurants à {x}",
    "es": "restaurantes en {x}",
}
SOCS = {"name": "SOCS", "value": "CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiAo_CmBg",
        "domain": ".google.com", "path": "/"}


def safe_name(name: str) -> str:
    norm = name.encode("ascii", "ignore").decode()  # tira acentos
    return re.sub(r"[^a-z0-9]+", "-", norm.lower()).strip("-")


def scrape_query(session, phrase: str, collected: set, timeout=240000):
    """Uma query, scroll no feed ate saturar. Propoe os links p/ fora da janela interna do scrapling."""
    url = "https://www.google.com/maps/search/" + re.sub(r"\s+", "+", phrase.strip())

    local = set()

    def scroll_feed(page):
        stable = 0
        for i in range(60):
            hrefs = page.eval_on_selector_all(
                'a[href*="/maps/place/"]',
                "els => els.map(e => e.getAttribute('href'))")
            cur = {h.split("?")[0] for h in hrefs if h}
            new = cur - local
            local.update(cur)
            stable = stable + 1 if not new else 0
            if stable >= 8:
                break
            page.evaluate("""() => { const f=document.querySelector('div[role="feed"]');
                               if (f) f.scrollTop = f.scrollHeight; }""")
            page.wait_for_timeout(1500)

    # reabre a sessao por query: page_action roda em page viva, e o Response nao expoe pagina.
    page = StealthyFetcher.fetch(url, headless=True, cookies=[SOCS],
                                  page_action=scroll_feed, timeout=timeout)
    collected.update(local)
    return len(local)


def scrape_city(session, city: str, subzones, lang="pt", delay_ms=1200):
    template = MAP_LANGS.get(lang, MAP_LANGS["pt"])
    queries = [template.format(x=city)] + [template.format(x=z) for z in (subzones or [])]
    all_links = set()
    for q in queries:
        try:
            n = scrape_query(session, q, all_links)
        except Exception as e:
            n = 0
            print(f"    ! query falhou ({e.__class__.__name__})")
        print(f"    {q} -> {n} links, total: {len(all_links)}")
        time.sleep(delay_ms / 1000)
    return sorted(all_links)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("city", nargs="?", help="cidade (ou subzonas no 2o arg posicional)")
    ap.add_argument("subarg", nargs="?", help="'sub1,sub2' seletor manual")
    ap.add_argument("--cities", default=str(DIR / "cities.json"))
    ap.add_argument("--subzones", default=str(DIR / "subzones.json"))
    ap.add_argument("--out", default=str(OUT_DEFAULT))
    ap.add_argument("--lang", default="pt", choices=list(MAP_LANGS))
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--delay", type=int, default=1200)
    args = ap.parse_args()

    cities = json.loads(Path(args.cities).read_text(encoding="utf-8"))
    known = json.loads(Path(args.subzones).read_text(encoding="utf-8"))
    out_dir = Path(args.out); out_dir.mkdir(parents=True, exist_ok=True)
    norm = lambda s: s.encode("ascii","ignore").decode().strip().lower()

    f = lambda c: out_dir / f"{safe_name(c)}-mapas-links.json"

    if args.all:
        to_run = cities[:args.limit] if args.limit else cities
        if args.resume:
            to_run = [c for c in to_run if not f(c).exists()]
        print(f"Batch {len(to_run)} cidades (lang={args.lang}, delay={args.delay}ms)")
        for i, city in enumerate(to_run, 1):
            subz = known.get(city.lower(), [])
            print(f"\n== [{i}/{len(to_run)}] {city} ({len(subz)} subzonas)")
            try:
                links = scrape_city(None, city, subz, args.lang, args.delay)
                (f(city)).write_text(json.dumps(links, ensure_ascii=False, indent=1), encoding="utf-8")
                print(f"    guardado: {len(links)} -> {f(city).name}")
            except Exception as e:
                print(f"    ERRO {city}: {e}")
        return

    city = args.city
    if not city:
        print("cidades:", ", ".join(cities) if isinstance(cities, list) else cities.keys())
        return
    subz = known.get(norm(city), [])
    if args.subarg:
        subz = [s.strip() for s in args.subarg.split(",") if s.strip()]
    links = scrape_city(None, city, subz, args.lang, args.delay)
    out = f(city)
    out.write_text(json.dumps(links, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Total {len(links)} -> {out}")
    return sorted(links)


if __name__ == "__main__":
    main()

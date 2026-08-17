// scripts/scrap-city-links.mjs
// Scraper Google Maps -> JSON com links /maps/place/ dos restaurantes.
// Sub-zonas opcionais (bairros/freguesias) fundidas com dedup para ir alem do feed da cidade.
// Uso:
//   node scripts/scrap-city-links.mjs [cidade] ["bairro1,bairro2,..."]   <- interativo, 1 cidade
//   node scripts/scrap-city-links.mjs --all [--limit N] [--resume] [--delay MS]   <- todas as 308 cidades (batch)
//     --resume: salta concelhos cujo output ja existe (recomeca onde parou)
//     --delay MS: pausa entre queries (default 1200) p/ evitar detecao/bot do Google
// Dados: subzones.json (subzonas dos centros de alto volume) + cities.json (concelhos restantes).
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let DELAY_MS = 1200;

async function ask(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ans = await new Promise((res) => rl.question(q, res));
  rl.close();
  return ans.trim();
}

async function scrapeQuery(page, query) {
  const url = 'https://www.google.com/maps/search/' + encodeURIComponent(query);
  await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes('Aceitar tudo'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(4500);

  let last = -1, stable = 0;
  for (let i = 0; i < 80; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('a[href*="/maps/place/"]').length);
    if (n === last) { if (++stable >= 6) break; } else { last = n; stable = 0; }
    await page.evaluate(() => {
      const sc = document.querySelector('div[role="feed"]');
      if (sc) sc.scrollTop += 3000;
      else window.scrollBy(0, 3000);
    });
    await page.waitForTimeout(350);
  }

  return await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href*="/maps/place/"]').forEach((a) => {
      const h = a.getAttribute('href');
      if (h && !out.includes(h)) out.push(h);
    });
    return out;
  });
}

// carregar subzonas conhecidas (centros alto volume) + lista completa de cidades
const known = JSON.parse(readFileSync(join(__dirname, 'subzones.json'), 'utf-8'));

function safeName(name) {
  const norm = name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // tira acentos
  return norm.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function saveLinks(city, links) {
  const outDir = join(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${safeName(city)}-mapas-links.json`);
  writeFileSync(file, JSON.stringify(links, null, 2), 'utf-8');
  return file;
}

async function scrapeCity(page, city, subzones) {
  const all = new Set();
  const queries = [`restaurantes em ${city}`, ...(subzones || []).map((s) => `restaurantes em ${s}`)];
  for (const q of queries) {
    const links = await scrapeQuery(page, q);
    let novos = 0;
    links.forEach((l) => { if (!all.has(l)) { all.add(l); novos++; } });
    console.log(`  ${q} -> ${links.length} links, novos: ${novos}, total: ${all.size}`);
    await sleep(DELAY_MS); // pacing entre queries
  }
  const file = saveLinks(city, [...all]);
  console.log(`  ${city}: total ${all.size} restaurantes. Guardado: ${file}`);
}

async function main() {
  const args = process.argv.slice(2);

  // ---- modo batch: todas as cidades ----
  if (args[0] === '--all') {
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;
    const resume = args.includes('--resume');
    const delayIdx = args.indexOf('--delay');
    if (delayIdx >= 0) DELAY_MS = parseInt(args[delayIdx + 1], 10) || 0;
    const cities = JSON.parse(readFileSync(join(__dirname, 'cities.json'), 'utf-8'));
    let toRun = limit > 0 ? cities.slice(0, limit) : cities;

    if (resume) {
      const pending = toRun.filter((c) => !existsSync(join(__dirname, 'output', `${safeName(c)}-mapas-links.json`)));
      console.log(`Resume: ${toRun.length - pending.length} ja feitos, faltam ${pending.length}.`);
      toRun = pending;
    }

    console.log(`Batch: ${limit > 0 ? 'first ' + limit + ' de ' : ''}${cities.length} cidades (delay ${DELAY_MS}ms).`);

    if (toRun.length === 0) { console.log('Nada por fazer (resume).'); return; }

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      locale: 'pt-PT',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    });
    const page = await ctx.newPage();

    const t0 = Date.now();
    for (let i = 0; i < toRun.length; i++) {
      const city = toRun[i];
      const key = city.toLowerCase();
      const subzones = known[key] || [];
      const done = i + 1;
      const pct = (done / toRun.length * 100).toFixed(0);
      const elapsed = (Date.now() - t0) / 60000;
      const etaMin = toRun.length > done ? elapsed / done * (toRun.length - done) : 0;
      console.log(`\n=== [${done}/${toRun.length}] (${pct}%) ${city} (${subzones.length} subzonas) ~ETA ${(etaMin/60).toFixed(1)}h ===`);
      try {
        await scrapeCity(page, city, subzones);
      } catch (e) {
        console.error(`  ERRO ${city}: ${e.message}`);
      }
    }

    await browser.close();
    console.log(`\nBatch concluido: ${toRun.length} cidades.`);
    return;
  }

  // ---- modo interativo / single: 1 cidade ----
  const cities = JSON.parse(readFileSync(join(__dirname, 'cities.json'), 'utf-8'));
  const norm = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

  let city;
  if (args[0]) {
    city = args[0].trim();
  } else {
    // lista numerada das cidades para selecionar (1..308) ou escrever nome
    console.log(`Cidades disponiveis (${cities.length}):`);
    cities.forEach((c, i) => console.log(`  ${String(i + 1).padStart(3)}) ${c}`));
    const choice = (await ask('Escolhe nº ou nome da cidade: ')).trim();
    if (!choice) { console.error('Sem zona.'); process.exit(1); }
    const idx = parseInt(choice, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= cities.length) city = cities[idx - 1];
    else city = choice;
  }
  if (!city) { console.error('Sem zona.'); process.exit(1); }

  // procurar a cidade em cities.json (match sem acentos / case)
  const match = cities.find((c) => norm(c) === norm(city));
  let subzones = [];

  if (match) {
    // cidade reconhecida -> usamos o nome oficial (chave das subzonas em minusculas)
    const key = match.toLowerCase();
    const knownZones = known[key];
    console.log(`Cidade encontrada em cities.json: ${match} (de ${cities.length}).`);
    if (knownZones && knownZones.length) {
      console.log(`Sub-zonas associadas a ${match}:`);
      console.log('  0) TODAS');
      knownZones.forEach((z, i) => console.log(`  ${i + 1}) ${z}`));
      const pick = await ask('Escolhe (nºs separados por virgula, 0=todas, Enter=so a cidade): ');
      if (pick.trim() === '0') subzones = [...knownZones];
      else {
        const idxs = pick.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n >= 1 && n <= knownZones.length);
        subzones = idxs.map((n) => knownZones[n - 1]);
      }
    } else {
      console.log('  (sem subzonas configuradas -> scrap so da cidade)');
    }
  } else {
    // cidade NAO esta em cities.json -> skip das subzonas, scrap normal so da zona introduzida
    console.log(`\n"${city}" nao esta em cities.json (${cities.length} cidades disponiveis).`);
    const sugestoes = cities.filter((c) => norm(c).includes(norm(city))).slice(0, 8);
    if (sugestoes.length) {
      console.log('Cidades proximas em cities.json:');
      sugestoes.forEach((sg) => console.log(`  - ${sg}`));
    }
    console.log('Skip das sub-zonas. A fazer scrap normal (so esta zona, sem sub-zonas).');
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    locale: 'pt-PT',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  await scrapeCity(page, city, subzones);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

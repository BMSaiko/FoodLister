// scripts/scrap-city-links.mjs
// Pergunta zona -> scraper Google Maps -> JSON com links /maps/place/ dos restaurantes.
// Sub-zonas opcionais (bairros/freguesias) fundidas com dedup para ir alem do feed da cidade.
// Uso: node scripts/scrap-city-links.mjs [cidade] ["bairro1,bairro2,..."]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// carregar subzonas conhecidas (config editavel)
const known = JSON.parse(readFileSync(join(__dirname, 'subzones.json'), 'utf-8'));

const city = (process.argv[2] || await ask('Zona (cidade): ')).trim();
if (!city) { console.error('Sem zona.'); process.exit(1); }

// subzonas: do ficheiro se a cidade for conhecida; senao pedir manual
let subzones = [];
const key = city.toLowerCase();
const knownZones = known[key];
if (knownZones && knownZones.length) {
  console.log(`Sub-zonas de ${city}:`);
  console.log('  0) TODAS');
  knownZones.forEach((z, i) => console.log(`  ${i + 1}) ${z}`));
  const pick = await ask('Escolhe (nºs separados por virgula, 0=todas, Enter=so a cidade): ');
  if (pick.trim() === '0') subzones = [...knownZones];
  else {
    const idxs = pick.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n >= 1 && n <= knownZones.length);
    subzones = idxs.map((n) => knownZones[n - 1]);
  }
} else {
  const manual = await ask('Sem subzonas conhecidas. Sub-zonas (separadas por virgula; Enter=so a cidade): ');
  subzones = (manual || '').split(',').map((s) => s.trim()).filter(Boolean);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  locale: 'pt-PT',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
});
const page = await ctx.newPage();

const all = new Set();
const queries = [`restaurantes em ${city}`, ...subzones.map((s) => `restaurantes em ${s}`)];
for (const q of queries) {
  const links = await scrapeQuery(page, q);
  let novos = 0;
  links.forEach((l) => { if (!all.has(l)) { all.add(l); novos++; } });
  console.log(`${q} -> ${links.length} links, novos: ${novos}, total: ${all.size}`);
}
await browser.close();

const links = [...all];
const outDir = join(__dirname, 'output');
mkdirSync(outDir, { recursive: true });
const safe = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const file = join(outDir, `${safe}-mapas-links.json`);
writeFileSync(file, JSON.stringify(links, null, 2), 'utf-8');
console.log(`Total ${links.length} restaurantes. Guardado: ${file}`);

// icons.json -> public/icons/sprite.svg + components/ui/icons/names.ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const icons = JSON.parse(readFileSync(join(root, 'scripts/icons/icons.json'), 'utf8'));
const names = Object.keys(icons).sort();

// elemento preenchido sem traço próprio não herda o traço base do símbolo
const fixFilled = (body) =>
  body.replace(/<(path|circle|rect|ellipse|polygon)\b([^>]*?)(\/?)>/g, (m, tag, attrs, close) =>
    /\bfill="(?!none)/.test(attrs) && !/\bstroke=|\bstyle=/.test(attrs) ? `<${tag}${attrs} stroke="none"${close}>` : m);

const symbols = names
  .map((n) => `<symbol id="${n}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${fixFilled(icons[n])}</symbol>`)
  .join('\n');
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}\n</svg>\n`;

mkdirSync(join(root, 'public/icons'), { recursive: true });
mkdirSync(join(root, 'components/ui/icons'), { recursive: true });
writeFileSync(join(root, 'public/icons/sprite.svg'), sprite);
writeFileSync(
  join(root, 'components/ui/icons/names.ts'),
  `// gerado por scripts/icons/build-sprite.mjs — não editar\nexport const ICON_NAMES = [\n${names.map((n) => `  '${n}',`).join('\n')}\n] as const;\n\nexport type IconName = (typeof ICON_NAMES)[number];\n`,
);
console.log(`${names.length} ícones -> sprite.svg + names.ts`);

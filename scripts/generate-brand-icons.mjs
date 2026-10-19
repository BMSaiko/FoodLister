import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const BG = '#050505';
const symbol = readFileSync('public/brand/symbol-dark.svg', 'utf8')
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '');

const tile = (size, scale, radius) => {
  const s = size * scale;
  const o = (size - s) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>` +
      `<g transform="translate(${o} ${o}) scale(${s / 64})">${symbol}</g></svg>`
  );
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const n of sizes) {
  await sharp(tile(n, 0.62, n * 0.2)).png().toFile(`public/icons/icon-${n}x${n}.png`);
}
// maskable: símbolo dentro da zona segura (80%), sem cantos arredondados
for (const n of [192, 512]) {
  await sharp(tile(n, 0.5, 0)).png().toFile(`public/icons/maskable-${n}x${n}.png`);
}
await sharp(tile(180, 0.62, 0)).png().toFile('public/apple-touch-icon.png');
await sharp(tile(32, 0.8, 6)).png().toFile('public/favicon-32.png');
const og = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${BG}"/>` +
    `<g transform="translate(501 170) scale(3.1)">${symbol}</g>` +
    `<text x="600" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#f5f5f5">Food<tspan fill="#f59e0b">Lister</tspan></text></svg>`
);
await sharp(og).png().toFile('public/og-image.png');
writeFileSync('public/favicon.svg', readFileSync('public/brand/symbol-dark.svg'));
console.log('ok');

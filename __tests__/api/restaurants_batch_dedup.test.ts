/** @jest-environment node */
import { isDuplicate } from '@/app/api/restaurants/batch/utils';

const ex = (sourceUrl: string, name: string) => ({ id: 'x', source_url: sourceUrl, name });

describe('batch dedup (so nome + source_url)', () => {
  it('duplicado por source_url igual', () => {
    expect(isDuplicate(
      { name: 'X', source_url: 'https://a/1' },
      [ex('https://a/1', 'X')]
    )).toBe(true);
  });
  it('duplicado por nome igual (normalizado, sem acentos/case)', () => {
    expect(isDuplicate(
      { name: 'Café Central', source_url: 'https://a/1' },
      [ex('https://b/diff', 'Cafe Central')]
    )).toBe(true);
  });
  it('duplicado por place_id mesmo que o NOME tenha mudado', () => {
    // restaurante mudou de nome: same place_id, nome/scrape diferentes
    const DB = 'https://www.google.com/maps/place/Old+Name/@41.15,-8.62,17z/data=!4m6!3m5!1s0xd246310f687c091:0xf9017e3fca1d704f!16s%2Fg%2F11kmp5v32m';
    const SCRAPE = 'https://www.google.com/maps/place/New+Name/data=!4m7!3m6!1s0xd246310f687c091:0xf9017e3fca1d704f!8m2!3d41.15!4d-8.62';
    expect(isDuplicate(
      { name: 'New Name', source_url: SCRAPE },
      [ex(DB, 'Old Name')]
    )).toBe(true);
  });
  it('nao duplicado: nome e source_url e place_id diferentes', () => {
    expect(isDuplicate(
      { name: 'Outro Restaurante', source_url: 'https://a/1' },
      [ex('https://b/2', 'Mix Café')]
    )).toBe(false);
  });
});

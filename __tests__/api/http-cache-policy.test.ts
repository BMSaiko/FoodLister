import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import {
  applyCachePolicy,
  cacheControlValue,
  privateNoStore,
  publicCache,
  withCachePolicy,
} from '@/libs/http-cache';

const API_DIR = join(process.cwd(), 'app', 'api');

function routes(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return routes(p);
    return name === 'route.ts' ? [p] : [];
  });
}

const PUBLIC_ROUTES = ['cuisine-types', 'dietary-options', 'features'];

function fakeResponse(init: Record<string, string> = {}, status = 200) {
  const map = new Map(Object.entries(init));
  return {
    status,
    headers: {
      has: (k: string) => map.has(k),
      get: (k: string) => map.get(k) ?? null,
      set: (k: string, v: string) => void map.set(k, v),
    },
  };
}

describe('http-cache helper', () => {
  it('valores de Cache-Control', () => {
    expect(cacheControlValue(privateNoStore)).toBe('private, no-store');
    expect(cacheControlValue(publicCache(300, 600))).toBe('public, s-maxage=300, stale-while-revalidate=600');
  });

  it('não sobrepõe o Cache-Control da rota', () => {
    const res = fakeResponse({ 'Cache-Control': 'public, s-maxage=60' });
    applyCachePolicy(res, privateNoStore);
    expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=60');
  });

  it('erros nunca ficam em cache público', () => {
    const res = fakeResponse({}, 500);
    applyCachePolicy(res, publicCache());
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('define o Cache-Control em falta e tolera respostas sem headers', async () => {
    const res = await withCachePolicy(privateNoStore, async () => fakeResponse())();
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(withCachePolicy(privateNoStore, async () => ({ status: 200 }))()).resolves.toEqual({ status: 200 });
  });
});

describe('política por rota', () => {
  const files = routes(API_DIR);

  it('há rotas', () => expect(files.length).toBeGreaterThan(50));

  it.each(files.map((f) => [f.slice(API_DIR.length + 1), f]))('%s usa withCachePolicy em todos os métodos', (_n, f) => {
    const src = readFileSync(f, 'utf8');
    expect(src).not.toMatch(/export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/);
    const methods = [...src.matchAll(/export const (GET|POST|PUT|PATCH|DELETE) = withCachePolicy\(/g)];
    expect(methods.length).toBeGreaterThan(0);
  });

  it('só dados de referência são públicos', () => {
    const publicos = files
      .filter((f) => /withCachePolicy\(\s*publicCache/.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(API_DIR.length + 1).split('/')[0])
      .sort();
    expect(publicos).toEqual([...PUBLIC_ROUTES].sort());
  });
});

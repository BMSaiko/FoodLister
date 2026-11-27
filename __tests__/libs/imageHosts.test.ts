import fs from 'fs';
import path from 'path';
import { OPTIMIZABLE_HOSTS, isOptimizable } from '@/libs/imageHosts';

describe('imageHosts', () => {
  it('está em sincronia com next.config.mjs remotePatterns', () => {
    const cfg = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');
    const hosts = [...cfg.matchAll(/hostname:\s*'([^']+)'/g)].map((m) => m[1]);
    expect([...hosts].sort()).toEqual([...OPTIMIZABLE_HOSTS].sort());
  });

  it('aceita caminhos locais e domínios permitidos', () => {
    expect(isOptimizable('/img/a.png')).toBe(true);
    expect(isOptimizable('https://images.unsplash.com/x.jpg')).toBe(true);
  });

  it('rejeita svg, data:, http, domínios desconhecidos e não-strings', () => {
    expect(isOptimizable('/mascot/tovi.svg')).toBe(false);
    expect(isOptimizable('data:image/png;base64,AAA')).toBe(false);
    expect(isOptimizable('http://images.unsplash.com/x.jpg')).toBe(false);
    expect(isOptimizable('https://evil.example.com/x.jpg')).toBe(false);
    expect(isOptimizable('//evil.example.com/x.jpg')).toBe(false);
    expect(isOptimizable(undefined)).toBe(false);
    expect(isOptimizable('')).toBe(false);
  });
});

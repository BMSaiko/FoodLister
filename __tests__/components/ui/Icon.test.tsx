import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import Icon from '@/components/ui/icons/Icon';
import { ICON_NAMES } from '@/components/ui/icons/names';

describe('Icon', () => {
  it('renderiza <use> com o id do sprite', () => {
    const { container } = render(<Icon name="pin" />);
    expect(container.querySelector('use')?.getAttribute('href')).toBe('/icons/sprite.svg#pin');
  });

  it('usa 20px por defeito e respeita size', () => {
    const { container, rerender } = render(<Icon name="pin" />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('20');
    rerender(<Icon name="pin" size={24} />);
    expect(container.querySelector('svg')?.getAttribute('height')).toBe('24');
  });

  it('está aria-hidden sem title', () => {
    const { container } = render(<Icon name="pin" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('com title expõe role img e <title>', () => {
    const { container } = render(<Icon name="pin" title="Restaurante" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.querySelector('title')?.textContent).toBe('Restaurante');
  });

  it('nome inexistente falha em typecheck', () => {
    // @ts-expect-error nome fora de IconName
    render(<Icon name="nao-existe" />);
  });

  it('o sprite tem um symbol por IconName', () => {
    const sprite = fs.readFileSync(path.join(process.cwd(), 'public/icons/sprite.svg'), 'utf8');
    const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]).sort();
    expect(ids).toEqual([...ICON_NAMES].sort());
  });
});

describe('sem lucide-react', () => {
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(e.name) ? [p] : [];
    });

  it('nenhum import de lucide-react em app, components, lib', () => {
    const hits = ['app', 'components', 'lib']
      .map((d) => path.join(process.cwd(), d))
      .filter((d) => fs.existsSync(d))
      .flatMap(walk)
      .filter((f) => /from ['"]lucide-react['"]/.test(fs.readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});

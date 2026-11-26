/** @jest-environment node */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseChangelog, parseRelease } from '@/libs/releases/parse-changelog'

const FIXTURE = `# Changelog

## [Unreleased]

### Added
- Item por lançar

## [1.2.0] - 2026-11-20

### Added
- Pesquisa global
- Exportar listas

### Changed
- Melhor desempenho

### Fixed
- Erro 500 nas rotas

### Security
- Categoria desconhecida

## [1.1.0] - 2026-10-01

### Added

## [1.0.0]

### Corrigido
- Já em PT
`

describe('parseChangelog', () => {
  it('ignora [Unreleased] por defeito', () => {
    const notas = parseChangelog(FIXTURE)
    expect(notas.map((n) => n.version)).toEqual(['1.2.0', '1.1.0', '1.0.0'])
  })

  it('inclui [Unreleased] só a pedido, com versão "unreleased"', () => {
    const notas = parseChangelog(FIXTURE, { includeUnreleased: true })
    expect(notas[0].version).toBe('unreleased')
    expect(notas[0].items.novo).toEqual(['Item por lançar'])
  })

  it('extrai versão, data e itens por categoria', () => {
    const [nota] = parseChangelog(FIXTURE)
    expect(nota).toEqual({
      version: '1.2.0',
      releasedAt: '2026-11-20',
      title: 'Versão 1.2.0',
      items: {
        novo: ['Pesquisa global', 'Exportar listas'],
        melhorado: ['Melhor desempenho'],
        corrigido: ['Erro 500 nas rotas'],
      },
    })
  })

  it('categoria desconhecida não rebenta e é ignorada', () => {
    const [nota] = parseChangelog(FIXTURE)
    expect(JSON.stringify(nota.items)).not.toContain('Categoria desconhecida')
  })

  it('secção vazia devolve arrays vazios', () => {
    const nota = parseChangelog(FIXTURE)[1]
    expect(nota.items).toEqual({ novo: [], melhorado: [], corrigido: [] })
  })

  it('sem data → releasedAt null; categorias em PT aceites', () => {
    const nota = parseChangelog(FIXTURE)[2]
    expect(nota.releasedAt).toBeNull()
    expect(nota.items.corrigido).toEqual(['Já em PT'])
  })

  it('markdown sem secções devolve lista vazia', () => {
    expect(parseChangelog('')).toEqual([])
  })

  it('CHANGELOG.md real não rebenta e só tem versões semver', () => {
    const md = readFileSync(join(process.cwd(), 'CHANGELOG.md'), 'utf8')
    const notas = parseChangelog(md)
    for (const n of notas) expect(n.version).toMatch(/^\d+\.\d+\.\d+$/)
    const unreleased = parseChangelog(md, { includeUnreleased: true })
    expect(unreleased.length).toBeGreaterThanOrEqual(notas.length)
    expect(unreleased.some((n) => n.version === 'unreleased')).toBe(true)
  })
})

describe('parseRelease', () => {
  it('lê uma secção isolada', () => {
    const nota = parseRelease('## [2.0.0] - 2027-01-02\n\n### Added\n- X\n')
    expect(nota?.version).toBe('2.0.0')
    expect(nota?.items.novo).toEqual(['X'])
  })

  it('cabeçalho inválido → null', () => {
    expect(parseRelease('sem cabeçalho')).toBeNull()
  })
})

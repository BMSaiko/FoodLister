// @ts-expect-error módulo .mjs sem tipos
import { calcularVersao, lerUnreleased, aplicarBump } from '../../../scripts/release/bump-version.mjs'

describe('calcularVersao', () => {
  it('feat sobe o minor', () => {
    expect(calcularVersao(['feat: filtro novo'], '0.1.0')).toBe('0.2.0')
  })
  it('fix sobe o patch', () => {
    expect(calcularVersao(['fix(mapa): pin'], '1.2.3')).toBe('1.2.4')
  })
  it('! sobe o major', () => {
    expect(calcularVersao(['feat!: API nova'], '1.2.3')).toBe('2.0.0')
    expect(calcularVersao(['fix(api)!: remove campo'], '1.2.3')).toBe('2.0.0')
  })
  it('BREAKING CHANGE no corpo sobe o major', () => {
    expect(calcularVersao(['feat: x\n\nBREAKING CHANGE: muda y'], '1.2.3')).toBe('2.0.0')
  })
  it('mistura: vence o maior', () => {
    expect(calcularVersao(['fix: a', 'feat: b', 'chore: c'], '1.2.3')).toBe('1.3.0')
  })
  it('só chore/docs/ci: sem release (null)', () => {
    expect(calcularVersao(['chore: deps', 'docs: guia', 'ci: cache'], '1.2.3')).toBeNull()
  })
  it('sem commits: null', () => {
    expect(calcularVersao([], '1.2.3')).toBeNull()
  })
  it('commits fora do formato convencional são ignorados', () => {
    expect(calcularVersao(['Merge branch dev', 'wip'], '1.2.3')).toBeNull()
  })
})

const CHANGELOG = `# Changelog

## [Unreleased]

### Added
- **Novo** — coisa (#1)

### Fixed
- bug (#2)

## [0.1.0] - 2026-11-01

### Added
- antigo
`

describe('lerUnreleased', () => {
  it('conta itens da secção [Unreleased]', () => {
    expect(lerUnreleased(CHANGELOG)).toBe(2)
  })
  it('secção vazia: 0', () => {
    expect(lerUnreleased('## [Unreleased]\n\n## [0.1.0] - 2026-11-01\n- x\n')).toBe(0)
  })
})

describe('aplicarBump', () => {
  const pkg = JSON.stringify({ name: 'x', version: '0.1.0' }, null, 2) + '\n'

  it('promove [Unreleased] a [X.Y.Z] - data e abre um [Unreleased] vazio', () => {
    const r = aplicarBump({ changelog: CHANGELOG, pkg, versao: '0.2.0', data: '2026-11-26' })
    expect(r.changelog).toContain('## [Unreleased]\n\n## [0.2.0] - 2026-11-26\n\n### Added')
    expect(r.changelog).toContain('## [0.1.0] - 2026-11-01')
    expect(JSON.parse(r.pkg).version).toBe('0.2.0')
  })
  it('é idempotente: repetir não duplica a secção', () => {
    const a = aplicarBump({ changelog: CHANGELOG, pkg, versao: '0.2.0', data: '2026-11-26' })
    const b = aplicarBump({ changelog: a.changelog, pkg: a.pkg, versao: '0.2.0', data: '2026-11-26' })
    expect(b).toEqual(a)
  })
  it('recusa bump sem itens em [Unreleased]', () => {
    expect(() =>
      aplicarBump({ changelog: '## [Unreleased]\n\n## [0.1.0] - 2026-11-01\n- x\n', pkg, versao: '0.2.0', data: '2026-11-26' }),
    ).toThrow(/sem itens/)
  })
  it('o resultado é lido pelo parser de releases', async () => {
    const { parseChangelog } = await import('../../../libs/releases')
    const r = aplicarBump({ changelog: CHANGELOG, pkg, versao: '0.2.0', data: '2026-11-26' })
    const notas = parseChangelog(r.changelog)
    expect(notas[0]).toMatchObject({ version: '0.2.0', releasedAt: '2026-11-26' })
    expect(notas[0].items.novo).toHaveLength(1)
    expect(notas[0].items.corrigido).toHaveLength(1)
  })
})

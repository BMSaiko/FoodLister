// @ts-expect-error módulo .mjs sem tipos
import { verificarVersao, compararSemver } from '../../../scripts/release/check-version.mjs'

const CHANGELOG = `## [Unreleased]

## [0.3.0] - 2026-12-01

### Added
- coisa

## [0.2.0] - 2026-11-27

### Fixed
- bug
`

describe('compararSemver', () => {
  it('compara numericamente', () => {
    expect(compararSemver('0.10.0', '0.9.0')).toBeGreaterThan(0)
    expect(compararSemver('1.0.0', '1.0.0')).toBe(0)
    expect(compararSemver('0.2.0', '0.2.1')).toBeLessThan(0)
  })
})

describe('verificarVersao', () => {
  it('bump + secção no CHANGELOG: ok', () => {
    expect(verificarVersao({ versao: '0.3.0', base: '0.2.0', changelog: CHANGELOG })).toEqual([])
  })
  it('sem bump face a main: erro', () => {
    const erros = verificarVersao({ versao: '0.2.0', base: '0.2.0', changelog: CHANGELOG })
    expect(erros.join(' ')).toMatch(/bump/)
  })
  it('versão inferior à de main: erro', () => {
    expect(verificarVersao({ versao: '0.1.0', base: '0.2.0', changelog: CHANGELOG })).not.toEqual([])
  })
  it('CHANGELOG sem secção da versão: erro', () => {
    const erros = verificarVersao({ versao: '0.4.0', base: '0.2.0', changelog: CHANGELOG })
    expect(erros.join(' ')).toMatch(/CHANGELOG/)
  })
  it('aceita «—», «–» e «-» no cabeçalho', () => {
    for (const sep of ['—', '–', '-']) {
      const cl = `## [0.3.0] ${sep} 2026-12-01\n\n### Added\n- x\n`
      expect(verificarVersao({ versao: '0.3.0', base: '0.2.0', changelog: cl })).toEqual([])
    }
  })
  it('secção vazia: erro', () => {
    const cl = `## [0.3.0] - 2026-12-01\n\n## [0.2.0] - 2026-11-27\n- a\n`
    expect(verificarVersao({ versao: '0.3.0', base: '0.2.0', changelog: cl }).join(' ')).toMatch(/vazia/)
  })
})

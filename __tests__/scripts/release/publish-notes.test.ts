import { notaDaVersao, notasEmFalta, planear, publicarEmFalta } from '../../../scripts/release/publish-notes'

const CHANGELOG = `## [Unreleased]

## [0.2.0] — 2026-11-27

### Added
- coisa nova

### Fixed
- bug

## [0.1.5] – 2026-11-10

### Fixed
- meio

## [0.1.0] - 2026-11-01

### Added
- antigo
`

function clienteFalso(publicadas: string[], erroInsert: string | null = null) {
  const insert = jest.fn().mockResolvedValue({ error: erroInsert ? { message: erroInsert } : null })
  const select = jest.fn().mockResolvedValue({ data: publicadas.map((version) => ({ version })), error: null })
  const from = jest.fn().mockReturnValue({ select, insert })
  return { client: { from }, insert, select }
}

describe('notaDaVersao', () => {
  it('escolhe a nota da versão do package.json', () => {
    expect(notaDaVersao(CHANGELOG, '0.2.0')?.items.novo).toEqual(['coisa nova'])
  })
  it('versão ausente: null', () => {
    expect(notaDaVersao(CHANGELOG, '9.9.9')).toBeNull()
  })
})

describe('notasEmFalta', () => {
  it('tudo por publicar: da mais nova para a mais antiga', () => {
    expect(notasEmFalta(CHANGELOG, []).map((n) => n.version)).toEqual(['0.2.0', '0.1.5', '0.1.0'])
  })
  it('ignora as já publicadas', () => {
    expect(notasEmFalta(CHANGELOG, ['0.1.5']).map((n) => n.version)).toEqual(['0.2.0', '0.1.0'])
  })
  it('ordena semver numericamente (0.10.0 > 0.9.0)', () => {
    const cl = '## [0.9.0] - 2026-01-01\n- a\n\n## [0.10.0] - 2026-02-01\n- b\n'
    expect(notasEmFalta(cl, []).map((n) => n.version)).toEqual(['0.10.0', '0.9.0'])
  })
})

describe('planear', () => {
  it('notifica só a mais recente', () => {
    const p = planear(CHANGELOG, [])
    expect(p.inserir.map((n) => n.version)).toEqual(['0.2.0', '0.1.5', '0.1.0'])
    expect(p.notificar).toBe('0.2.0')
  })
  it('mais recente já publicada: backfill sem notificar', () => {
    const p = planear(CHANGELOG, ['0.2.0'])
    expect(p.inserir.map((n) => n.version)).toEqual(['0.1.5', '0.1.0'])
    expect(p.notificar).toBeNull()
  })
  it('tudo em dia: nada', () => {
    expect(planear(CHANGELOG, ['0.2.0', '0.1.5', '0.1.0'])).toEqual({ inserir: [], notificar: null, semData: [] })
  })
  it('versão sem data é ignorada e assinalada', () => {
    const p = planear('## [0.3.0]\n- x\n\n## [0.2.0] - 2026-11-27\n- y\n', [])
    expect(p.inserir.map((n) => n.version)).toEqual(['0.2.0'])
    expect(p.semData).toEqual(['0.3.0'])
  })
})

describe('publicarEmFalta', () => {
  it('insere em falta, da mais nova para a mais antiga', async () => {
    const { client, insert } = clienteFalso(['0.1.0'])
    await publicarEmFalta(client, CHANGELOG)
    expect(insert.mock.calls.map((c) => c[0].version)).toEqual(['0.2.0', '0.1.5'])
    expect(insert.mock.calls[0][0]).toMatchObject({ released_at: '2026-11-27', title: 'Versão 0.2.0' })
  })
  it('2.ª execução = 0 inserções', async () => {
    const { client, insert } = clienteFalso(['0.2.0', '0.1.5', '0.1.0'])
    const plano = await publicarEmFalta(client, CHANGELOG)
    expect(insert).not.toHaveBeenCalled()
    expect(plano.inserir).toEqual([])
  })
  it('erro da BD rebenta com mensagem clara', async () => {
    const { client } = clienteFalso([], 'boom')
    await expect(publicarEmFalta(client, CHANGELOG)).rejects.toThrow(/release_notes 0\.2\.0.*boom/)
  })
  it('erro ao ler release_notes rebenta', async () => {
    const select = jest.fn().mockResolvedValue({ data: null, error: { message: 'relation does not exist' } })
    const client = { from: jest.fn().mockReturnValue({ select, insert: jest.fn() }) }
    await expect(publicarEmFalta(client, CHANGELOG)).rejects.toThrow(/does not exist/)
  })
})

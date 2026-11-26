import { publicarNota, notaDaVersao } from '../../../scripts/release/publish-notes'

const CHANGELOG = `## [Unreleased]

## [0.2.0] - 2026-11-26

### Added
- coisa nova

### Fixed
- bug

## [0.1.0] - 2026-11-01

### Added
- antigo
`

function clienteFalso(resultado: { error: { message: string } | null } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(resultado)
  const from = jest.fn().mockReturnValue({ upsert })
  return { client: { from }, from, upsert }
}

describe('notaDaVersao', () => {
  it('escolhe a nota da versão do package.json', () => {
    expect(notaDaVersao(CHANGELOG, '0.2.0')?.items.novo).toEqual(['coisa nova'])
  })
  it('versão ausente: null', () => {
    expect(notaDaVersao(CHANGELOG, '9.9.9')).toBeNull()
  })
})

describe('publicarNota', () => {
  const nota = notaDaVersao(CHANGELOG, '0.2.0')!

  it('faz upsert por version em release_notes', async () => {
    const { client, from, upsert } = clienteFalso()
    await publicarNota(client, nota)
    expect(from).toHaveBeenCalledWith('release_notes')
    expect(upsert).toHaveBeenCalledWith(
      { version: '0.2.0', released_at: '2026-11-26', title: 'Versão 0.2.0', items: nota.items },
      { onConflict: 'version' },
    )
  })
  it('repetir usa o mesmo upsert (idempotente)', async () => {
    const { client, upsert } = clienteFalso()
    await publicarNota(client, nota)
    await publicarNota(client, nota)
    expect(upsert).toHaveBeenCalledTimes(2)
    expect(upsert.mock.calls[0]).toEqual(upsert.mock.calls[1])
  })
  it('erro da BD rebenta com mensagem clara', async () => {
    const { client } = clienteFalso({ error: { message: 'boom' } })
    await expect(publicarNota(client, nota)).rejects.toThrow(/release_notes.*boom/)
  })
  it('nota sem data é recusada', async () => {
    const { client, upsert } = clienteFalso()
    await expect(publicarNota(client, { ...nota, releasedAt: null })).rejects.toThrow(/data/)
    expect(upsert).not.toHaveBeenCalled()
  })
})

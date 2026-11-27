// @ts-expect-error módulo .mjs sem tipos
import { migracoesPendentes } from '../../../scripts/release/check-migrations.mjs'

const SAIDA = `
   Local          | Remote         | Time (UTC)
  ----------------|----------------|---------------------
   20261127100000 | 20261127100000 | 2026-11-27 10:00:00
   20261127120000 |                | 2026-11-27 12:00:00
   20261127150000 |                | 2026-11-27 15:00:00
`

describe('migracoesPendentes', () => {
  it('lista as locais sem Remote', () => {
    expect(migracoesPendentes(SAIDA)).toEqual(['20261127120000', '20261127150000'])
  })
  it('tudo aplicado: vazio', () => {
    expect(migracoesPendentes('   1 | 1 | x\n   2 | 2 | y')).toEqual([])
  })
  it('ignora migrações só remotas (sem Local)', () => {
    expect(migracoesPendentes('   | 20260101000000 | x')).toEqual([])
  })
  it('saída sem tabela: vazio', () => {
    expect(migracoesPendentes('Connecting...')).toEqual([])
  })
  it('lê o formato JSON do CLI fora de um terminal', () => {
    const json = 'Target: prod\n{"migrations":[{"local":"1","remote":"1"},{"local":"2","remote":""},{"local":"3"},{"remote":"9"}],"message":"ok"}'
    expect(migracoesPendentes(json)).toEqual(['2', '3'])
  })
})

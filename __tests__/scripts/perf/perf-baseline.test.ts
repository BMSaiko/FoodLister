// @ts-expect-error módulo .mjs sem tipos
import { percentil, resumir } from '../../../scripts/perf-baseline.mjs'

describe('percentil', () => {
  it('p50 de 1..10 é 5', () => {
    expect(percentil([10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 50)).toBe(5)
  })
  it('p95 de 1..100 é 95', () => {
    expect(percentil(Array.from({ length: 100 }, (_, i) => i + 1), 95)).toBe(95)
  })
  it('um só valor', () => {
    expect(percentil([7], 95)).toBe(7)
  })
  it('vazio é NaN', () => {
    expect(percentil([], 50)).toBeNaN()
  })
})

describe('resumir', () => {
  it('calcula p50, p95, média de bytes e último status', () => {
    const r = resumir([
      { ms: 10, bytes: 100, status: 200 },
      { ms: 30, bytes: 300, status: 200 },
      { ms: 20, bytes: 200, status: 401 },
    ])
    expect(r).toEqual({ p50: 20, p95: 30, bytes: 200, status: 401 })
  })
})

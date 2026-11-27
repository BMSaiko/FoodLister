#!/usr/bin/env node
/**
 * Harness de latência das rotas /api (só GET, só local/staging).
 * Uso: npm run build && npm start (outro terminal), depois
 *   node scripts/perf-baseline.mjs [--base http://localhost:3000] [--n 30] [--warmup 3] [--json]
 * Rotas autenticadas sem sessão devolvem 401/403: ficam marcadas, os tempos medem o middleware/auth.
 */
import { pathToFileURL } from 'node:url'

export const ROUTES = [
  '/api/restaurants',
  '/api/feed',
  '/api/home/stats',
  '/api/cuisine-types',
  '/api/dietary-options',
  '/api/features',
  '/api/lists',
  '/api/meals/scheduled',
  '/api/notifications',
]

export function percentil(valores, p) {
  if (!valores.length) return NaN
  const ord = [...valores].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * ord.length) - 1
  return ord[Math.min(Math.max(idx, 0), ord.length - 1)]
}

export function resumir(amostras) {
  const tempos = amostras.map((a) => a.ms)
  const bytes = amostras.map((a) => a.bytes)
  return {
    p50: percentil(tempos, 50),
    p95: percentil(tempos, 95),
    bytes: bytes.length ? Math.round(bytes.reduce((s, b) => s + b, 0) / bytes.length) : 0,
    status: amostras.length ? amostras[amostras.length - 1].status : 0,
  }
}

async function pedir(url, cookie) {
  const t0 = performance.now()
  try {
    const res = await fetch(url, { headers: cookie ? { accept: 'application/json', cookie } : { accept: 'application/json' } })
    const buf = await res.arrayBuffer()
    return { ms: performance.now() - t0, bytes: buf.byteLength, status: res.status }
  } catch {
    return { ms: performance.now() - t0, bytes: 0, status: 0 }
  }
}

export async function medirRota(base, rota, n, warmup, { cookie } = {}) {
  for (let i = 0; i < warmup; i++) await pedir(base + rota, cookie)
  const amostras = []
  for (let i = 0; i < n; i++) amostras.push(await pedir(base + rota, cookie))
  return { rota, ...resumir(amostras) }
}

function arg(nome, def) {
  const i = process.argv.indexOf(`--${nome}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def
}

async function main() {
  const base = arg('base', 'http://localhost:3000')
  const n = Number(arg('n', 30))
  const warmup = Number(arg('warmup', 3))
  const linhas = []
  for (const rota of ROUTES) linhas.push(await medirRota(base, rota, n, warmup))
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(linhas, null, 2))
    return
  }
  console.log(`| rota | status | p50 ms | p95 ms | bytes | queries |`)
  console.log(`|---|---|---|---|---|---|`)
  for (const l of linhas) {
    console.log(`| ${l.rota} | ${l.status} | ${l.p50.toFixed(0)} | ${l.p95.toFixed(0)} | ${l.bytes} | n/d |`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()

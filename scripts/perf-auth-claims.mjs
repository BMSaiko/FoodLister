#!/usr/bin/env node
/**
 * Mede chamadas ao Supabase Auth por pedido nas rotas autenticadas (só local).
 * Cria/entra com um utilizador de teste, envia o cookie de sessão e conta as linhas
 * `GET /user` no log do contentor Auth antes/depois de N pedidos por rota.
 * Uso: node scripts/perf-auth-claims.mjs [--base http://localhost:3100] [--n 20]
 *      [--api http://127.0.0.1:55321] [--key <publishable>] [--container supabase_auth_foodlister]
 */
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { ROUTES, medirRota } from './perf-baseline.mjs'

export function arg(nome, def) {
  const i = process.argv.indexOf(`--${nome}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def
}

export function cookieSessao(api, sessao) {
  const ref = new URL(api).hostname.split('.')[0]
  const valor = 'base64-' + Buffer.from(JSON.stringify(sessao)).toString('base64url')
  return `sb-${ref}-auth-token=${valor}`
}

export function contarUser(logs) {
  return logs.split('\n').filter((l) => /"path":"\/user"/.test(l) && /"method":"GET"/.test(l)).length
}

async function sessao(api, key) {
  const email = 'perf-auth@example.com'
  const password = 'perf-auth-teste-123'
  const h = { apikey: key, 'content-type': 'application/json' }
  await fetch(`${api}/auth/v1/signup`, { method: 'POST', headers: h, body: JSON.stringify({ email, password }) })
  const r = await fetch(`${api}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) throw new Error(`login falhou: ${r.status}`)
  return r.json()
}

function logsAuth(container) {
  // o Auth escreve no stderr do contentor: juntar os dois canais
  const r = spawnSync('docker', ['logs', container], { encoding: 'utf8', maxBuffer: 1 << 28 })
  return `${r.stdout}\n${r.stderr}`
}

async function main() {
  const base = arg('base', 'http://localhost:3100')
  const api = arg('api', 'http://127.0.0.1:55321')
  const key = arg('key', '')
  const n = Number(arg('n', 20))
  const container = arg('container', 'supabase_auth_foodlister')
  const s = await sessao(api, key)
  const cookie = cookieSessao(api, s)
  const antesTotal = contarUser(logsAuth(container))
  const linhas = []
  for (const rota of ROUTES) {
    const a = contarUser(logsAuth(container))
    const t = await medirRota(base, rota, n, 0, { cookie })
    const d = contarUser(logsAuth(container)) - a
    linhas.push({ ...t, chamadas: d, porPedido: d / n })
  }
  console.log('| rota | status | p50 ms | p95 ms | GET /user | por pedido |')
  console.log('|---|---|---|---|---|---|')
  for (const l of linhas) {
    console.log(`| ${l.rota} | ${l.status} | ${l.p50.toFixed(0)} | ${l.p95.toFixed(0)} | ${l.chamadas} | ${l.porPedido.toFixed(2)} |`)
  }
  console.log(`\ntotal GET /user na medição: ${contarUser(logsAuth(container)) - antesTotal}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()

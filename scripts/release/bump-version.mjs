#!/usr/bin/env node
// Calcula a versão semver pelos commits convencionais e promove [Unreleased] no CHANGELOG.
// Uso: node scripts/release/bump-version.mjs [--base origin/main] [--dry-run] [--date AAAA-MM-DD]
// Com [Unreleased] vazio gera os itens dos commits feat/fix (sem editar o CHANGELOG à mão).
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const CONVENCIONAL = /^(\w+)(\([^)]*\))?(!)?:\s/

/** Próxima versão semver, ou `null` se nenhum commit justifica release. */
export function calcularVersao(commits, atual) {
  const [maj, min, pat] = atual.split('.').map(Number)
  let nivel = null
  for (const c of commits) {
    const m = CONVENCIONAL.exec(c.split('\n')[0])
    if (!m) continue
    if (m[3] || /^BREAKING[ -]CHANGE:/m.test(c)) return `${maj + 1}.0.0`
    if (m[1] === 'feat') nivel = 'minor'
    else if (m[1] === 'fix' && nivel !== 'minor') nivel = 'patch'
  }
  if (nivel === 'minor') return `${maj}.${min + 1}.0`
  if (nivel === 'patch') return `${maj}.${min}.${pat + 1}`
  return null
}

function secaoUnreleased(changelog) {
  const m = /^## \[Unreleased\][^\n]*\n([\s\S]*?)(?=^## \[|(?![\s\S]))/m.exec(changelog)
  return m ? m[1] : null
}

/** Número de itens (`- ...`) na secção [Unreleased]. */
export function lerUnreleased(changelog) {
  const corpo = secaoUnreleased(changelog)
  return corpo ? (corpo.match(/^[-*]\s+\S/gm) ?? []).length : 0
}

/** Itens de CHANGELOG (Added/Fixed) gerados dos commits convencionais feat/fix. */
export function gerarItens(commits) {
  const grupos = { feat: [], fix: [] }
  for (const c of commits) {
    const linha = c.split('\n')[0]
    const m = CONVENCIONAL.exec(linha)
    if (m && grupos[m[1]]) grupos[m[1]].push(linha.slice(m[0].length).trim())
  }
  const bloco = (titulo, itens) => (itens.length ? `### ${titulo}\n\n${itens.map((i) => `- ${i}`).join('\n')}\n` : '')
  return [bloco('Added', grupos.feat), bloco('Fixed', grupos.fix)].filter(Boolean).join('\n')
}

/** Devolve o CHANGELOG e o package.json com a versão aplicada; idempotente. */
export function aplicarBump({ changelog, pkg, versao, data, itens = '' }) {
  const json = JSON.parse(pkg)
  json.version = versao
  const novoPkg = `${JSON.stringify(json, null, 2)}\n`
  if (new RegExp(`^## \\[${versao.replace(/\./g, '\\.')}\\]`, 'm').test(changelog)) {
    return { changelog, pkg: novoPkg }
  }
  const vazio = lerUnreleased(changelog) === 0
  if (vazio && !itens.trim()) throw new Error('[Unreleased] sem itens: nada para publicar')
  const corpo = vazio ? `\n${itens.trimEnd()}\n` : ''
  const novo = changelog.replace(/^## \[Unreleased\][^\n]*\n/m, `## [Unreleased]\n\n## [${versao}] - ${data}\n${corpo}`)
  return { changelog: novo, pkg: novoPkg }
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function commitsDesde(base) {
  const bruto = git('log', '--no-merges', '--format=%B%x00', `${base}..HEAD`)
  return bruto.split('\0').map((c) => c.trim()).filter(Boolean)
}

function commitsDesdeUltimaTag() {
  let tag = ''
  try {
    tag = execFileSync('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    tag = ''
  }
  const intervalo = tag ? [`${tag}..HEAD`] : []
  const bruto = git('log', '--no-merges', '--format=%B%x00', ...intervalo)
  return bruto.split('\0').map((c) => c.trim()).filter(Boolean)
}

function main(argv) {
  const dry = argv.includes('--dry-run')
  const i = argv.indexOf('--date')
  const data = i >= 0 ? argv[i + 1] : new Date().toISOString().slice(0, 10)
  const b = argv.indexOf('--base')
  const base = b >= 0 ? argv[b + 1] : null
  const pkgTxt = readFileSync('package.json', 'utf8')
  // Com --base (ex.: origin/main) o intervalo e a versão de partida vêm da base: idempotente e sem tags.
  const atual = base ? JSON.parse(git('show', `${base}:package.json`)).version : JSON.parse(pkgTxt).version
  const commits = base ? commitsDesde(base) : commitsDesdeUltimaTag()
  const versao = calcularVersao(commits, atual)
  if (!versao) {
    console.log('sem release: nenhum commit feat/fix/breaking desde a última tag')
    return 0
  }
  const { changelog, pkg } = aplicarBump({ changelog: readFileSync('CHANGELOG.md', 'utf8'), pkg: pkgTxt, versao, data, itens: gerarItens(commits) })
  console.log(`versão: ${atual} → ${versao} (${data})${dry ? ' [dry-run]' : ''}`)
  if (!dry) {
    writeFileSync('CHANGELOG.md', changelog)
    writeFileSync('package.json', pkg)
  }
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exit(main(process.argv.slice(2)))
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

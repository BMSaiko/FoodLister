#!/usr/bin/env node
// Check de PR para `main`: package.json com bump face à base e CHANGELOG com a secção dessa versão.
// Uso: node scripts/release/check-version.mjs [--base origin/main]
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** Compara `a` e `b` (semver X.Y.Z): >0 se a > b. */
export function compararSemver(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d
  }
  return 0
}

function corpoDaSecao(changelog, versao) {
  const v = versao.replace(/\./g, '\\.')
  const m = new RegExp(`^## \\[${v}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`, 'm').exec(changelog)
  return m ? m[1] : null
}

/** Lista de erros (vazia = ok). */
export function verificarVersao({ versao, base, changelog }) {
  const erros = []
  if (compararSemver(versao, base) <= 0) {
    erros.push(`package.json ${versao} sem bump face a main (${base}): correr node scripts/release/bump-version.mjs`)
  }
  const corpo = corpoDaSecao(changelog, versao)
  if (corpo === null) erros.push(`CHANGELOG.md sem secção [${versao}]`)
  else if (!/^[-*]\s+\S/m.test(corpo)) erros.push(`CHANGELOG.md: secção [${versao}] vazia (sem itens)`)
  return erros
}

function main(argv) {
  const i = argv.indexOf('--base')
  const ref = i >= 0 ? argv[i + 1] : 'origin/main'
  const base = JSON.parse(execFileSync('git', ['show', `${ref}:package.json`], { encoding: 'utf8' })).version
  const versao = JSON.parse(readFileSync('package.json', 'utf8')).version
  const erros = verificarVersao({ versao, base, changelog: readFileSync('CHANGELOG.md', 'utf8') })
  if (erros.length) {
    for (const e of erros) console.error(`::error::${e}`)
    return 1
  }
  console.log(`versão ${versao} > ${base}; CHANGELOG ok`)
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

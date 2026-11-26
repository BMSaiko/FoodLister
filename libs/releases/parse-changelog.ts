import type { ReleaseCategory, ReleaseItems, ReleaseNote } from './types'

const CATEGORIAS: Record<string, ReleaseCategory> = {
  added: 'novo',
  adicionado: 'novo',
  novo: 'novo',
  changed: 'melhorado',
  alterado: 'melhorado',
  melhorado: 'melhorado',
  fixed: 'corrigido',
  corrigido: 'corrigido',
}

const CABECALHO = /^##\s+\[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?\s*$/
const SEMVER = /^v?(\d+\.\d+\.\d+)$/
const UNRELEASED = 'unreleased'

export interface ParseOptions {
  /** Inclui a secção `[Unreleased]` (versão `unreleased`). Por defeito é ignorada. */
  includeUnreleased?: boolean
}

function itensVazios(): ReleaseItems {
  return { novo: [], melhorado: [], corrigido: [] }
}

function limpar(item: string): string {
  return item.replace(/\s+/g, ' ').trim()
}

/** Lê uma secção `## [versão] - data` até à seguinte. `null` se o cabeçalho for inválido ou a versão não for semver/unreleased. */
export function parseRelease(section: string): ReleaseNote | null {
  const linhas = section.split(/\r?\n/)
  const inicio = linhas.findIndex((l) => CABECALHO.test(l))
  if (inicio === -1) return null
  const m = CABECALHO.exec(linhas[inicio])
  if (!m) return null

  const bruta = m[1].trim()
  const semver = SEMVER.exec(bruta)
  const versao = semver ? semver[1] : bruta.toLowerCase() === UNRELEASED ? UNRELEASED : null
  if (!versao) return null

  const items = itensVazios()
  let atual: ReleaseCategory | null = null
  let ultimo: string[] | null = null

  for (const linha of linhas.slice(inicio + 1)) {
    const cab = /^###\s+(.+?)\s*$/.exec(linha)
    if (cab) {
      atual = CATEGORIAS[cab[1].toLowerCase()] ?? null
      ultimo = null
      continue
    }
    if (!atual) continue
    const item = /^[-*]\s+(.+)$/.exec(linha)
    if (item) {
      items[atual].push(limpar(item[1]))
      ultimo = items[atual]
    } else if (ultimo && /^\s+\S/.test(linha) && ultimo.length) {
      ultimo[ultimo.length - 1] = limpar(`${ultimo[ultimo.length - 1]} ${linha}`)
    } else if (!linha.trim()) {
      ultimo = null
    }
  }

  return {
    version: versao,
    releasedAt: m[2] ?? null,
    title: versao === UNRELEASED ? 'Por lançar' : `Versão ${versao}`,
    items,
  }
}

/** Converte um CHANGELOG (Keep a Changelog) em notas de release, da mais recente para a mais antiga. */
export function parseChangelog(md: string, options: ParseOptions = {}): ReleaseNote[] {
  const partes = md.split(/\r?\n(?=##\s+\[)/)
  const notas: ReleaseNote[] = []
  for (const parte of partes) {
    const nota = parseRelease(parte)
    if (!nota) continue
    if (nota.version === UNRELEASED && !options.includeUnreleased) continue
    notas.push(nota)
  }
  return notas
}

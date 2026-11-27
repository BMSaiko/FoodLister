// Publica em `release_notes` todas as versões do CHANGELOG.md em falta (backfill idempotente).
// Uso: npx tsx scripts/release/publish-notes.ts [--dry-run]
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (só em GitHub Actions).
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseChangelog } from '../../libs/releases/parse-changelog'
import type { ReleaseNote } from '../../libs/releases/types'

export interface ClienteNotas {
  from(tabela: string): {
    select(colunas: string): PromiseLike<{
      data: { version: string }[] | null
      error: { message: string } | null
    }>
    insert(linha: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>
  }
}

export function notaDaVersao(changelog: string, versao: string): ReleaseNote | null {
  return parseChangelog(changelog).find((n) => n.version === versao) ?? null
}

function cmpSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d
  }
  return 0
}

/**
 * Notas do CHANGELOG ainda ausentes em `release_notes`, da mais nova para a mais antiga.
 * Publicar por esta ordem faz o trigger `notify_release` notificar só a mais recente
 * (as antigas entram depois, já não são a maior `released_at`).
 */
export function notasEmFalta(changelog: string, publicadas: string[]): ReleaseNote[] {
  const ja = new Set(publicadas)
  return parseChangelog(changelog)
    .filter((n) => !ja.has(n.version))
    .sort((a, b) => cmpSemver(b.version, a.version))
}

export interface Plano {
  inserir: ReleaseNote[]
  /** Versão que dispara notificações (a mais recente do CHANGELOG, se ainda não publicada). */
  notificar: string | null
  semData: string[]
}

export function planear(changelog: string, publicadas: string[]): Plano {
  const emFalta = notasEmFalta(changelog, publicadas)
  const inserir = emFalta.filter((n) => n.releasedAt)
  const maisRecente = parseChangelog(changelog).sort((a, b) => cmpSemver(b.version, a.version))[0]
  return {
    inserir,
    notificar: maisRecente && inserir.some((n) => n.version === maisRecente.version) ? maisRecente.version : null,
    semData: emFalta.filter((n) => !n.releasedAt).map((n) => n.version),
  }
}

async function versoesPublicadas(client: ClienteNotas): Promise<string[]> {
  const { data, error } = await client.from('release_notes').select('version')
  if (error) throw new Error(`release_notes: ${error.message}`)
  return (data ?? []).map((r) => r.version)
}

/** Insere só as versões em falta (idempotente: 2.ª execução = 0 inserções). */
export async function publicarEmFalta(client: ClienteNotas, changelog: string): Promise<Plano> {
  const plano = planear(changelog, await versoesPublicadas(client))
  for (const nota of plano.inserir) {
    const { error } = await client.from('release_notes').insert({
      version: nota.version,
      released_at: nota.releasedAt,
      title: nota.title,
      items: nota.items,
    })
    if (error) throw new Error(`release_notes ${nota.version}: ${error.message}`)
  }
  return plano
}

function descrever(plano: Plano): void {
  for (const n of plano.inserir) {
    console.log(`inserir ${n.version} (${n.releasedAt})${n.version === plano.notificar ? ' [notifica]' : ' [sem notificação]'}`)
  }
  if (plano.inserir.length === 0) console.log('nada a inserir: release_notes em dia')
  for (const v of plano.semData) console.warn(`aviso: [${v}] sem data no CHANGELOG, ignorada`)
}

async function main(argv: string[]): Promise<number> {
  const dry = argv.includes('--dry-run')
  const versao = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version
  const changelog = readFileSync('CHANGELOG.md', 'utf8')
  if (!notaDaVersao(changelog, versao)) {
    console.error(`CHANGELOG.md não tem a secção [${versao}]`)
    return 1
  }
  const url = process.env.SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (dry && (!url || !chave)) {
    // Sem BD: assume nada publicado e mostra o plano completo.
    descrever(planear(changelog, []))
    console.log('[dry-run] sem ligação à BD: plano calculado contra release_notes vazia')
    return 0
  }
  if (!url || !chave) {
    console.error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em falta')
    return 1
  }
  const { createClient } = await import('@supabase/supabase-js')
  const client = createClient(url, chave) as unknown as ClienteNotas
  if (dry) {
    descrever(planear(changelog, await versoesPublicadas(client)))
    console.log('[dry-run] sem escrita na BD')
    return 0
  }
  const plano = await publicarEmFalta(client, changelog)
  descrever(plano)
  console.log(`${plano.inserir.length} nota(s) publicada(s)`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (rc) => process.exit(rc),
    (e: Error) => {
      console.error(e.message)
      process.exit(1)
    },
  )
}

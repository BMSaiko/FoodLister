// Publica a nota da versão atual (package.json + CHANGELOG.md) em `release_notes`.
// Uso: npx tsx scripts/release/publish-notes.ts [--dry-run]
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (só em GitHub Actions).
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseChangelog } from '../../libs/releases/parse-changelog'
import type { ReleaseNote } from '../../libs/releases/types'

export interface ClienteNotas {
  from(tabela: string): {
    upsert(
      linha: Record<string, unknown>,
      opcoes: { onConflict: string },
    ): PromiseLike<{ error: { message: string } | null }>
  }
}

export function notaDaVersao(changelog: string, versao: string): ReleaseNote | null {
  return parseChangelog(changelog).find((n) => n.version === versao) ?? null
}

/** Upsert por `version`: repetir o workflow não duplica nem falha. */
export async function publicarNota(client: ClienteNotas, nota: ReleaseNote): Promise<void> {
  if (!nota.releasedAt) throw new Error(`nota ${nota.version} sem data de release`)
  const { error } = await client.from('release_notes').upsert(
    { version: nota.version, released_at: nota.releasedAt, title: nota.title, items: nota.items },
    { onConflict: 'version' },
  )
  if (error) throw new Error(`release_notes: ${error.message}`)
}

async function main(argv: string[]): Promise<number> {
  const dry = argv.includes('--dry-run')
  const versao = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version
  const nota = notaDaVersao(readFileSync('CHANGELOG.md', 'utf8'), versao)
  if (!nota) {
    console.error(`CHANGELOG.md não tem a secção [${versao}]`)
    return 1
  }
  console.log(`nota ${nota.version} (${nota.releasedAt}): ${JSON.stringify(nota.items)}`)
  if (dry) {
    console.log('[dry-run] sem escrita na BD')
    return 0
  }
  const url = process.env.SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) {
    console.error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em falta')
    return 1
  }
  const { createClient } = await import('@supabase/supabase-js')
  await publicarNota(createClient(url, chave) as unknown as ClienteNotas, nota)
  console.log('nota publicada')
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

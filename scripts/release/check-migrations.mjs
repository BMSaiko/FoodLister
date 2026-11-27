#!/usr/bin/env node
// Só leitura: falha se houver migrations em supabase/migrations por aplicar na BD de destino.
// Nunca aplica nada. Uso: node scripts/release/check-migrations.mjs
// Env: SUPABASE_DB_URL (URL explícita da BD de prod; sem `link` interativo).
// Sem SUPABASE_DB_URL: aviso `::warning::` e rc 0 (ou rc 1 com --exigir).
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

/** Versões presentes em Local mas ausentes em Remote, a partir de `supabase migration list`. */
export function migracoesPendentes(saida) {
  const pendentes = []
  for (const linha of saida.split('\n')) {
    const [local, remoto] = linha.split('|').map((c) => c.trim())
    if (/^\d{8,}$/.test(local ?? '') && !remoto) pendentes.push(local)
  }
  return pendentes
}

function main(argv) {
  const url = process.env.SUPABASE_DB_URL
  if (!url) {
    const msg = 'SUPABASE_DB_URL ausente: migrations em prod não verificadas'
    if (argv.includes('--exigir')) {
      console.error(`::error::${msg}`)
      return 1
    }
    console.log(`::warning::${msg}`)
    return 0
  }
  const saida = execFileSync('supabase', ['migration', 'list', '--db-url', url], { encoding: 'utf8' })
  const pendentes = migracoesPendentes(saida)
  if (pendentes.length) {
    console.error(
      `::error::${pendentes.length} migration(s) por aplicar em prod: ${pendentes.join(', ')}. ` +
        'Backup (node scripts/db-backup.mjs) e supabase db push --db-url <destino> (decisão do BMS) antes de publicar.',
    )
    return 1
  }
  console.log('migrations em dia')
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exit(main(process.argv.slice(2)))
  } catch (e) {
    // não imprimir o erro bruto: pode conter a URL da BD
    console.error('::error::supabase migration list falhou (ver credenciais/rede)')
    process.exit(1)
  }
}

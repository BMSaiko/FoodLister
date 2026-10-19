// Teste de restauro: carrega o backup mais recente numa base temporária do Postgres local (Docker).
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const root = process.env.FOODLISTER_BACKUP_DIR || join(homedir(), 'Documents', 'code', '_backups', 'foodlister');
const latest = readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{8}-\d{4}-/.test(e.name))
  .map((e) => e.name)
  .sort()
  .pop();
if (!latest) throw new Error(`Sem backups em ${root}`);

const container = 'supabase_db_foodlister';
const db = 'restore_test';

const docker = (args, input) =>
  spawnSync('docker', args, { input, encoding: 'utf8', maxBuffer: 1 << 30 });
const psql = (database, args, input) =>
  docker(['exec', '-i', container, 'psql', '-U', 'postgres', '-d', database, ...args], input);
const errorCount = (r) => ((r.stderr || '').match(/ERROR:/g) || []).length;

// Schemas internos do Supabase (auth, extensions, ...) vêm da base local para as FKs do backup resolverem.
const internals = docker([
  'exec', container, 'pg_dump', '-U', 'postgres', '--schema-only',
  '-n', 'auth', '-n', 'extensions', '-n', 'vault', '-n', 'storage', 'postgres',
]);
if (internals.status !== 0) throw new Error(`pg_dump local falhou: ${internals.stderr}`);

psql('postgres', ['-c', `DROP DATABASE IF EXISTS ${db}`]);
psql('postgres', ['-c', `CREATE DATABASE ${db}`]);

const errInternals = errorCount(psql(db, ['-q'], internals.stdout));
const errSchema = errorCount(psql(db, ['-q'], readFileSync(join(root, latest, 'schema.sql'), 'utf8')));
const errData = errorCount(psql(db, ['-q'], readFileSync(join(root, latest, 'data.sql'), 'utf8')));

const scalar = (sql) => psql(db, ['-tAc', sql]).stdout.trim();
const tables = scalar("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'");
const restaurants = scalar('SELECT count(*) FROM public.restaurants');
psql('postgres', ['-c', `DROP DATABASE ${db}`]);

console.log(
  `Restauro de ${latest}: ${tables} tabelas em public, ${restaurants} restaurantes; erros: internos ${errInternals}, schema ${errSchema}, dados ${errData}`,
);
if (Number(tables) === 0 || !Number(restaurants)) process.exit(1);

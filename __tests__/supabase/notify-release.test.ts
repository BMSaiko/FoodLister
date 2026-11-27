/**
 * Fan-out de notificações ao inserir em `release_notes` (migração `notify_release`).
 * Corre contra o Postgres local (container `supabase_db_foodlister`), cada cenário numa
 * transação com ROLLBACK: a base fica intacta. Sem o container, os testes são ignorados.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const CONTAINER = 'supabase_db_foodlister';

function containerUp(): boolean {
  try {
    return execFileSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' })
      .split('\n')
      .includes(CONTAINER);
  } catch {
    return false;
  }
}

const migrationsDir = path.join(__dirname, '../../supabase/migrations');
const migrationFile = readdirSync(migrationsDir).find((f) => f.endsWith('_notify_release.sql'));
const migration = migrationFile ? readFileSync(path.join(migrationsDir, migrationFile), 'utf8') : '';

/** Executa o script numa transação revertida; devolve as linhas `chave=valor` como mapa. */
function run(body: string): Record<string, string> {
  const script = `BEGIN;\n${migration}\n${body}\nROLLBACK;\n`;
  const out = execFileSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-q', '-tA', '-v', 'ON_ERROR_STOP=1'],
    { input: script, encoding: 'utf8' },
  );
  const map: Record<string, string> = {};
  for (const line of out.split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) map[line.slice(0, i)] = line.slice(i + 1);
  }
  return map;
}

const users = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    `INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-00000000000${i + 1}', 'u${i + 1}@teste.local');`,
  ).join('\n');

const release = (v: string) =>
  `INSERT INTO public.release_notes (version, released_at, title) VALUES ('${v}', '2026-11-27', 'Versão ${v}');`;

const count = (v: string) =>
  `SELECT 'n=' || count(*) FROM public.notifications WHERE type = 'release' AND link = '/novidades/${v}';`;

const describeDb = containerUp() ? describe : describe.skip;

describeDb('notify_release (fan-out em release_notes)', () => {
  it('existe a migração notify_release', () => {
    expect(migrationFile).toBeDefined();
  });

  it('notifica todos os utilizadores, menos quem desligou system_updates', () => {
    const r = run(`
      ${users(3)}
      INSERT INTO public.notification_preferences (user_id, system_updates)
        VALUES ('00000000-0000-0000-0000-000000000003', false);
      ${release('9.9.1')}
      ${count('9.9.1')}
      SELECT 'campos=' || count(*) FROM public.notifications
        WHERE type = 'release' AND link = '/novidades/9.9.1' AND title <> '' AND message = 'Versão 9.9.1' AND read = false;
    `);
    expect(r.n).toBe('2');
    expect(r.campos).toBe('2');
  });

  it('é idempotente por (utilizador, versão)', () => {
    const r = run(`
      ${users(2)}
      ${release('9.9.2')}
      DELETE FROM public.release_notes WHERE version = '9.9.2';
      ${release('9.9.2')}
      ${count('9.9.2')}
    `);
    expect(r.n).toBe('2');
  });

  it('utilizadores criados depois não recebem releases antigas', () => {
    const r = run(`
      ${users(1)}
      ${release('9.9.3')}
      INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-0000000000ff', 'novo@teste.local');
      SELECT 'novo=' || count(*) FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-0000000000ff';
    `);
    expect(r.novo).toBe('0');
  });

  it('uma falha no fan-out não bloqueia a release', () => {
    const r = run(`
      ${users(2)}
      ALTER TABLE public.notifications ADD CONSTRAINT forcar_falha CHECK (false) NOT VALID;
      ${release('9.9.4')}
      SELECT 'release=' || count(*) FROM public.release_notes WHERE version = '9.9.4';
      ${count('9.9.4')}
    `);
    expect(r.release).toBe('1');
    expect(r.n).toBe('0');
  });
});

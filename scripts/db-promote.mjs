// Promoção local -> cloud: backup, dry-run e, só com confirmação explícita, o push.
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const run = (args) =>
  execFileSync(args[0], args.slice(1), { stdio: 'inherit', shell: process.platform === 'win32' });

run(['node', 'scripts/db-backup.mjs', 'pre-promote']);
run(['supabase', 'db', 'push', '--dry-run']);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question('Escreve PUSH para aplicar estas migrations ao cloud: ');
rl.close();

if (answer.trim() !== 'PUSH') {
  console.log('Cancelado: nada foi aplicado.');
  process.exit(0);
}
run(['supabase', 'db', 'push']);

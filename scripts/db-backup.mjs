// Backup do Supabase cloud (schema + dados) para fora do repo, com rotação das últimas 8.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const KEEP = 8;
const root = process.env.FOODLISTER_BACKUP_DIR || join(homedir(), 'Documents', 'code', '_backups', 'foodlister');
const pad = (n) => String(n).padStart(2, '0');
const d = new Date();
const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
const dir = join(root, `${stamp}-${process.argv[2] || 'semanal'}`);
mkdirSync(dir, { recursive: true });

const dump = (file, extra) =>
  execFileSync('supabase', ['db', 'dump', '--linked', '-f', join(dir, file), ...extra], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

dump('schema.sql', []);
dump('data.sql', ['--data-only', '--use-copy']);

for (const f of readdirSync(dir)) {
  console.log(`${f}: ${(statSync(join(dir, f)).size / 1024).toFixed(0)} KB`);
}

const dirs = readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{8}-\d{4}-/.test(e.name))
  .map((e) => e.name)
  .sort();
for (const old of dirs.slice(0, Math.max(0, dirs.length - KEEP))) {
  rmSync(join(root, old), { recursive: true, force: true });
  console.log(`rotação: removido ${old}`);
}
console.log(`Backup em ${dir}`);

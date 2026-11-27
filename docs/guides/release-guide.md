# Release Guide

Como o FoodLister versiona, publica e reverte uma release.

## Fluxo

1. **Ramo de release** a partir de `dev`: `git switch -c chore/release-X.Y.Z dev`.
2. **Bump** (versão pelos commits convencionais desde a última tag `v*`; feat → minor, fix → patch, `!` ou `BREAKING CHANGE:` → major):
   ```bash
   node scripts/release/bump-version.mjs --dry-run   # só mostra a versão
   node scripts/release/bump-version.mjs             # atualiza package.json e CHANGELOG.md
   ```
   `[Unreleased]` passa a `[X.Y.Z] - AAAA-MM-DD`. Sem commits relevantes ou sem itens em `[Unreleased]` não há bump.
3. **PR** do ramo para `dev`, depois PR `dev` → `main` (checks obrigatórios; sem push direto). O job **Release version** do CI falha se `package.json` não subiu face a `main` ou se o CHANGELOG não tem a secção (com itens) dessa versão. Local: `node scripts/release/check-version.mjs --base origin/main`.
4. **Migrations novas** (`supabase/migrations`), antes ou logo após o merge, por decisão do BMS e sempre com backup:
   ```bash
   node scripts/db-backup.mjs pre-release                      # backup fora do repo
   supabase migration list --db-url "$SUPABASE_DB_URL"         # só leitura: o que falta
   supabase db push --db-url "$SUPABASE_DB_URL"                # aplica (destino explícito, sem link)
   ```
   Nunca `supabase db push` sem `--db-url`/`--linked` explícito (sem flag aponta ao stack local).
5. **Em `main`**: o workflow `Deploy` corre; se terminar com sucesso, `Release` (`.github/workflows/release.yml`):
   - lê a versão do `package.json` e a secção do `CHANGELOG.md`;
   - cria a tag `vX.Y.Z` e a GitHub Release, se ainda não existirem;
   - verifica (só leitura) que não há migrations por aplicar em prod; se houver, o job falha antes de publicar (sem `SUPABASE_DB_URL` fica um aviso);
   - publica em `release_notes` todas as versões do CHANGELOG em falta (`scripts/release/publish-notes.ts`), da mais nova para a mais antiga: o trigger `notify_release` notifica só a mais recente (migration `20261127150000`);
   - se qualquer passo falhar, o job fica vermelho e abre-se uma issue.
6. **Verificar** `/novidades`: lista todas as versões do CHANGELOG.

Repetir o workflow é seguro: a Release existente é saltada e só se inserem versões em falta (2.ª execução = 0 inserções).

## Segredos (GitHub Actions)

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (publicar notas); `SUPABASE_DB_URL` (opcional, verificação de migrations). Nunca em `.env*` versionado.

## Dry-run

Actions → **Release** → *Run workflow* com `dry_run=true` (defeito). Mostra as versões em falta e a que notificaria; não cria tag nem Release nem escreve na BD.

Local: `npx tsx scripts/release/publish-notes.ts --dry-run`.

## Rollback

```bash
gh release delete vX.Y.Z --yes --cleanup-tag      # Release e tag
```

Linha em `release_notes` (service role, SQL editor do Supabase):

```sql
delete from release_notes where version = 'X.Y.Z';
```

Reverter o código: PR de revert para `dev` e `main`. Depois de apagar a tag, o próximo bump recalcula a partir da tag `v*` anterior.

## Testes

`npx jest __tests__/scripts/release`

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
3. **PR** do ramo para `dev`, depois merge `dev` → `main` (PR com checks obrigatórios; sem push direto).
4. **Em `main`**: o workflow `Deploy` corre; se terminar com sucesso, `Release` (`.github/workflows/release.yml`):
   - lê a versão do `package.json` e a secção do `CHANGELOG.md`;
   - cria a tag `vX.Y.Z` e a GitHub Release, se ainda não existirem;
   - faz upsert da nota em `release_notes` (`scripts/release/publish-notes.ts`). Falha aqui só assinala o passo; o deploy não é revertido.

Repetir o workflow é seguro: a Release existente é saltada e o upsert é por `version`.

## Segredos (GitHub Actions)

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Nunca em `.env*` versionado.

## Dry-run

Actions → **Release** → *Run workflow* com `dry_run=true` (defeito). Mostra a versão e as notas; não cria tag nem Release nem escreve na BD.

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

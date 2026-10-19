# Fluxo de trabalho com o Supabase

Desenvolve-se contra o Supabase **local** (Docker). O projeto cloud (`kgzeoyubgchhvfmtyqsk`) só recebe alterações por promoção manual do BMS.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run db:start` / `db:stop` | Liga/desliga o Supabase local (Docker). |
| `npm run db:reset` | Recria a base local: aplica `supabase/migrations/` e `supabase/seed/`. |
| `npm run db:diff` | Mostra diferenças entre a base local e as migrations. |
| `npm run db:backup` | `supabase db dump` (schema + dados) do cloud, só leitura, para `C:\Users\bruno\Documents\code\_backups\foodlister` (rotação das últimas 8). |
| `npm run db:restore-test` | Restaura o último backup num Postgres temporário local. `--verbose` lista os erros. |
| `npm run db:promote` | Backup, `supabase db push --dry-run` e pergunta; só `PUSH` aplica ao cloud. |

Um backup semanal corre na tarefa do Windows `FoodListerDbBackup` (domingo, 10:00).

## Criar uma migration

1. `npx supabase migration new <nome_em_snake_case>` (cria `supabase/migrations/<timestamp>_<nome>.sql`; a baseline `20261019000000_baseline.sql` é o ponto de partida).
2. Escrever o SQL, `npm run db:reset` e confirmar que aplica sem erros.
3. Testar a app contra o local (`.env.local` aponta para `http://127.0.0.1:54321`).
4. Commit no ramo `feat|fix|chore/<slug>` e PR para `dev`.

## Promover para o cloud (só o BMS)

1. `npm run db:promote`: faz o backup e mostra o que o `db push` aplicaria.
2. Rever a lista de migrations. Só então escrever `PUSH`; qualquer outra resposta termina em "Cancelado" sem aplicar nada.
3. Se o backup correu mal ou o dry-run mostra migrations inesperadas, parar.

### Histórico do cloud desalinhado

`supabase migration list` mostra a baseline só em "Local": o cloud não tem histórico registado e o dry-run quer aplicar a baseline inteira, o que colidiria com as tabelas que já existem. Antes do primeiro push real, o BMS marca a baseline como já aplicada:

```
npx supabase migration repair --status applied 20261019000000
```

Isto só escreve na tabela de histórico (`supabase_migrations.schema_migrations`), mas é uma escrita no cloud: exige ok explícito do BMS.

## Reverter

- Local: `npm run db:reset` volta ao estado das migrations.
- Cloud: não há "undo". Escrever uma migration nova que desfaz, ou restaurar o backup de `_backups/foodlister` (primeiro com `db:restore-test` para validar).

## MCP Supabase local (Claude Code)

`.mcp.json` liga o servidor `supabase-local` a `http://127.0.0.1:54321/mcp`, sem chaves. O MCP carrega no arranque do Claude Code, por isso exige uma sessão aberta **depois** de `db:start`.

- Ferramentas expostas: `search_docs`, `list_tables`, `list_extensions`, `list_migrations`, `apply_migration`, `execute_sql`, `get_logs`, `get_advisors`, `get_project_url`, `get_publishable_keys`, `generate_typescript_types`.
- `list_tables` sem argumentos devolve `public`; passar `schemas` explicitamente falhou uma vez com 502 (o Studio local fechou a ligação), por isso preferir os argumentos por omissão.
- O MCP local escreve (`apply_migration`, `execute_sql`) e por isso só aponta ao local. Nunca configurar o MCP contra o cloud.
- Uma migration aplicada por `apply_migration` fica em `list_migrations` mas não cria ficheiro em `supabase/migrations/`; para ficar no repo, escrevê-la com `migration new`.

## O que o Claude pode e não pode tocar

| Pode | Não pode sem ok do BMS |
|---|---|
| Base local (MCP, `db:reset`, `migration new`) | `supabase db push`, `migration repair`, `link` ao cloud |
| `db:backup` e `db:restore-test` (cloud só em leitura) | Escrever ou apagar dados no cloud |
| `db:promote` até à pergunta (responder fora de `PUSH`) | Ler `.env*` ou colar chaves (o BMS escreve-as em `.env.local`) |

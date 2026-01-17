# Migração de Dados - BMS User Association

Este documento explica como associar os dados existentes criados pelo usuário "BMS" ao usuário autenticado com email `1221514@isep.ipp.pt`.

**Nota:** Durante a migração, o display name do usuário será automaticamente definido como "BMS" e todos os `creator_name` dos restaurantes/listas serão atualizados para "BMS".

## 📋 Pré-requisitos

1. **Usuário deve existir no Supabase Auth** com email `1221514@isep.ipp.pt`
2. **Migration 001** deve ter sido executada (adiciona campos de autenticação)
3. **Dados existentes** criados por "BMS" devem existir nas tabelas

## 🔄 Métodos de Migração

### Método 1: Migration Automática (Recomendado)

Execute a migration SQL diretamente no Supabase:

```bash
# Via Supabase CLI
supabase db push

# Ou execute o arquivo manualmente no SQL Editor do Supabase
supabase/migrations/002_migrate_bms_user.sql
```

### Método 2: Script Node.js

```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com SUPABASE_SERVICE_ROLE_KEY

# Executar script
node scripts/migrate-bms-user.js
```

### Método 3: SQL Manual (Passo a Passo)

Siga os comandos em `supabase/manual_migration_bms.sql`:

1. **Encontrar o ID do usuário**
2. **Atualizar display name para "BMS"**
3. **Migrar restaurantes**
4. **Migrar listas**
5. **Verificar migração**

## 🔍 Verificação

Após a migração, execute estas queries para verificar:

```sql
-- Contar dados associados ao usuário
SELECT
  (SELECT COUNT(*) FROM restaurants WHERE creator_id = 'USER_ID') as restaurants,
  (SELECT COUNT(*) FROM lists WHERE creator_id = 'USER_ID') as lists;

-- Verificar se ainda há dados não migrados
SELECT COUNT(*) as unmigrated_restaurants
FROM restaurants
WHERE creator = 'BMS' AND creator_id IS NULL;

SELECT COUNT(*) as unmigrated_lists
FROM lists
WHERE creator = 'BMS' AND creator_id IS NULL;
```

## ⚠️ Notas Importantes

- **Backup:** Faça backup dos dados antes de executar qualquer migração
- **RLS:** As políticas de segurança serão aplicadas automaticamente após a migração
- **Performance:** A migration cria índices para otimizar queries por `creator_id`
- **Rollback:** Para reverter, seria necessário recriar os dados (backup recomendado)

## 🎯 Resultado Esperado

Após execução bem-sucedida:
- ✅ Todos os restaurantes com `creator = 'BMS'` terão `creator_id` definido
- ✅ Todos as listas com `creator = 'BMS'` terão `creator_id` definido
- ✅ O usuário poderá editar/excluir apenas seus próprios dados
- ✅ Dados ficam protegidos por Row Level Security

## 🔧 Correções Adicionais

### Corrigir creator_name de "1221514@isep.ipp.pt" para "BMS"

Se alguns dados têm `creator_name` como o email em vez de "BMS", execute:

```bash
# Query automática
# Execute no SQL Editor do Supabase
supabase/fix_creator_names_auto.sql
```

Ou manualmente:

```sql
-- Execute no SQL Editor do Supabase
supabase/fix_creator_names.sql
```

## 🆘 Troubleshooting

### Erro: "User not found"
- Certifique-se que o usuário com email `1221514@isep.ipp.pt` foi criado
- Verifique se o email está correto (case-sensitive)

### Erro: "No data to migrate"
- Verifique se existem dados com `creator = 'BMS'`
- Dados podem já ter sido migrados anteriormente

### Erro: "Permission denied"
- Para o script Node.js, use `SUPABASE_SERVICE_ROLE_KEY`
- Para SQL manual, execute como administrador do projeto

### Dados com creator_name errado
- Execute as queries de correção em `supabase/fix_creator_names*.sql`
- Verifique se o display name do usuário está correto

# Database Agent - FoodList
<!-- TRIGGER: Lê quando crias tabelas, migrations SQL, RLS policies, indexes, ou otimizas queries -->

## Especialidade
PostgreSQL, Supabase, Migrations, Row Level Security (RLS), SQL Optimization

---

## Tech Stack Obrigatória

| Tecnologia | Uso |
|------------|-----|
| PostgreSQL 15+ | Base de dados principal |
| Supabase | ORM e client |
| SQL | Queries manuais e migrations |

---

## Padrões do Projeto

### Estrutura de Migrations
```
supabase/
├── migrations/          # Migrations versionadas
├── database.sql         # Schema principal
├── create_reviews_table.sql
├── fix_duplicate_policy.sql
├── optimizations.sql
└── seed_*.sql           # Seed data
```

### Naming Conventions
- **Tabelas**: plural, snake_case (`restaurants`, `user_lists`)
- **Colunas**: snake_case (`created_at`, `user_id`, `restaurant_name`)
- **Indexes**: `idx_[table]_[columns]` (`idx_restaurants_name`)
- **Foreign Keys**: `[table]_[column]_fkey` (`user_lists_user_id_fkey`)
- **RLS Policies**: `[table]_[action]_policy` (`restaurants_select_policy`)

---

## Checklist para Nova Tabela

- [ ] Definir primary key (`uuid DEFAULT gen_random_uuid()`)
- [ ] Adicionar `created_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] Adicionar `updated_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] Definir foreign keys com `ON DELETE` appropriado
- [ ] Criar RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] Adicionar indexes para colunas de pesquisa frequente
- [ ] Adicionar trigger para `updated_at`
- [ ] Criar migration em `supabase/migrations/`
- [ ] Atualizar `types/database.ts`
- [ ] Testar queries manualmente

---

## Template de Tabela

```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  phone VARCHAR(50),
  cuisine_type VARCHAR(100),
  rating DECIMAL(2, 1) DEFAULT 0,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);

-- RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "restaurants_select_policy"
  ON restaurants FOR SELECT
  USING (true);  -- Público

CREATE POLICY "restaurants_insert_policy"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "restaurants_update_policy"
  ON restaurants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "restaurants_delete_policy"
  ON restaurants FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## RLS Policy Patterns

### Público (leitura)
```sql
CREATE POLICY "table_select_policy"
  ON table_name FOR SELECT
  USING (true);
```

### Apenas dono
```sql
CREATE POLICY "table_owner_policy"
  ON table_name FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Autenticados podem ler, donos podem escrever
```sql
CREATE POLICY "table_select_authenticated"
  ON table_name FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "table_owner_write"
  ON table_name FOR INSERT/UPDATE/DELETE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Query Optimization

### Full-Text Search
```sql
-- Criar coluna de busca
ALTER TABLE restaurants ADD COLUMN search_vector tsvector;

-- Trigger para atualizar
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.cuisine_type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_search_vector
  BEFORE INSERT OR UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Index
CREATE INDEX idx_restaurants_search ON restaurants USING GIN(search_vector);

-- Query
SELECT * FROM restaurants
WHERE search_vector @@ to_tsquery('english', 'italian & pizza');
```

### Query Patterns a Evitar

| ❌ Evitar | ✅ Usar |
|-----------|---------|
| `SELECT *` | `SELECT id, name, ...` |
| Subqueries não correlacionadas | JOINs |
| LIKE '%term%' | Full-text search |
| Múltiplas queries | CTEs ou JOINs |
| Sem WHERE em tabelas grandes | Filtros específicos |

---

## Erros Comuns a Evitar

1. **Esquecer RLS policies** - tabela fica inacessível
2. **Duplicate policies** - usar `IF NOT EXISTS` ou verificar antes
3. **Não criar indexes** - queries lentas em tabelas grandes
4. **Foreign keys sem ON DELETE** - orphan records
5. **Não usar transações** em operações múltiplas
6. **UUID vs BIGINT** - consistency em todo o projeto
7. **Não testar migrations** em ambiente de staging

---

## Migration Template

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_table_name.sql

-- Up migration
BEGIN;

CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_table_name_column ON table_name(column);

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "table_name_select_policy" ON table_name FOR SELECT USING (true);
CREATE POLICY "table_name_insert_policy" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "table_name_update_policy" ON table_name FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "table_name_delete_policy" ON table_name FOR DELETE USING (auth.uid() = user_id);

COMMIT;

-- Down migration (rollback)
-- DROP TABLE IF EXISTS table_name CASCADE;
```

---

## Seed Data Pattern

```sql
-- supabase/seed_cuisine_types.sql

INSERT INTO cuisine_types (name) VALUES
  ('Italian'),
  ('Japanese'),
  ('Chinese'),
  ('Mexican'),
  ('Indian'),
  ('Thai'),
  ('Portuguese'),
  ('French')
ON CONFLICT (name) DO NOTHING;
```

---

*Last updated: 2026-04-05*
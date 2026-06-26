# FoodLister — Supabase Database

## Structure

```
supabase/
├── schema.sql              # Canonical schema (idempotent, complete setup)
├── reset_and_seed.sql      # Dev utility: TRUNCATE all tables + re-seed
├── migrations/             # Sequential migrations 000→051
├── seed/                   # Idempotent seed data
└── README.md
```

## How to apply

### Fresh setup
```bash
psql -f schema.sql
psql -f seed/seed_cuisine_types.sql
psql -f seed/seed_features_and_dietary.sql
psql -f seed/seed_all_filters.sql
```

### Reset for development
```bash
psql -f reset_and_seed.sql
```

### Apply migrations incrementally
```bash
for f in migrations/*.sql; do psql -f "$f"; done
```

## Migration history

Migrations are sequential `000`→`051`. Apply in order.
All migrations use `IF NOT EXISTS` / idempotent patterns where possible.

### Cleanup performed (2026-06-26)

- Removed 9 visit-system zombie migrations (system was created then fully removed)
- Removed 1 duplicate migration (020 = 20260206140946)
- Removed 1 catch-all migration (999)
- Removed 7 fix/test files from root (debugging patches — git history preserves)
- Removed 3 redundant root files (duplicated by migrations)
- Merged 4 split performance migrations (021_*) into single 016
- Consolidated 3 schema variants into 1 canonical `schema.sql`
- Renumbered all migrations: eliminated gaps, duplicate prefixes, and timestamp formats

**Before:** 82 files (17 root + 65 migrations)
**After:** 57 files (2 root + 52 migrations + 3 seed)

## Seed data

| File | Content |
|------|---------|
| `seed_cuisine_types.sql` | Cuisine type categories |
| `seed_features_and_dietary.sql` | Restaurant features + dietary options |
| `seed_all_filters.sql` | All filter values (includes cuisine_types subset) |

All seed files use `INSERT ... ON CONFLICT` for idempotency.

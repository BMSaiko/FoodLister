# FoodLister — Documentation Index

One canonical document per topic. Files marked *redirect* only point to the canonical one.

## Product and architecture
| Document | Topic |
|---|---|
| [PRD.md](PRD.md) | Product requirements |
| [ARCHITECTURE.md](ARCHITECTURE.md) | **Canonical architecture** (stack, folders, data flow, key design patterns, deployment) |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Design system |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents |
| [FEATURES-WORKFLOW.md](FEATURES-WORKFLOW.md) | Feature visualization workflow |
| [architecture/architecture-overview.md](architecture/architecture-overview.md) | *redirect* → ARCHITECTURE.md |

## Decisions (ADR)
| Document | Topic |
|---|---|
| [adr/001-architecture-overview.md](adr/001-architecture-overview.md) | Architecture overview decision |
| [adr/002-subscription-system.md](adr/002-subscription-system.md) | Subscription system design |

## API and database
| Document | Topic |
|---|---|
| [api/api-endpoints-reference.md](api/api-endpoints-reference.md) | **Canonical API reference** (all route groups) |
| [api/api-documentation.md](api/api-documentation.md) | *redirect* → api-endpoints-reference.md |
| [database/database-schema-reference.md](database/database-schema-reference.md) | **Canonical database reference** (ERD, tables, indexes, migrations, RLS, queries, types) |
| [database/database-schema.md](database/database-schema.md) | *redirect* → database-schema-reference.md |

## Features
| Document | Topic |
|---|---|
| [features/feature-create-pipeline.md](features/feature-create-pipeline.md) | Create restaurant/list pipeline |
| [features/lists-feature-roadmap.md](features/lists-feature-roadmap.md) | Lists feature roadmap |

## Guides
| Document | Topic |
|---|---|
| [guides/git-workflow.md](guides/git-workflow.md) | Git workflow (dev/main, PRs, releases) |
| [guides/supabase-workflow.md](guides/supabase-workflow.md) | Supabase local, backups e promoção |
| [guides/brand-mascote.md](guides/brand-mascote.md) | Marca e mascote Tovi |
| [guides/development-guide.md](guides/development-guide.md) | Development |
| [guides/deployment-guide.md](guides/deployment-guide.md) | Deployment |
| [guides/contribution-guide.md](guides/contribution-guide.md) | Contributing |
| [guides/error-handling-guide.md](guides/error-handling-guide.md) | Error handling |
| [guides/refactoring-guide.md](guides/refactoring-guide.md) | Refactoring |
| [guides/advanced-filters-guide.md](guides/advanced-filters-guide.md) | Advanced restaurant filters |
| [guides/fix-review-count-error.md](guides/fix-review-count-error.md) | Fix for `restaurants.review_count` error |

## Setup, reference, progress, tasks
| Document | Topic |
|---|---|
| [setup/github-secrets-setup.md](setup/github-secrets-setup.md) | GitHub Secrets setup |
| [reference/PROJECT-SKILLS.md](reference/PROJECT-SKILLS.md) | Required skills and competencies |
| [reference/prompt-templates.md](reference/prompt-templates.md) | Prompt templates |
| [reference/subagents-repetitive-task-rule.md](reference/subagents-repetitive-task-rule.md) | Sub-agents rule for repetitive tasks |
| [progress/progress-tracker.md](progress/progress-tracker.md) | Progress tracker (historical) |
| [progress/SESSION-REPORT.md](progress/SESSION-REPORT.md) | Session report (historical, Portuguese) |
| [progress/future-issues.md](progress/future-issues.md) | Future issues |
| [tasks/TASKS_ROADMAP.md](tasks/TASKS_ROADMAP.md) | Task roadmap |

## Verified facts (2026-10-17)
- Tests: 61 suites, 436 tests passing (`npm test`, medido 3x em 2026-10-21; no Windows com PATH > 8191 caracteres deduplicar o PATH antes, senão `jest` "is not recognized").
- Jest (`npm test`) cobre `__tests__/`; Vitest (`npx vitest`) corre as stories do Storybook (`.storybook`); Playwright (`npx playwright test`) corre `e2e/` e precisa da app em `localhost:3000`.
- Jest 29.7 (`package.json`), React 19, Next.js 15, Tailwind 3.4, TypeScript 5.8.2.
- Migrations: 81 files, `000`–`211`.

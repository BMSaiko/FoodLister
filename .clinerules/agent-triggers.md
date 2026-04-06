## Brief overview
  Mapeamento explícito de tarefas para agents. Lê o agent correto antes de começar qualquer tarefa.

## Agent Triggers

### Frontend Agent (`agents/frontend-agent.md`)
**Lê quando:**
- Criar componentes React (Server ou Client)
- Criar hooks personalizados
- Criar páginas Next.js
- Trabalhar com Framer Motion
- Implementar responsive design
- Adicionar `'use client'` ou remover

### Backend Agent (`agents/backend-agent.md`)
**Lê quando:**
- Criar API routes (`app/api/`)
- Integrar com Supabase server-side
- Implementar upload de imagens (Cloudinary)
- Configurar autenticação
- Adicionar rate limiting
- Criar middleware

### Database Agent (`agents/database-agent.md`)
**Lê quando:**
- Criar novas tabelas
- Escrever migrations SQL
- Configurar RLS policies
- Otimizar queries
- Criar indexes
- Alterar schema da base de dados

### Testing Agent (`agents/testing-agent.md`)
**Lê quando:**
- Escrever testes unitários
- Escrever testes de componentes
- Escrever testes de API
- Mock Supabase
- Configurar coverage
- Criar testes de hooks

### UI/UX Agent (`agents/ui-ux-agent.md`)
**Lê quando:**
- Criar componentes UI reutilizáveis
- Implementar animações
- Melhorar acessibilidade (a11y)
- Design de formulários
- Implementar mobile UX
- Criar loading states / skeletons

### DevOps Agent (`agents/devops-agent.md`)
**Lê quando:**
- Configurar CI/CD
- Deploy para Vercel
- Configurar environment variables
- Otimizar performance
- Configurar ESLint
- Monitoring e logging

## Task → Agent Mapping

| Tarefa | Primary Agent | Secondary Agent |
|--------|---------------|-----------------|
| Novo componente React | `frontend-agent.md` | `ui-ux-agent.md` |
| Novo endpoint API | `backend-agent.md` | `database-agent.md` |
| Migration de base de dados | `database-agent.md` | `backend-agent.md` |
| Escrever testes | `testing-agent.md` | - |
| Componente UI com animações | `ui-ux-agent.md` | `frontend-agent.md` |
| Deploy ou CI/CD | `devops-agent.md` | - |
| Formulário com validação | `frontend-agent.md` | `ui-ux-agent.md` |
| Upload de imagens | `backend-agent.md` | `ui-ux-agent.md` |
| Otimizar queries SQL | `database-agent.md` | - |
| Melhorar acessibilidade | `ui-ux-agent.md` | `frontend-agent.md` |

## Regra de Ouro
**Sempre lê o agent primário ANTES de começar a tarefa.** Os agents contêm checklists, templates e padrões específicos do projeto que devem ser seguidos.
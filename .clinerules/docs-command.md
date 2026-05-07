## Brief overview
Regras para o comando `/docs` no projeto FoodLister. Este comando lê toda a codebase e atualiza toda a documentação do projeto, incluindo todos os documentos no diretório `/docs` e o README do projeto.

## Quando usar o comando /docs
- Disparado explicitamente pelo utilizador via comando `/docs`
- Deve ser executado quando a documentação precisa de ser atualizada para refletir o estado atual da codebase
- Útil após alterações significativas na codebase para manter a documentação sincronizada

## Passo 1: Ler toda a codebase
Antes de atualizar qualquer documentação, ler e compreender minuciosamente o estado atual da codebase:

### Ficheiros prioritários para leitura:
- `app/` - Todas as rotas API, páginas e componentes
- `components/` - Todos os componentes UI
- `hooks/` - Todos os hooks personalizados
- `libs/` - Todas as bibliotecas utilitárias e clientes API
- `contexts/` - Todos os context providers
- `types/` - Definições de tipos
- `utils/` - Funções utilitárias
- `supabase/` - Schemas de base de dados e migrations
- `__tests__/` - Ficheiros de teste para entender comportamento esperado

### Usar subagents para codebases extensas:
- Quando a codebase é extensa, usar `use_subagents` para paralelizar a leitura de múltiplos diretórios
- Segue a regra em `.clinerules/use-subagents-repetitive.md` para tarefas repetitivas em múltiplos ficheiros

## Passo 2: Atualizar toda a documentação no diretório `/docs`
Atualizar TODOS os ficheiros no diretório `docs/` para refletir o estado atual da codebase:

### docs/api/
- `api-documentation.md` - Atualizar com a estrutura API atual
- `api-endpoints-reference.md` - Atualizar toda a documentação de endpoints

### docs/architecture/
- `architecture-overview.md` - Atualizar padrões arquiteturais e decisões

### docs/database/
- `database-schema-reference.md` - Atualizar com o schema atual
- `database-schema.md` - Atualizar documentação da estrutura da base de dados

### docs/features/
- `feature-create-pipeline.md` - Atualizar documentação de funcionalidades
- `lists-feature-roadmap.md` - Atualizar roadmap de funcionalidades

### docs/guides/
- `advanced-filters-guide.md` - Atualizar guias
- `deployment-guide.md` - Atualizar instruções de deployment
- `development-guide.md` - Atualizar diretrizes de desenvolvimento
- `error-handling-guide.md` - Atualizar documentação de tratamento de erros
- `fix-review-count-error.md` - Atualizar guias de resolução de problemas
- `refactoring-guide.md` - Atualizar documentação de refactoring

### docs/progress/
- `future-issues.md` - Atualizar com issues conhecidas atuais
- `progress-tracker.md` - Atualizar tracking de progresso
- `SESSION-REPORT.md` - Atualizar relatórios de sessão

### docs/reference/
- `PROJECT-SKILLS.md` - Atualizar documentação de skills do projeto
- `prompt-templates.md` - Atualizar templates de prompts
- `subagents-repetitive-task-rule.md` - Atualizar regras de subagents

### docs/setup/
- `github-secrets-setup.md` - Atualizar instruções de setup

### docs/tasks/
- `TASKS_5HOURS.md` - Atualizar listas de tarefas

## Passo 3: Atualizar README.md
Atualizar o ficheiro `README.md` na raiz do projeto para refletir:
- Estado atual do projeto
- Funcionalidades atualizadas
- Instruções de setup atuais
- Quaisquer novas dependências ou requisitos
- Links de documentação atualizados

## Diretrizes para atualização de documentação
- Garantir que toda a documentação reflete o estado ATUAL da codebase
- Remover informações desatualizadas
- Adicionar novas informações para funcionalidades implementadas recentemente
- Manter a documentação consistente em todos os ficheiros
- Usar linguagem clara e concisa
- Incluir exemplos de código quando relevante
- Atualizar quaisquer diagramas ou auxiliares visuais se presentes

## Ordem de Execução Resumida
1. Ler toda a codebase (usar subagents se necessário para eficiência)
2. Atualizar todos os ficheiros de documentação no diretório `docs/`
3. Atualizar `README.md` na raiz do projeto
4. Reportar ao utilizador: documentação atualizada e resumo das alterações

## Notas Específicas do Projeto FoodLister
- **Componentes**: Documentar corretamente Server Components vs Client Components
- **State Management**: Documentar Context API (Auth, Filters, Modal) + custom hooks
- **Styling**: Documentar TailwindCSS 3 com CSS variables (design system)
- **Database**: Documentar schema Supabase e políticas RLS
- **API**: Documentar rotas Next.js API e uso de cliente supabase
- **Tests**: Documentar estrutura de testes em `__tests__/` espelhando app/, components/, hooks/

## Exemplo de Uso de Subagents para /docs
```
<use_subagents>
<prompt_1>Ler e analisar todos os ficheiros em docs/api/ e identificar o que precisa de ser atualizado baseado no estado atual da codebase</prompt_1>
<prompt_2>Ler e analisar todos os ficheiros em docs/guides/ e identificar o que precisa de ser atualizado baseado no estado atual da codebase</prompt_2>
<prompt_3>Ler e analisar todos os ficheiros em docs/database/ e docs/features/ e identificar o que precisa de ser atualizado baseado no estado atual da codebase</prompt_3>
<prompt_4>Ler e analisar todos os ficheiros em docs/progress/ e identificar o que precisa de ser atualizado baseado no estado atual da codebase</prompt_4>
<prompt_5>Ler e analisar todos os ficheiros em docs/reference/ e docs/setup/ e identificar o que precisa de ser atualizado baseado no estado atual da codebase</prompt_5>
</use_subagents>
```

Depois de analisar os resultados dos subagents, atualizar cada ficheiro individualmente usando `write_to_file` ou `replace_in_file` conforme apropriado.
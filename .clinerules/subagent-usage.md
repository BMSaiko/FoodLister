## Brief overview
  Regra obrigatória para uso de subagents em todas as tarefas do projeto FoodLister.

## Uso de subagents

### Regra principal
  - **DEVES usar subagents em TODAS as tarefas** - tanto em modo planning como em modo acting
  - Isto não é opcional, é um requisito obrigatório para cada tarefa

### Planning Mode
  - Usa subagents para analisar o código existente antes de propor soluções
  - Usa subagents para ler múltiplos ficheiros em paralelo
  - Usa subagents para investigar bugs e entender o impacto de mudanças
  - Lança 2-5 subagents em paralelo para cobrir diferentes aspetos

### Acting Mode
  - Usa subagents para executar tarefas em paralelo
  - Distribui trabalho independente por múltiplos subagents
  - Se houver 2+ tarefas, distribui por subagents e executa simultaneamente
  - Exemplo: criar componente + criar teste + atualizar exports

### Exemplos de distribuição

| Tarefa | Subagent 1 | Subagent 2 | Subagent 3 |
|--------|------------|------------|------------|
| Criar feature | Criar componente | Criar hook | Criar teste |
| Adicionar API | Criar route | Atualizar docs | Adicionar validação |
| Database change | Escrever migration | Atualizar types | Atualizar docs |
| Refactor | Atualizar componente | Atualizar testes | Atualizar hooks |

## Projeto contexto
  - Projeto: FoodLister (Next.js + Supabase)
  - Diretório: C:\Users\bruno\Documents\foodlist
  - Stack: Next.js, TypeScript, Supabase, TailwindCSS, React
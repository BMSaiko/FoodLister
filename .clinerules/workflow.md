## Brief overview
  Regras de workflow para o projeto FoodLister, focadas em subagents e estratégia de desenvolvimento.

## Uso de subagents (OBRIGATÓRIO)

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

## Estratégia de desenvolvimento
  - **Sempre que a tarefa for complexa, usar subagents** para explorar código, investigar bugs ou analisar múltiplos ficheiros em paralelo
  - Subagents são úteis para investigação inicial antes de implementar correções
  - Exemplo: usar `use_subagents` para ler múltiplos ficheiros de API e hooks simultaneamente

## Abordagem de debugging
  - Investigar tanto o frontend como o backend quando há erros de API
  - Verificar validações em ambos os lados (cliente e servidor)
  - Updates parciais devem ser suportados (ex: mudar apenas um campo sem enviar todos os outros)

## Finalização de tarefas
  - **Sempre que finalizar uma tarefa, correr `npm run build` e `npm run lint`** para verificar erros de compilação e estilo
  - Garantir que não há erros antes de fazer commit

## Referência de skills obrigatória
  - **Antes de iniciar qualquer tarefa**, consultar o ficheiro `CLINE.md` para identificar as competências e tecnologias relevantes
  - Verificar quais as categorias de skills aplicáveis à tarefa atual (ex: Frontend, Backend, Testing, Performance, etc.)
  - Garantir que a implementação segue as melhores práticas descritas nas skills relevantes
  - Referenciar as skills aplicáveis no plano da tarefa quando apropriado

## Operações multi-ficheiro
  - **Sempre que precisares de aceder ou escrever em mais do que 1 ficheiro, deves usar subagents**
  - Isto inclui: ler múltiplos ficheiros simultaneamente, escrever em múltiplos ficheiros na mesma operação, investigar bugs que envolvem vários componentes, implementar features que tocam em várias camadas (API, UI, hooks, etc.)
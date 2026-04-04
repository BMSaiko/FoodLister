## Brief overview
  Regras de desenvolvimento para o projeto FoodLister, focadas em estratégias de resolução de problemas complexos.

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

## Projeto contexto
  - Projeto: FoodLister (Next.js + Supabase)
  - Diretório: C:\Users\bruno\Documents\foodlist
  - Stack: Next.js, TypeScript, Supabase, TailwindCSS, React
## Brief overview
  Regra de desenvolvimento para operações que envolvem múltiplos ficheiros no projeto FoodLister.

## Uso de subagents para operações multi-ficheiro
  - **Sempre que precisares de aceder ou escrever em mais do que 1 ficheiro, deves usar subagents**
  - Isto inclui:
    - Ler múltiplos ficheiros simultaneamente para análise
    - Escrever em múltiplos ficheiros na mesma operação
    - Investigar bugs que envolvem vários componentes
    - Implementar features que tocam em várias camadas (API, UI, hooks, etc.)
  - Exemplo: usar `use_subagents` para ler API routes, hooks e componentes em paralelo
  - Exemplo: usar `use_subagents` para investigar por que um contador não funciona corretamente

## Projeto contexto
  - Projeto: FoodLister (Next.js + Supabase)
  - Diretório: C:\Users\bruno\Documents\foodlist
  - Stack: Next.js, TypeScript, Supabase, TailwindCSS, React
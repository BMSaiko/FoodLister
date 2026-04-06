## Brief overview
  Contexto do projeto FoodLister para o agente Cline.

## Projeto
  - **Nome**: FoodLister
  - **Diretório**: C:\Users\bruno\Documents\foodlist
  - **Remote**: origin: https://github.com/BMSaiko/FoodLister.git

## Stack técnica

### Frontend
  - Next.js 15 (App Router)
  - React 19
  - TypeScript 5.8 (strict mode)
  - Tailwind CSS v4
  - Framer Motion 12.x
  - Lucide React + React Icons
  - React Hook Form
  - react-toastify

### Backend & Database
  - Supabase (@supabase/ssr, @supabase/supabase-js)
  - PostgreSQL
  - Cloudinary (image storage)

### Testing & Quality
  - Jest + ts-jest
  - @testing-library/react
  - ESLint + @typescript-eslint

## Estrutura de diretórios
```
app/          - Next.js App Router pages e API routes
components/   - Componentes React reutilizáveis
contexts/     - React Context providers (Auth, Filters, Modal)
hooks/        - Custom React hooks organizados por domínio
libs/         - Utilitários e API clients
utils/        - Funções helper
supabase/     - Migrations e SQL files
__tests__/    - Test files
agents/       - Agent reference files
docs/         - Documentação do projeto
instructions/ - Guias passo-a-passo para tarefas comuns
snippets/     - Templates de código
```

## Convenções chave
  - Server Components por defeito, `'use client'` apenas quando necessário
  - Tailwind CSS exclusivamente (sem CSS inline)
  - Mobile-first responsive design
  - TypeScript strict mode, sem `any` (usar `unknown`)
  - Context API para estado global (Auth, Filters, Modal)
  - RLS policies em todas as tabelas
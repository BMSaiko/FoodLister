## Brief overview
Regras para o comando `/update` no projeto FoodLister. Este comando atualiza o memory bank, analisa alterações, cria commits (separados quando faz sentido) e faz push para o repositório.

## Quando usar o comando /update
- Disparado explicitamente pelo utilizador via comando `/update`
- Deve ser executado no final de uma sessão de trabalho com alterações significativas
- Pode ser usado para sincronizar o estado do projeto com o repositório remoto

## Passo 1: Atualizar Memory Bank
Antes de qualquer commit, atualizar TODOS os ficheiros em `memory-bank/`:

### memory-bank/activeContext.md
- Atualizar **Latest Commit** com o hash atual
- Registar novas funcionalidades implementadas
- Documentar correções de bugs (com descrição do problema e solução)
- Atualizar **Session Context for AI Assistants** com novo hash
- Limpar itens concluídos e adicionar novos próximos passos

### memory-bank/progress.md
- Atualizar percentagens de conclusão das funcionalidades
- Marcar tarefas concluídas com - [x]
- Adicionar novas funcionalidades implementadas
- Atualizar **Latest Commit** e estatísticas do projeto
- Documentar novos bugs conhecidos ou technical debt

### memory-bank/systemPatterns.md
- Atualizar se novos padrões de design foram introduzidos
- Documentar novas arquiteturas de componentes ou hooks

### memory-bank/techContext.md
- Atualizar se novas dependências foram adicionadas
- Registar alterações na configuração de build ou deploy

### memory-bank/projectbrief.md e productContext.md
- Atualizar apenas se houver mudanças significativas nos objetivos ou escopo

## Passo 2: Analisar Alterações (git status e git diff)
Executar comandos para entender o estado atual:

```bash
git status
git diff --stat
git diff --cached --stat
```

### Critérios para separação de commits:
1. **Database migrations**: Commits separados para ficheiros em `supabase/migrations/`
2. **Componentes vs API**: Separar alterações de frontend (components/, hooks/) de backend (app/api/, libs/)
3. **Correções de bugs**: Commits dedicados para bug fixes com mensagem clara
4. **Documentação**: Commits separados para alterações em `docs/` ou `memory-bank/`
5. **Configuração**: Separar alterações de configuração (package.json, config files)

### Formato da mensagem de commit (Conventional Commits):
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types permitidos**:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ficheiros CSS (sem alteração de lógica)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Alterações de build, deps, configs
- `perf`: Melhorias de performance
- `migrate`: Database migrations

**Scopes comuns**:
- `api`, `auth`, `restaurants`, `lists`, `reviews`, `ui`, `db`, `docs`, `config`, `tests`

**Exemplos**:
```
feat(lists): add collaboration feature with role-based access
fix(api): resolve 404 error in lists/[id] route
docs(memory-bank): update progress tracking for Q3
migrate(db): add user_stats table and triggers
chore(deps): update supabase-js to 2.49.4
```

## Passo 3: Criar Commits
Para cada grupo lógico de alterações:

```bash
# Adicionar ficheiros específicos
git add <ficheiros-específicos>

# Commit com mensagem descritiva
git commit -m "type(scope): description"
```

### Regras para commits:
- **Nunca fazer commit de `.env.local`** (já deve estar no .gitignore)
- **Verificar se não há ficheiros sensíveis** antes do commit
- **Commits atómicos**: Cada commit deve representar uma mudança lógica completa
- **Mensagens em inglês** seguindo Conventional Commits
- **Referências a issues**: Adicionar `#<issue-number>` no footer se aplicável

## Passo 4: Push para Repositório
Após criar todos os commits:

```bash
# Verificar branch atual
git branch

# Push para a branch atual
git push origin <branch-name>
```

### Regras para push:
- **Verificar se o build passa** antes do push (`npm run build`)
- **Executar testes** se houver alterações significativas (`npm test`)
- **Verificar conflitos** se a branch estiver atrás do remote
- **Push apenas após confirmação** de que os commits estão corretos

## Ordem de Execução Resumida
1. Atualizar todos os ficheiros do `memory-bank/`
2. Fazer commit das alterações do memory-bank (se houver)
3. Analisar `git status` e `git diff`
4. Criar commits separados por categoria lógica
5. Fazer push para o repositório remoto
6. Reportar ao utilizador: commits criados e status do push

## Notas Específicas do Projeto FoodLister
- **Supabase migrations**: Sempre em ficheiros separados numerados sequencialmente em `supabase/migrations/`
- **Testes**: Manter cobertura em `__tests__/` espelhando a estrutura de `app/`, `components/`, `hooks/`
- **Componentes**: Padrão Server Components por defeito, 'use client' apenas quando necessário
- **Estado**: Context API (Auth, Filters, Modal) + custom hooks
- **Styling**: TailwindCSS 3 com CSS variables (design system padronizado)
- **Repositório**: https://github.com/BMSaiko/FoodLister.git (branch: main)
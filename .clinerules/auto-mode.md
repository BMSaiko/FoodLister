# Auto Mode - Continuous Autonomous Workflow

## Brief Overview
Rules for the `/auto` command in the FoodLister project. This command initiates a persistent continuous loop where the AI assistant works through all tasks in `docs/tasks/` without session termination until `/auto-stop` is received.

## When to Use /auto
- Triggered explicitly by the user via `/auto` command
- Must be executed when the user wants the assistant to work autonomously on all tasks
- Useful for batch processing of multiple tasks without manual intervention

---

## MANDATORY: Task Lifecycle

Each task in auto mode MUST follow this exact lifecycle. **No exceptions.**

### Phase 1: Task Selection
1. Read ALL files in `docs/tasks/` directory:
   - `docs/tasks/TASKS_5HOURS.md`
   - `docs/tasks/issue-*.md` (all issue files)
   - Any other task files present
2. Read `memory-bank/progress.md` for pending items and known issues
3. Prioritize tasks in this order:
   1. `docs/tasks/issue-*.md` (by numeric order)
   2. `docs/tasks/TASKS_5HOURS.md` tasks
   3. `memory-bank/progress.md` pending items
   4. New tasks generated during the process
4. Select the highest priority pending task
5. Read the task description completely and confirm understanding

### Phase 2: Deep Planning (MANDATORY - NO EXCEPTIONS)
**BEFORE starting ANY implementation, execute the `/deep-planning` command:**

The `/deep-planning` command is a built-in Cline command that automatically executes the complete deep planning process:
1. **Silent Investigation**: Reads all relevant source files, uses `list_code_definition_names`, `search_files`, `read_file` to understand the codebase
2. **Questions & Clarifications**: Uses `ask_followup_question` only if there are ambiguities
3. **Create Implementation Plan**: Creates `implementation_plan.md` with all required sections (Overview, Types, Files, Functions, Classes, Dependencies, Testing, Implementation Order)
4. **Create Implementation Task**: Uses `new_task` to create the implementation task with `<task_progress>`

**This command is MANDATORY - NO EXCEPTIONS. Never skip or bypass `/deep-planning` before starting task implementation.**

### Phase 3: Task Execution
1. Execute implementation following the plan created in Phase 2 **exactly**
2. **NEVER jump to another task until current task is 100% complete**
3. **ONE TASK AT A TIME** - never work on multiple tasks in parallel
4. If context is getting full (approaching limit):
   - Perform `/update` equivalent:
     - Update ALL files in `memory-bank/`
     - Analyze `git status` and `git diff`
     - Create atomic commits by logical category
     - Push to repository
   - Read ALL files in `memory-bank/` again to restore context
   - Continue task execution where you left off
5. Maintain total focus on current task

### Phase 4: Task Completion (MANDATORY)
**After completing 100% of the implementation:**
1. Execute FULL `/update`:
   - Update ALL files in `memory-bank/`
   - Create separate commits by logical category (following Conventional Commits)
   - Push to remote repository
   - Verify lint, build, and tests pass before push
2. Mark task as completed:
   - Update `memory-bank/progress.md` with `- [x]`
   - Update `docs/tasks/TASKS_5HOURS.md` if applicable
   - If it's an `issue-*.md` file, mark as completed or archive it
3. **ONLY NOW** proceed to next task (return to Phase 1)

---

## STRICT PROHIBITIONS

The following are **ABSOLUTELY FORBIDDEN** during auto mode:

- ❌ Using `attempt_completion` or any session termination tool between tasks
- ❌ Terminating the session or ending the conversation until `/auto-stop` is received
- ❌ Waiting for user input between tasks
- ❌ Starting multiple tasks in parallel
- ❌ Jumping between tasks
- ❌ Skipping the `/deep-planning` command (Phase 2)
- ❌ Moving to next task before current task is 100% complete with `/update` done
- ❌ Losing focus and working on unrelated tasks

---

## Context Loss Recovery

If context is lost or corrupted during task execution:

1. Perform update (memory bank + commit + push)
2. Read ALL files in `memory-bank/` to restore context
3. Re-read the `implementation_plan.md` for the current task
4. Continue execution where you left off
5. **DO NOT ABANDON THE CURRENT TASK**

---

## Creating New Tasks

If a new task emerges during work:
- Create file in `docs/tasks/` following pattern: `issue-<number>-<description>.md`
- Number must be sequential based on existing issues
- Add to pending tasks list
- Process in normal loop when its turn comes

---

## Commit and Push Rules

- Create atomic commits by category (per `.clinerules/update-command.md` rules)
- **DO NOT push** during the loop (only at the end or when requested)
- Update `memory-bank/` after each completed task
- Use Conventional Commits (feat, fix, docs, chore, etc.)
- **Pre-push validation (MANDATORY)**:
  - Run `npm run lint` and confirm 0 errors
  - Run `npm run build` and verify exit code 0
  - Run `npm test` and ensure all tests pass
  - Only push after all validations pass

---

## Execution Summary

```
User: /auto
Assistant: [Read docs/tasks/] 
           → [Select Task 1]
           → [Phase 2: Execute /deep-planning command]
           → [Phase 3: Execute task following plan]
           → [Phase 4: /update (memory bank + commits + push)]
           → [Select Task 2]
           → [Phase 2: Execute /deep-planning command]
           → [Phase 3: Execute]
           → [Phase 4: /update]
           → [... continue loop ...]
           → [All tasks completed]
           → [Final push]
           → [Wait for /auto-stop]

User: /auto-stop
Assistant: [attempt_completion with summary]
```

---

## FoodLister Project Specific Notes
- **Components**: Server Components by default, 'use client' only when necessary
- **State Management**: Context API (Auth, Filters, Modal, Language) + custom hooks
- **Styling**: TailwindCSS 3 with CSS variables (design system)
- **Database**: Supabase schema and RLS policies
- **API**: Next.js API routes with supabase client usage
- **Tests**: Structure in `__tests__/` mirroring app/, components/, hooks/
- **Build**: Always verify `npm run build` passes before commit

---

## Difference Between /auto and /update
- `/update`: Updates memory bank, commits and pushes existing changes (single task)
- `/auto`: Continuous loop through ALL tasks in `docs/tasks/` without stopping until `/auto-stop`
# Subagents Repetitive Task Rule

This document is the documentation version of the Cline rule file `.clinerules/use-subagents-repetitive.md`, addressing GitHub issue #72.

## Brief overview
Rule specifying mandatory subagent usage for repetitive tasks across multiple files, applicable in both Plan and Act modes.

## Subagent usage for repetitive tasks
- **Trigger case**: Performing repetitive, similar actions targeting 2 or more different files (e.g., investigating multiple separate issues across different components, applying the same type of fix to multiple related files)
- When the trigger case applies, always use the `use_subagents` tool to parallelize work
- This rule applies regardless of the current operation mode (Plan Mode or Act Mode)
- Subagents reduce main agent context consumption and speed up batch task execution
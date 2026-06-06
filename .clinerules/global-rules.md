---
name: Global Rules Reference
type: rule
description: References the global Cline rules from the main Rules directory. These rules apply to ALL projects.
---

# Global Rules Reference

These rules are defined in `C:\Users\bruno\Documents\Cline\Rules\` and apply to all projects.

## Startup Sequence
At session start, read these files in order:
1. `C:\Users\bruno\Documents\Cline\Rules\working-style-rule.md` - Language (PT/EN), response style
2. `C:\Users\bruno\Documents\Cline\Rules\context-summary.md` - Project context
3. `./memory-bank/activeContext.md` - Current focus (if memory-bank exists)

## Key Rules (read on demand)
- `C:\Users\bruno\Documents\Cline\Rules\regra-de-ouro-mastering-path.md` - Golden Rule 3-phase flow
- `C:\Users\bruno\Documents\Cline\Rules\file-operations-guide.md` - File operations
- `C:\Users\bruno\Documents\Cline\Rules\prefer-python-over-ps-rule.md` - Python over PowerShell
- `C:\Users\bruno\Documents\Cline\Rules\no-auto-commit-skill.md` - Manual commits
- `C:\Users\bruno\Documents\Cline\Rules\test-before-completion-rule.md` - Testing
- `C:\Users\bruno\Documents\Cline\Rules\common-errors-mitigation-rule.md` - Error catalog
- `C:\Users\bruno\Documents\Cline\Rules\anti-duplication-rule.md` - No duplicate content

## Project-Specific `.clinerules/`
Each project may have additional `.clinerules/` files with project-specific patterns. Those are read AFTER the global rules.
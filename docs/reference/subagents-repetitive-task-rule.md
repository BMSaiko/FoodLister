# Subagents Repetitive Task Rule - FoodLister

This document is the documentation version of the Cline rule file `.clinerules/use-subagents-repetitive.md`, addressing GitHub issue #72.

## Brief overview
Rule specifying mandatory subagent usage for repetitive tasks across multiple files, applicable in both Plan and Act modes.

## Subagent usage for repetitive tasks

### Trigger Case
Performing repetitive, similar actions targeting 2 or more different files, such as:
- Investigating multiple separate issues across different components
- Applying the same type of fix to multiple related files
- Reading multiple directories to understand codebase structure
- Updating multiple documentation files (e.g., running `/docs` command)
- Applying the same refactoring pattern to multiple components
- Running similar tests across multiple test files

### Rule Requirements
- **Mandatory Usage**: When the trigger case applies, ALWAYS use the `use_subagents` tool to parallelize work
- **Mode Independent**: This rule applies regardless of the current operation mode (Plan Mode or Act Mode)
- **Context Optimization**: Subagents reduce main agent context consumption and speed up batch task execution
- **Parallel Execution**: Use up to 5 subagents in parallel for maximum efficiency

### When to Use Subagents

#### Documentation Updates (`/docs` command)
```
Trigger: Updating all documentation in docs/ directory
Action: Use use_subagents with prompts for each section:
  - prompt_1: "Read and analyze all files in docs/api/"
  - prompt_2: "Read and analyze all files in docs/guides/"
  - prompt_3: "Read and analyze all files in docs/database/"
  - prompt_4: "Read and analyze all files in docs/features/"
  - prompt_5: "Read and analyze all files in docs/progress/"
```

#### Codebase Analysis
```
Trigger: Understanding project structure across multiple directories
Action: Use use_subagents with prompts for each directory:
  - prompt_1: "List and analyze all files in components/"
  - prompt_2: "List and analyze all files in hooks/"
  - prompt_3: "List and analyze all files in app/api/"
  - prompt_4: "List and analyze all files in libs/ and utils/"
  - prompt_5: "List and analyze all files in contexts/ and types/"
```

#### Applying Similar Fixes
```
Trigger: Fixing the same issue in multiple components
Action: Use use_subagents with prompts for each component:
  - prompt_1: "Fix [issue] in components/ui/ files"
  - prompt_2: "Fix [issue] in components/restaurant/ files"
  - prompt_3: "Fix [issue] in components/lists/ files"
```

#### Testing Multiple Files
```
Trigger: Running tests across multiple test directories
Action: Use use_subagents with prompts for each test directory:
  - prompt_1: "Run tests in __tests__/components/"
  - prompt_2: "Run tests in __tests__/hooks/"
  - prompt_3: "Run tests in utils/__tests__/"
```

### Subagent Prompt Structure

When creating subagent prompts, follow this structure:

```
"Analyze the [directory/path] directory and:
1. List all files present
2. Identify the main purpose of each file
3. Note any patterns or conventions used
4. Identify any issues or improvements needed
5. Report back with a structured summary"
```

### Best Practices

1. **Clear Prompts**: Each subagent prompt should be clear and specific about what to analyze or do
2. **Parallel When Possible**: If tasks are independent, run them in parallel using multiple prompts
3. **Structured Output**: Ask subagents to return structured data for easy processing
4. **Context Awareness**: Subagents have their own context window - provide enough information
5. **File Limits**: Each subagent can read multiple files but be mindful of context limits

### Benefits

- **Speed**: Parallel execution reduces total time
- **Context Management**: Each subagent has its own context window
- **Focus**: Subagents can focus on specific areas without distraction
- **Scalability**: Easy to scale to many files/directories

### Example: `/docs` Command Implementation

```xml
<use_subagents>
<prompt_1>Read and analyze all markdown files in docs/api/ directory. For each file, note the current content and what needs to be updated based on the current codebase state.</prompt_1>
<prompt_2>Read and analyze all markdown files in docs/guides/ directory. For each file, note the current content and what needs to be updated based on the current codebase state.</prompt_2>
<prompt_3>Read and analyze all markdown files in docs/database/ and docs/features/ directories. For each file, note the current content and what needs to be updated based on the current codebase state.</prompt_3>
<prompt_4>Read and analyze all markdown files in docs/progress/ directory. For each file, note the current content and what needs to be updated based on the current codebase state.</prompt_4>
<prompt_5>Read and analyze all markdown files in docs/reference/ and docs/setup/ directories. For each file, note the current content and what needs to be updated based on the current codebase state.</prompt_5>
</use_subagents>
```

### Notes

- This rule is critical for the `/docs` command which requires reading the entire codebase
- Subagents are especially useful for large codebases where reading all files would exceed context limits
- Always verify subagent results before applying changes
- The main agent should synthesize results from all subagents before proceeding

---

*Last updated: 2026-05-07*
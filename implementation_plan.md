# Implementation Plan

[Overview]
Add a scroll-to-top button to the Restaurant Roulette sticky menu, fix the GitHub Actions deploy.yml workflow error, and add the subagents repetitive task rule file to the documentation.

This plan addresses three key changes: 1) A critical fix for the GitHub Actions deploy workflow, which fails due to an invalid `secrets` context reference in a job `if` condition. 2) A UX improvement to the Restaurant Roulette component by adding a scroll-to-top button to its sticky bottom menu. 3) Documentation update to add the existing subagents repetitive task rule file to the project's docs folder, addressing GitHub issue #72.

[Types]
No new type definitions are required for these changes.

No new interfaces, enums, or data structures need to be added. Existing types (FilterPreset, SpinHistoryEntry) remain unchanged, and no modifications to type definitions in `types/` or component prop types are needed.

[Files]
Modify .github/workflows/deploy.yml, components/ui/RestaurantList/RestaurantRoulette.tsx, and add docs/reference/subagents-repetitive-task-rule.md.

Detailed breakdown:
- New files to be created:
  - `docs/reference/subagents-repetitive-task-rule.md`: Contains the content of `.clinerules/use-subagents-repetitive.md` to make the rule discoverable in the documentation, addressing GitHub issue #72.
- Existing files to be modified:
  - `.github/workflows/deploy.yml`: Remove the invalid `secrets.VERCEL_TOKEN != ''` segment from the `if` condition of the `deploy-preview` job (line 16) to resolve the workflow parsing error.
  - `components/ui/RestaurantList/RestaurantRoulette.tsx`: Import the `ArrowUp` icon from `lucide-react` and add a scroll-to-top button to the sticky bottom menu container.
- No files to be deleted or moved.
- No configuration file updates needed.

[Functions]
Add an inline onClick handler for the new scroll-to-top button; no existing functions are modified.

Detailed breakdown:
- New functions: None. An inline arrow function `() => window.scrollTo({ top: 0, behavior: 'smooth' })` will be added to the new button's `onClick` prop.
- Modified functions: None. Existing functions like `handleSpin`, `loadFilterPreset`, etc. remain unchanged.
- Removed functions: None.

[Classes]
No class modifications are needed.

Detailed breakdown:
- New classes: None.
- Modified classes: None. The `RestaurantRoulette` component (function component) remains unchanged except for the added import and button.
- Removed classes: None.

[Dependencies]
No new dependencies are required.

The `ArrowUp` icon is already available in the `lucide-react` package, which is already installed as a project dependency (version ^0.487.0 per memory-bank/techContext.md). No new packages need to be installed, and no version changes are required.

[Testing]
No new test files are required, but existing functionality should be verified.

Test file requirements: No new test files need to be created for these changes.
Existing test modifications: None, but existing tests for `RestaurantRoulette` (if any) should be run to ensure no regressions.
Validation strategies:
1. Validate deploy.yml syntax using a YAML validator or by pushing to GitHub and checking the Actions tab.
2. Manually test the scroll-to-top button in the Restaurant Roulette page to ensure it scrolls to the top smoothly.
3. Verify the new docs file exists at `docs/reference/subagents-repetitive-task-rule.md`.

[Implementation Order]
Fix the deploy.yml workflow first, then add the scroll button, then add the docs file, and finally verify all changes.

1. Fix `.github/workflows/deploy.yml`: Remove the invalid `&& secrets.VERCEL_TOKEN != ''` from the `deploy-preview` job's `if` condition (line 16) to resolve the "Unrecognized named-value: 'secrets'" error.
2. Modify `components/ui/RestaurantList/RestaurantRoulette.tsx`:
   a. Add `ArrowUp` to the import list from `lucide-react`.
   b. Update the sticky bottom menu container to include the new scroll-to-top button with appropriate styling and onClick handler.
3. Create `docs/reference/subagents-repetitive-task-rule.md` with the content of `.clinerules/use-subagents-repetitive.md`.
4. Verify changes:
   a. Run `npm run build` to ensure no regressions in the Restaurant Roulette component.
   b. Check deploy.yml syntax via GitHub Actions or a YAML validator.
   c. Confirm the new docs file is present and accessible.
## Brief overview
Rules for pre-push validation steps in the FoodLister project, mandating that lint, build, and test checks must all pass before pushing commits to the remote repository.

## Pre-Push Validation Requirements
- Run the project's lint command (e.g., `npm run lint`) and confirm there are no linting errors
- Run the project's build command (e.g., `npm run build`) and verify the build completes successfully with exit code 0
- Run the project's test suite (e.g., `npm test`) and ensure all tests pass
- Only execute `git push` after all three validation steps above have completed successfully
- If any validation step fails, resolve all issues before attempting to push again
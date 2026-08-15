---
description: Perform code review and stage/commit changes
---

Please adopt the `code-reviewer` persona and perform a thorough code review of all uncommitted changes before committing.

**IMPORTANT: Do NOT automatically commit any future changes unless I explicitly use this command again. This applies ONLY to the current uncommitted changes.**

1. **Adopt Persona:** Explicitly adopt the `code-reviewer` persona.
2. **Clean Workspace:** Look at all newly added and untracked files (`git ls-files --others --exclude-standard`). If you identify any scratch files or temporary scripts created for testing/refactoring (regardless of their extension), delete them from the workspace so they aren't accidentally committed.
3. **SSOT & Documentation Check:** Verify if the uncommitted changes alter core architecture, the intent schema, or UI states. If they do, confirm with me that `project_charter.md` and `README.md` have been updated to reflect these changes before proceeding.
4. **Test Verification:** Check the commit diff to see if eval coverage was written. If no evals were written, but the changes alter intent routing logic, prompt me before committing and suggest adding eval cases first. Remind me that per our eval-driven development directive, `pnpm exec promptfoo eval` should pass before a commit.
5. **Analyze & Review:** Review the `git diff`. Halt and wait for approval if you find architectural violations, untyped intent payloads, missing HITL confirmation, or linting errors.
6. **Walkthrough Generation (Conditional):** If I used the "w" or "walkthrough" flag (e.g., "git commit w"), generate a `walkthrough.md` artifact that includes a detailed summary of the changes along with the full `git diff` output.
7. **Commit Draft & Review:** Draft a concise, descriptive Git commit message summarizing the changes and present it to me.
8. **Commit:** Upon my explicit approval, add the files to the staging area and execute `git commit`.
9. **Report:** Notify success and return to normal behavior.
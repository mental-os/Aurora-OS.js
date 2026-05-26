---
description: Update and synchronize the project context for LLMs
---

Use this workflow after making significant architectural changes, adding new core features, or refactoring existing systems (e.g., VFS, User Auth, App Engine) to ensure future AI sessions remain accurate.

1. **Information Gathering**: Review the session memory, git diffs, and any new documentation created during the current task.
2. **Update Core Context**:
   - MUST use the `replace_file_content` tool to modify `.agents/rules/context.md`.
   - Update only the `<architecture_mechanics>` and `<critical_rules>` sections to reflect the latest architectural truth.
   - Maintain the `<!-- OPTIMIZED_FOR: GEMINI_3_PRO_HIGH -->` tag. Keep the file dense, token-efficient, and optimized for Gemini Pro reasoning.
3. **Mirror to Public Context**:
   // turbo
   - Run `cp .agents/rules/context.md public/llms-full.txt` via bash `run_command` to guarantee an exact mirror instantly.
4. **Update LLM Index**:
   - Check `public/llms.txt` (the entry point for external agents).
   - Ensure high-level descriptions and links to other documentation are still accurate.
5. **Verify Sync**: Briefly verify that documentation refers to the actual state of the code (e.g., ensure hook names or registry paths mentioned in contexts are correct).

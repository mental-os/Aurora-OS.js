---
description: Ingest the codebase at the start of the conversation
---

**MANDATORY FIRST STEP**: You MUST use the `view_file` tool to read `.agents/rules/context.md` before doing any other research. This file is the source of truth for the project architecture.

1. **Understand Architecture**: Analyze the core logic of this high-fidelity virtual OS and hacking simulator. Focus specifically on:
   - `src/components/` (React architecture and Contexts)
   - `src/hooks/` (Core OS logic like VFS and Terminal)
   - `src/utils/` (Helper methods and persistence)
2. **Context Update**: If you discover that the current codebase logic significantly deviates from the information in `.agents/rules/context.md` and `public/llms-full.txt`, immediately execute the `/update-context` workflow. Do not make updates for minor changes, only architectural shifts.

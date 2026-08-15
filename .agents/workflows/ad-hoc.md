---
description: Flexible working mode for random tasks across the stack
---

Upon receiving this command, enter a flexible working mode for tasks across the stack (frontend, intent router, evals, MCP server, etc.).

1. **Adopt Persona:** Identify and explicitly adopt the correct persona from the agent roster defined in `.agents/personas/`.
2. **SSOT Alignment:** Evaluate the task against `project_charter.md`. Never violate HITL confirmation requirements, intent schema contracts, or Zustand state management patterns.
3. **Analyze & Execute:** Proceed with the instructions. If altering core intent routing logic or state mutations, ensure eval coverage exists first.
4. **Confirmation:** If your changes result in visual updates or require a dev server restart, pause and explicitly prompt the user before moving to the next task.
# Whatnot Ops Copilot — Project Charter

## 1. Project Overview & Vision

The **Whatnot Ops Copilot** is an intent-based AI operations tool that demonstrates high-velocity, high-judgment AI engineering. Built in a single weekend, it targets the specific workflows of Whatnot's Customer Experience (CX) and Trust & Safety (T&S) teams — while establishing a **reusable cross-org pattern** that any team can adopt.

Instead of a generic "chat" interface, this tool uses natural language to drive concrete, state-modifying actions via a custom **intent router** powered by Gemini structured output. It proves the ability to go from a vague operational problem ("CX reps take too many clicks to refund stream items") to a deterministic, evaluated, and safe AI tool — in days, not months.

### Why This Pattern Matters

The intent router is not a one-off. It's a **platform primitive**:
- The routing logic is extracted into a reusable MCP server any developer can plug into
- The eval suite (Promptfoo) establishes a repeatable quality gate for any AI-driven workflow
- The architecture separates concerns (parsing → validation → confirmation → execution) so teams can swap models, add intents, or change backends without rewriting the stack

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server-side route handlers keep API keys secure; App Router enables streaming |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Dense, Retool-style internal dashboards with minimal custom CSS |
| **State** | Zustand | Lightweight, no boilerplate, pre-seeded with mock Whatnot data |
| **AI** | Gemini 2.0 Flash via `@google/genai` | Structured JSON output, fast inference, low cost for high-volume routing |
| **Evals** | Promptfoo | Deterministic intent routing validation with edge case coverage |
| **Extensibility** | Model Context Protocol (MCP) | Exposes router as reusable skill for Claude Desktop, Cursor, etc. |

## 3. Core Architecture

The application operates on an **intent-based workflow**:

1. **The State:** A global Zustand store pre-seeded with realistic mock Whatnot data (Active Streams, Users, Recent Orders, Support Tickets).
2. **The Input:** An Ops Manager types a complex command (e.g., *"Refund buyer @sneakerhead99 for the damaged funko pop on @sellerX's stream and issue a warning to the seller."*).
3. **The Router:** A custom intent router powered by Gemini 2.0 Flash parses this into an array of structured JSON intents, validated against Zod schemas.
4. **The Confirmation:** The frontend renders **Action Confirmation Cards** (Human-in-the-Loop) — AI proposes, humans dispose.
5. **The Execution:** Approved intents mutate state and log to an immutable audit trail.

## 4. Intent Specification

The Copilot handles the following primary T&S / CX intents:

### `REFUND_ORDER`
```typescript
{ orderId?: string, buyerUsername: string, reason: string, amount?: number }
```

### `FLAG_ACCOUNT`
```typescript
{ username: string, reason: string, action: "warning" | "suspend_payouts" | "ban" }
```

### `GRANT_CREDIT`
```typescript
{ username: string, amount: number, reason: string }
```

### `QUERY_STATE`
```typescript
{ entity: "user" | "order" | "stream", query: string }
```

**Batch Execution:** The router supports batching — a single prompt can return `[REFUND_ORDER, FLAG_ACCOUNT]`.

## 5. Development Directives

- **UI/UX Mandate:** Internal tool. Prioritize data density, keyboard navigability (⌘K), and clear action states over flashy animations. Dark/neutral palette.
- **Human-in-the-Loop (HITL):** AI must *never* blindly mutate state. Every action requires explicit operator confirmation.
- **Eval-Driven Development:** `promptfooconfig.yaml` is established *before* refining prompts. Edge cases (typos, ambiguous amounts, non-existent entities, destructive commands) must be covered.
- **No Toy Inputs:** The AI has access to the real (mocked) state. Intents validate against the Zustand store (e.g., confirming a user exists before proposing a ban).
- **Reusable Infrastructure:** The intent router and MCP server are designed as organizational building blocks, not project-specific code.

## 6. Deliverables

1. **The Live App** — Deployed on Vercel
2. **The Eval Report** — Promptfoo proving 95%+ intent accuracy across 15+ CX edge cases
3. **The MCP Server** — `mcp/` directory exposing router logic as a reusable developer skill
4. **The Loom Video** — 3-minute walkthrough: business value (time saved for ops) + engineering rigor (evals, deterministic routing, platform thinking)
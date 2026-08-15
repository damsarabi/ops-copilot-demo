# LiveLoot Ops Copilot

> An intent-based AI operations tool for LiveLoot's CX and Trust & Safety teams.  
> Natural language in → structured, human-approved actions out.

<br/>

## What It Does

Ops managers type complex commands in plain English:

```
"Refund buyer @sneakerhead99 for the damaged funko pop on @sellerX's stream
and issue a warning to the seller."
```

The copilot parses this into **structured intents**, validates them against live state, and presents **action confirmation cards** — no blind mutations, ever.

<br/>

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Ops Manager (Command Bar ⌘K)                       │
│  "Refund the buyer and warn the seller"             │
└────────────────────┬────────────────────────────────┘
                     │ POST /api/intents
                     ▼
┌─────────────────────────────────────────────────────┐
│  Intent Router (Gemini 3.5 Flash Lite)               │
│  Structured JSON output · Zod validation            │
│  Batch support (1 prompt → N intents)               │
└────────────────────┬────────────────────────────────┘
                     │ Intent[]
                     ▼
┌─────────────────────────────────────────────────────┐
│  Human-in-the-Loop UI                               │
│  Action Cards: Execute ✓ or Cancel ✗                │
│  Color-coded by severity · Raw JSON expandable      │
└────────────────────┬────────────────────────────────┘
                     │ Approved
                     ▼
┌─────────────────────────────────────────────────────┐
│  State Mutation (Zustand)                           │
│  Audit trail · Rollback-ready                       │
└─────────────────────────────────────────────────────┘
```

<br/>

## Supported Intents

| Intent | Description | Severity |
|---|---|---|
| `REFUND_ORDER` | Issue full/partial refund to a buyer | 🟡 Medium |
| `FLAG_ACCOUNT` | Warn, suspend payouts, or ban a user | 🔴 High |
| `GRANT_CREDIT` | Add promotional credit to a user account | 🟢 Low |
| `QUERY_STATE` | Read-only lookup of users, orders, streams | ⚪ None |

<br/>

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand (pre-seeded with realistic mock data)
- **AI:** Gemini 3.5 Flash Lite via `@google/genai` (structured output)
- **Evals:** Promptfoo (deterministic intent routing validation)
- **Extensibility:** Model Context Protocol (MCP) server

<br/>

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Google AI Studio API key](https://aistudio.google.com/apikey)

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Add your GOOGLE_API_KEY to .env.local

# Start dev server
pnpm dev
```

### Run Evals

> **Note:** The dev server must be running (`pnpm dev`) before executing evals.

```bash
pnpm exec promptfoo eval    # run 17-case suite against /api/intents
pnpm exec promptfoo view    # open results UI
```

<br/>

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/intents/        # Intent routing endpoint
│   └── page.tsx            # Main dashboard
├── components/             # UI components
│   ├── ui/                 # shadcn/ui primitives
│   ├── command-bar.tsx     # ⌘K command input
│   ├── action-card.tsx     # HITL confirmation cards
│   └── state-panel.tsx     # Live state viewer
├── lib/intents/            # Intent router engine
│   ├── router.ts           # Gemini structured output parser
│   └── schemas.ts          # Zod intent schemas
└── store/                  # Zustand state + mock data

mcp/                        # Standalone MCP server (see mcp/README.md)
promptfooconfig.yaml        # Promptfoo eval suite — 17 test cases, 100% pass rate
```

<br/>

## MCP Server

The intent router is also published as a standalone [Model Context Protocol](https://modelcontextprotocol.io) server, allowing any MCP-compatible client (Claude Desktop, Cursor, etc.) to call `route_intent` directly.

See [`mcp/README.md`](./mcp/README.md) for setup and Claude Desktop integration instructions.

<br/>

## Design Philosophy

This is an **internal tool**, not a consumer product. The UI prioritizes:

- **Data density** over whitespace
- **Keyboard navigability** (⌘K) over mouse-first design
- **Clear action states** over flashy animations
- **Human-in-the-loop safety** — AI proposes, humans dispose

<br/>

## License

MIT

# Phase 3: Intent Router (Gemini 2.0 Flash)

## Task
Build the custom intent router that takes natural language commands and returns structured, validated intents using Gemini's structured output.

## Files to Create

### `src/lib/gemini.ts`
Gemini client singleton:
- Initialize `GoogleGenAI` with `GOOGLE_API_KEY` from env
- Export a configured client instance
- Model: `gemini-2.0-flash`

### `src/lib/intents/schemas.ts`
Zod schemas mirroring the TypeScript intent types:
- `refundOrderSchema` — validates REFUND_ORDER payload
- `flagAccountSchema` — validates FLAG_ACCOUNT payload
- `grantCreditSchema` — validates GRANT_CREDIT payload
- `queryStateSchema` — validates QUERY_STATE payload
- `intentSchema` — discriminated union of all 4
- `intentArraySchema` — array of intents (for batch support)

### `src/lib/intents/router.ts`
The core router function:
- Takes: `message` (string) + `context` (usernames[], streamIds[], orderIds[] from current state)
- Builds a system prompt that defines the 4 intent types, their schemas, and the available entities
- Calls Gemini with `responseMimeType: "application/json"` and `responseSchema` for deterministic structured output
- Parses response, validates against Zod schemas
- Returns: `Intent[]` (supports batching — 1 prompt → N intents)
- Error handling: returns descriptive error if Gemini returns invalid structure

### `src/app/api/intents/route.ts`
POST endpoint:
- Request body: `{ message: string }`
- Reads current state context from a helper (usernames, order IDs, stream IDs)
- Calls the router
- Response: `{ intents: Intent[] }` or `{ error: string }`
- Validates `GOOGLE_API_KEY` is present

### `src/lib/intents/context.ts`
Helper to extract entity context from the store for the AI prompt:
- Lists all usernames
- Lists all order IDs with status
- Lists all stream IDs with titles
- This context is injected into the system prompt so Gemini can validate entities

## Design Decisions
- Structured output via `responseSchema` (not free-text parsing) — deterministic, no regex
- Context injection means the AI knows what entities exist — "No Toy Inputs" directive
- Zod validation is a second safety net after Gemini's schema enforcement
- The route handler is server-side only — API key never reaches the client

## Dependencies
- `zod` (need to install — for schema validation)

## Risks
- Need a valid `GOOGLE_API_KEY` to test. We'll need to set up `.env.local`.
- Gemini structured output schema format may differ from Zod — will need to build the JSON schema manually for the API call.

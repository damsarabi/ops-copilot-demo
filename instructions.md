# Phase 5: Promptfoo Eval Suite

## Task
Configure `promptfooconfig.yaml` with 15+ test cases validating intent routing accuracy, edge case handling, and batch command support.

## Goal
Prove 95%+ routing accuracy across all 4 intent types, including ambiguous, destructive, and multi-intent commands.

## Files to Create

### `promptfooconfig.yaml` (project root)
Main eval config connecting to our `/api/intents` endpoint.

### `evals/prompts/system.txt`
Extracted system prompt for standalone eval testing (mirrors `router.ts` system prompt).

### `evals/assert-helpers.js`
Custom assertion helpers for validating structured intent payloads.

## Test Case Categories (15+)

### Happy Path — Single Intents (4 cases)
1. Basic refund: `"Refund @sneakerhead99 for the damaged funko pop"` → REFUND_ORDER
2. Grant credit: `"Give @vintage_collector $50 credit for delayed shipping"` → GRANT_CREDIT  
3. Warning: `"Issue a warning to @sellerX for non-delivery"` → FLAG_ACCOUNT { action: "warning" }
4. Query: `"Show me all disputed orders"` → QUERY_STATE { entity: "order" }

### Batch Commands (3 cases)
5. Refund + warning: `"Refund @sneakerhead99 and warn @sellerX"` → [REFUND_ORDER, FLAG_ACCOUNT]
6. Ban + credit: `"Ban @cardshark_mike and give @victim_buyer $100 credit"` → [FLAG_ACCOUNT { action: "ban" }, GRANT_CREDIT]
7. Triple batch: `"Refund buyer, warn seller, and query all open tickets"` → [REFUND_ORDER, FLAG_ACCOUNT, QUERY_STATE]

### Severity Escalation (3 cases)
8. Warning vs ban differentiation: `"Issue a final warning"` → action: "warning" (not ban)
9. Suspension: `"Suspend payouts for @cardshark_mike"` → action: "suspend_payouts"
10. Ban: `"Permanently ban @cardshark_mike for fraud"` → action: "ban"

### Context Resolution (2 cases)
11. Order resolution: `"Refund the funko pop order"` → resolves orderId from context
12. Non-existent user: `"Refund @ghost_user123"` → empty [] or graceful fallback

### Ambiguous / Edge Cases (3 cases)
13. Typo tolerance: `"Refund @sneakerhed99 for funko pop"` → matches @sneakerhead99
14. Implicit full refund: `"Refund @sneakerhead99"` → REFUND_ORDER, amount omitted (full)
15. Unintelligible input: `"asdf qwerty blah"` → returns []

## Assertions Strategy
- `type` field must match expected intent type (exact string match)
- `payload.action` must be within enum for FLAG_ACCOUNT
- Batch: array length must match expected count
- All responses must be valid JSON arrays
- No invented usernames — only usernames from seed context

## Install
```bash
pnpm add -D promptfoo
```

## Run Command
```bash
pnpm exec promptfoo eval
```

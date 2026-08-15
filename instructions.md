# Phase 2: Mock Data & Zustand Store

## Task
Build the data layer: TypeScript types, realistic mock LiveLoot data, and a Zustand store with actions for all 4 intent types.

## Files to Create

### `src/store/types.ts`
Type definitions for the entire data model:
- `User` — id, username, displayName, email, role (buyer/seller/admin), status (active/warned/suspended/banned), balance, creditBalance, joinedAt
- `Order` — id, buyerUsername, sellerUsername, itemName, amount, status (completed/disputed/refunded/pending), streamId, createdAt
- `Stream` — id, sellerUsername, title, category, status (live/ended), viewerCount, items[], startedAt
- `SupportTicket` — id, reporterUsername, targetUsername, orderId?, type (dispute/complaint/fraud_report), status (open/in_progress/resolved), priority, description, createdAt
- `ActionLogEntry` — id, intentType, payload, status (executed/cancelled), executedAt, executedBy
- `Intent` types — `RefundOrderIntent`, `FlagAccountIntent`, `GrantCreditIntent`, `QueryStateIntent`, union type `Intent`

### `src/store/seed-data.ts`
Realistic LiveLoot mock data:
- **8 users**: sneakerhead99 (buyer), sellerX (seller), vintagequeen (seller), funko_king (buyer), cardshark_mike (seller), luxbags_liz (seller), mod_sarah (CX rep/admin), ops_manager_j (admin)
- **4 active streams**: Live auctions for sneakers, vintage clothing, funko pops, trading cards — each with 3-5 items, viewer counts, seller refs
- **12 orders**: Mix of completed/disputed/refunded/pending across different buyer-seller pairs, realistic item names and prices
- **6 support tickets**: Open tickets referencing specific orders/users with varying priorities

### `src/store/index.ts`
Zustand store (`useAppStore`) with:
- **State**: users, orders, streams, tickets, actionLog, pendingIntents
- **Actions**:
  - `refundOrder(orderId, amount?, reason)` → sets order status to "refunded", adjusts user balance
  - `flagAccount(username, action, reason)` → sets user status (warned/suspended/banned)
  - `grantCredit(username, amount, reason)` → adds to user creditBalance
  - `queryState(entity, query)` → read-only lookup, returns matching records
  - `addPendingIntent(intent)` → queues intent for HITL confirmation
  - `executeIntent(intentId)` → runs the intent mutation, logs to actionLog
  - `cancelIntent(intentId)` → removes from pending, logs cancellation
  - `getActionLog()` → returns full audit trail

## Design Decisions
- All mutations log to `actionLog` for audit trail (immutable append-only)
- `pendingIntents` is the HITL queue — intents land here before execution
- Store is pre-seeded on initialization (no lazy loading)
- No persistence — state resets on page refresh (intentional for a demo)

## Risks
- None significant. This is pure TypeScript + Zustand, no external dependencies.

# Phase 4: Dashboard UI

## Task
Build the 3-panel ops dashboard with command bar, HITL action cards, and live state viewer.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  Header: "LiveLoot Ops Copilot" + status indicators  │
├──────────────────────────────────────────────────────┤
│  Command Bar (⌘K style, always visible at top)       │
│  "Refund buyer @sneakerhead99 for the damaged..."    │
├───────────────────────┬──────────────────────────────┤
│  Action Panel (left)  │  State Panel (right)         │
│                       │                              │
│  HITL Action Cards:   │  Tabs: Users | Orders |      │
│  ┌─────────────────┐  │  Streams | Tickets           │
│  │ REFUND_ORDER    │  │                              │
│  │ @sneakerhead99  │  │  Searchable data tables      │
│  │ $110.00         │  │  showing current state       │
│  │ [Execute] [✗]   │  │                              │
│  └─────────────────┘  │                              │
│  ┌─────────────────┐  │  Audit Log (bottom)          │
│  │ FLAG_ACCOUNT    │  │  Recent actions with         │
│  │ @sellerX        │  │  timestamps                  │
│  │ warning ⚠️      │  │                              │
│  │ [Execute] [✗]   │  │                              │
│  └─────────────────┘  │                              │
├───────────────────────┴──────────────────────────────┤
│  Footer: audit log count, model info                 │
└──────────────────────────────────────────────────────┘
```

## Files to Create

### `src/app/layout.tsx` (modify)
- Dark theme (zinc-950 background)
- Import Geist font (already configured by shadcn)

### `src/app/page.tsx` (rewrite)
- Main dashboard layout: header, command bar, 2-panel grid
- Wire up Zustand store
- Handle command submission → POST /api/intents → add to pending

### `src/components/command-bar.tsx`
- Text input with ⌘K shortcut to focus
- Submit on Enter
- Loading state while Gemini processes
- Error display for failed intent parsing

### `src/components/action-card.tsx`
- Renders a single pending intent as a card
- Color-coded by severity (green=credit, amber=refund, red=flag)
- Shows intent type, target user, key payload details
- Execute ✓ and Cancel ✗ buttons
- Expandable raw JSON view

### `src/components/state-panel.tsx`
- Tabbed view: Users | Orders | Streams | Tickets
- Simple data tables using shadcn Table component
- Shows live store state (updates when intents execute)

### `src/components/audit-log.tsx`
- Scrollable list of executed/cancelled actions
- Timestamp, intent type, status badge

## Design Decisions
- Dark theme (zinc-950 base) — internal tool aesthetic
- No fancy animations — data density over decoration
- Color system: green (#22c55e) = credit, amber (#f59e0b) = refund, red (#ef4444) = flag, slate = query
- All state reads from Zustand — single source of truth
- Command bar always visible (not hidden behind ⌘K modal)

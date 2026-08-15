// ─── Entity Types ──────────────────────────────────────────────

export type UserRole = "buyer" | "seller" | "admin";
export type UserStatus = "active" | "warned" | "suspended" | "banned";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  creditBalance: number;
  joinedAt: string;
}

export type OrderStatus = "completed" | "disputed" | "refunded" | "pending";

export interface Order {
  id: string;
  buyerUsername: string;
  sellerUsername: string;
  itemName: string;
  amount: number;
  status: OrderStatus;
  streamId: string;
  createdAt: string;
}

export type StreamStatus = "live" | "ended";

export interface StreamItem {
  name: string;
  currentBid: number;
  sold: boolean;
}

export interface Stream {
  id: string;
  sellerUsername: string;
  title: string;
  category: string;
  status: StreamStatus;
  viewerCount: number;
  items: StreamItem[];
  startedAt: string;
}

export type TicketType = "dispute" | "complaint" | "fraud_report";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface SupportTicket {
  id: string;
  reporterUsername: string;
  targetUsername: string;
  orderId?: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  description: string;
  createdAt: string;
}

// ─── Intent Types ──────────────────────────────────────────────

export type IntentType =
  | "REFUND_ORDER"
  | "FLAG_ACCOUNT"
  | "GRANT_CREDIT"
  | "QUERY_STATE";

export interface RefundOrderIntent {
  type: "REFUND_ORDER";
  payload: {
    orderId?: string;
    buyerUsername: string;
    reason: string;
    amount?: number;
  };
}

export interface FlagAccountIntent {
  type: "FLAG_ACCOUNT";
  payload: {
    username: string;
    reason: string;
    action: "warning" | "suspend_payouts" | "ban";
  };
}

export interface GrantCreditIntent {
  type: "GRANT_CREDIT";
  payload: {
    username: string;
    amount: number;
    reason: string;
  };
}

export interface QueryStateIntent {
  type: "QUERY_STATE";
  payload: {
    entity: "user" | "order" | "stream";
    query: string;
  };
}

export type Intent =
  | RefundOrderIntent
  | FlagAccountIntent
  | GrantCreditIntent
  | QueryStateIntent;

// ─── Action Log ────────────────────────────────────────────────

export type ActionStatus = "executed" | "cancelled";

export interface ActionLogEntry {
  id: string;
  intentType: IntentType;
  payload: Record<string, unknown>;
  status: ActionStatus;
  executedAt: string;
  executedBy: string;
}

// ─── Pending Intent (HITL Queue) ───────────────────────────────

export interface PendingIntent {
  id: string;
  intent: Intent;
  createdAt: string;
}

// ─── Store Shape ───────────────────────────────────────────────

export interface AppState {
  users: User[];
  orders: Order[];
  streams: Stream[];
  tickets: SupportTicket[];
  actionLog: ActionLogEntry[];
  pendingIntents: PendingIntent[];
}

export interface AppActions {
  refundOrder: (orderId: string, reason: string, amount?: number) => void;
  flagAccount: (
    username: string,
    action: "warning" | "suspend_payouts" | "ban",
    reason: string
  ) => void;
  grantCredit: (username: string, amount: number, reason: string) => void;
  queryState: (
    entity: "user" | "order" | "stream",
    query: string
  ) => User[] | Order[] | Stream[];
  addPendingIntent: (intent: Intent) => void;
  executeIntent: (intentId: string) => void;
  cancelIntent: (intentId: string) => void;
}

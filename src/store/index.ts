import { create } from "zustand";
import type {
  AppState,
  AppActions,
  Intent,
  PendingIntent,
  ActionLogEntry,
  User,
  Order,
  Stream,
} from "./types";
import { seedUsers, seedOrders, seedStreams, seedTickets } from "./seed-data";

// ─── Helpers ───────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Store ─────────────────────────────────────────────────────

export const useAppStore = create<AppState & AppActions>()((set, get) => ({
  // State — pre-seeded with mock data
  users: seedUsers,
  orders: seedOrders,
  streams: seedStreams,
  tickets: seedTickets,
  actionLog: [],
  pendingIntents: [],

  // ─── Mutations ─────────────────────────────────────────────

  refundOrder: (orderId: string, reason: string, amount?: number) => {
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const refundAmount = amount ?? order.amount;

      const updatedOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "refunded" as const } : o
      );

      const updatedUsers = state.users.map((u) =>
        u.username === order.buyerUsername
          ? { ...u, balance: u.balance + refundAmount }
          : u
      );

      const logEntry: ActionLogEntry = {
        id: generateId("log"),
        intentType: "REFUND_ORDER",
        payload: { orderId, reason, amount: refundAmount },
        status: "executed",
        executedAt: new Date().toISOString(),
        executedBy: "ops_manager_j",
      };

      return {
        orders: updatedOrders,
        users: updatedUsers,
        actionLog: [...state.actionLog, logEntry],
      };
    });
  },

  flagAccount: (
    username: string,
    action: "warning" | "suspend_payouts" | "ban",
    reason: string
  ) => {
    set((state) => {
      const statusMap = {
        warning: "warned" as const,
        suspend_payouts: "suspended" as const,
        ban: "banned" as const,
      };

      const updatedUsers = state.users.map((u) =>
        u.username === username
          ? { ...u, status: statusMap[action] }
          : u
      );

      const logEntry: ActionLogEntry = {
        id: generateId("log"),
        intentType: "FLAG_ACCOUNT",
        payload: { username, action, reason },
        status: "executed",
        executedAt: new Date().toISOString(),
        executedBy: "ops_manager_j",
      };

      return {
        users: updatedUsers,
        actionLog: [...state.actionLog, logEntry],
      };
    });
  },

  grantCredit: (username: string, amount: number, reason: string) => {
    set((state) => {
      const updatedUsers = state.users.map((u) =>
        u.username === username
          ? { ...u, creditBalance: u.creditBalance + amount }
          : u
      );

      const logEntry: ActionLogEntry = {
        id: generateId("log"),
        intentType: "GRANT_CREDIT",
        payload: { username, amount, reason },
        status: "executed",
        executedAt: new Date().toISOString(),
        executedBy: "ops_manager_j",
      };

      return {
        users: updatedUsers,
        actionLog: [...state.actionLog, logEntry],
      };
    });
  },

  queryState: (
    entity: "user" | "order" | "stream",
    query: string
  ): User[] | Order[] | Stream[] => {
    const state = get();
    const q = query.toLowerCase();

    switch (entity) {
      case "user":
        return state.users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q)
        );
      case "order":
        return state.orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.itemName.toLowerCase().includes(q) ||
            o.buyerUsername.toLowerCase().includes(q) ||
            o.sellerUsername.toLowerCase().includes(q)
        );
      case "stream":
        return state.streams.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.sellerUsername.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        );
    }
  },

  // ─── HITL Queue ────────────────────────────────────────────

  addPendingIntent: (intent: Intent) => {
    const pending: PendingIntent = {
      id: generateId("pi"),
      intent,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      pendingIntents: [...state.pendingIntents, pending],
    }));
  },

  executeIntent: (intentId: string) => {
    const state = get();
    const pending = state.pendingIntents.find((p) => p.id === intentId);
    if (!pending) return;

    const { intent } = pending;

    // Execute the mutation based on intent type
    switch (intent.type) {
      case "REFUND_ORDER":
        state.refundOrder(
          intent.payload.orderId ?? "",
          intent.payload.reason,
          intent.payload.amount
        );
        break;
      case "FLAG_ACCOUNT":
        state.flagAccount(
          intent.payload.username,
          intent.payload.action,
          intent.payload.reason
        );
        break;
      case "GRANT_CREDIT":
        state.grantCredit(
          intent.payload.username,
          intent.payload.amount,
          intent.payload.reason
        );
        break;
      case "QUERY_STATE":
        // Read-only — no mutation needed, but log it
        set((s) => ({
          actionLog: [
            ...s.actionLog,
            {
              id: generateId("log"),
              intentType: "QUERY_STATE",
              payload: intent.payload,
              status: "executed" as const,
              executedAt: new Date().toISOString(),
              executedBy: "ops_manager_j",
            },
          ],
        }));
        break;
    }

    // Remove from pending queue
    set((s) => ({
      pendingIntents: s.pendingIntents.filter((p) => p.id !== intentId),
    }));
  },

  cancelIntent: (intentId: string) => {
    set((state) => {
      const pending = state.pendingIntents.find((p) => p.id === intentId);
      if (!pending) return state;

      const logEntry: ActionLogEntry = {
        id: generateId("log"),
        intentType: pending.intent.type,
        payload: pending.intent.payload as Record<string, unknown>,
        status: "cancelled",
        executedAt: new Date().toISOString(),
        executedBy: "ops_manager_j",
      };

      return {
        pendingIntents: state.pendingIntents.filter((p) => p.id !== intentId),
        actionLog: [...state.actionLog, logEntry],
      };
    });
  },
}));

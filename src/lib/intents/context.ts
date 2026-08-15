import type { User, Order, Stream } from "@/store/types";

export interface RouterContext {
  users: { username: string; status: string; role: string }[];
  orders: { id: string; buyerUsername: string; sellerUsername: string; itemName: string; amount: number; status: string }[];
  streams: { id: string; sellerUsername: string; title: string; status: string }[];
}

/**
 * Extracts a lightweight context summary from the current store state.
 * This context is injected into the Gemini system prompt so the model
 * knows what entities exist and can validate references.
 */
export function buildRouterContext(
  users: User[],
  orders: Order[],
  streams: Stream[]
): RouterContext {
  return {
    users: users.map((u) => ({
      username: u.username,
      status: u.status,
      role: u.role,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      buyerUsername: o.buyerUsername,
      sellerUsername: o.sellerUsername,
      itemName: o.itemName,
      amount: o.amount,
      status: o.status,
    })),
    streams: streams.map((s) => ({
      id: s.id,
      sellerUsername: s.sellerUsername,
      title: s.title,
      status: s.status,
    })),
  };
}

/**
 * Formats the context into a human-readable string for the system prompt.
 */
export function formatContextForPrompt(ctx: RouterContext): string {
  const userLines = ctx.users
    .map((u) => `  - @${u.username} (${u.role}, ${u.status})`)
    .join("\n");

  const orderLines = ctx.orders
    .map(
      (o) =>
        `  - ${o.id}: "${o.itemName}" — $${o.amount} (buyer: @${o.buyerUsername}, seller: @${o.sellerUsername}, status: ${o.status})`
    )
    .join("\n");

  const streamLines = ctx.streams
    .map((s) => `  - ${s.id}: "${s.title}" by @${s.sellerUsername} (${s.status})`)
    .join("\n");

  return `AVAILABLE ENTITIES:

Users:
${userLines}

Orders:
${orderLines}

Streams:
${streamLines}`;
}

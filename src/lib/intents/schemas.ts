import * as z from "zod/v4";

// ─── Intent Payload Schemas ────────────────────────────────────

export const refundOrderPayloadSchema = z.object({
  orderId: z.string().optional(),
  buyerUsername: z.string(),
  reason: z.string(),
  amount: z.coerce.number().optional(),
});

export const flagAccountPayloadSchema = z.object({
  username: z.string(),
  reason: z.string(),
  action: z.enum(["warning", "suspend_payouts", "ban"]).default("warning"),
});

export const grantCreditPayloadSchema = z.object({
  username: z.string(),
  amount: z.coerce.number(),
  reason: z.string(),
});

export const queryStatePayloadSchema = z.object({
  entity: z.enum(["user", "order", "stream"]),
  query: z.string(),
});

// ─── Full Intent Schemas (with type discriminator) ─────────────

export const refundOrderIntentSchema = z.object({
  type: z.literal("REFUND_ORDER"),
  payload: refundOrderPayloadSchema,
});

export const flagAccountIntentSchema = z.object({
  type: z.literal("FLAG_ACCOUNT"),
  payload: flagAccountPayloadSchema,
});

export const grantCreditIntentSchema = z.object({
  type: z.literal("GRANT_CREDIT"),
  payload: grantCreditPayloadSchema,
});

export const queryStateIntentSchema = z.object({
  type: z.literal("QUERY_STATE"),
  payload: queryStatePayloadSchema,
});

export const intentSchema = z.discriminatedUnion("type", [
  refundOrderIntentSchema,
  flagAccountIntentSchema,
  grantCreditIntentSchema,
  queryStateIntentSchema,
]);

export const intentArraySchema = z.array(intentSchema);

// ─── Type Exports ──────────────────────────────────────────────

export type ParsedIntent = z.infer<typeof intentSchema>;
export type ParsedIntentArray = z.infer<typeof intentArraySchema>;

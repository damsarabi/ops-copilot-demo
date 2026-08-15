import { ai, GEMINI_MODEL } from "@/lib/gemini";
import { intentArraySchema, type ParsedIntentArray } from "./schemas";
import { formatContextForPrompt, type RouterContext } from "./context";
import type { Type } from "@google/genai";

// ─── JSON Schema for Gemini Structured Output ──────────────────

const INTENT_RESPONSE_SCHEMA = {
  type: "ARRAY" as Type,
  items: {
    type: "OBJECT" as Type,
    properties: {
      type: {
        type: "STRING" as Type,
        enum: ["REFUND_ORDER", "FLAG_ACCOUNT", "GRANT_CREDIT", "QUERY_STATE"],
        description: "The intent type",
      },
      payload: {
        type: "OBJECT" as Type,
        description: "The intent payload. Shape depends on the intent type.",
        properties: {
          orderId: { type: "STRING" as Type, description: "Order ID (for REFUND_ORDER)" },
          buyerUsername: { type: "STRING" as Type, description: "Buyer username (for REFUND_ORDER)" },
          username: { type: "STRING" as Type, description: "Username (for FLAG_ACCOUNT, GRANT_CREDIT)" },
          reason: { type: "STRING" as Type, description: "Reason for the action" },
          amount: { type: "NUMBER" as Type, description: "Amount (for REFUND_ORDER, GRANT_CREDIT)" },
          action: {
            type: "STRING" as Type,
            enum: ["warning", "suspend_payouts", "ban"],
            description: "Moderation action (for FLAG_ACCOUNT)",
          },
          entity: {
            type: "STRING" as Type,
            enum: ["user", "order", "stream"],
            description: "Entity type to query (for QUERY_STATE)",
          },
          query: { type: "STRING" as Type, description: "Search query (for QUERY_STATE)" },
        },
        required: ["reason"],
      },
    },
    required: ["type", "payload"],
  },
};

// ─── System Prompt ─────────────────────────────────────────────

function buildSystemPrompt(contextBlock: string): string {
  return `You are an operations copilot for LiveLoot, a live commerce platform.
Your job is to parse natural language commands from ops managers into structured intents.

You support exactly 4 intent types:

1. REFUND_ORDER — Issue a refund to a buyer
   Required payload fields: buyerUsername, reason
   Optional payload fields: orderId, amount (if omitted, full refund)

2. FLAG_ACCOUNT — Take moderation action on a user
   Required payload fields: username, reason, action
   The "action" field MUST always be present. Choose one of: "warning", "suspend_payouts", "ban".
   If the user says "warn" or "issue a warning", use "warning".
   If the user says "suspend" or "freeze payouts", use "suspend_payouts".
   If the user says "ban" or "remove", use "ban".

3. GRANT_CREDIT — Give promotional credit to a user
   Required payload fields: username, amount, reason

4. QUERY_STATE — Look up information (read-only)
   Required payload fields: entity (one of: "user", "order", "stream"), query

RULES:
- Always return a JSON array of intents, even for a single command.
- A single message may produce multiple intents (batch support).
- Only reference entities that exist in the context below.
- If a username is prefixed with "@", strip the "@" before using it.
- If you cannot determine the intent, return an empty array [].
- Never invent entity IDs — use only what's available in the context.
- For REFUND_ORDER, try to resolve the orderId from context if the user mentions an item name or buyer.
- For FLAG_ACCOUNT, always include the "action" field — never omit it.

${contextBlock}`;
}

// ─── Router ────────────────────────────────────────────────────

export interface RouterResult {
  intents: ParsedIntentArray;
  rawResponse: string;
}

export interface RouterError {
  error: string;
  rawResponse?: string;
}

export async function routeIntent(
  message: string,
  context: RouterContext
): Promise<RouterResult | RouterError> {
  const contextBlock = formatContextForPrompt(context);
  const systemPrompt = buildSystemPrompt(contextBlock);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: INTENT_RESPONSE_SCHEMA,
        temperature: 0.1, // Low temp for deterministic routing
      },
    });

    const rawText = response.text ?? "[]";

    // Parse the JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return {
        error: "Failed to parse Gemini response as JSON",
        rawResponse: rawText,
      };
    }

    // Validate against Zod schema (second safety net)
    const validation = intentArraySchema.safeParse(parsed);
    if (!validation.success) {
      return {
        error: `Intent validation failed: ${JSON.stringify(validation.error.issues)}`,
        rawResponse: rawText,
      };
    }

    return {
      intents: validation.data,
      rawResponse: rawText,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error calling Gemini";
    return { error: errorMessage };
  }
}

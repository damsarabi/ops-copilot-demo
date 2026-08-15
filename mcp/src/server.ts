#!/usr/bin/env node
/**
 * LiveLoot Ops Router — MCP Server
 *
 * Exposes the intent router as a reusable MCP tool that any
 * MCP-compatible client (Claude Desktop, Cursor, etc.) can call.
 *
 * Tool: route_intent
 *   Input:  { message: string }
 *   Output: Array of structured LiveLoot intents (REFUND_ORDER,
 *           FLAG_ACCOUNT, GRANT_CREDIT, QUERY_STATE)
 */

// Load .env from the mcp/ directory — must run before any env var access
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../.env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// ─── Gemini Setup ───────────────────────────────────────────────

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  process.stderr.write(
    "ERROR: GOOGLE_API_KEY environment variable is not set.\n"
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-3.5-flash-lite";

// ─── Intent Schemas (Zod v3 for standalone use) ─────────────────

const refundOrderSchema = z.object({
  type: z.literal("REFUND_ORDER"),
  payload: z.object({
    orderId: z.string().optional(),
    buyerUsername: z.string(),
    reason: z.string(),
    amount: z.coerce.number().optional(),
  }),
});

const flagAccountSchema = z.object({
  type: z.literal("FLAG_ACCOUNT"),
  payload: z.object({
    username: z.string(),
    reason: z.string(),
    action: z.enum(["warning", "suspend_payouts", "ban"]).default("warning"),
  }),
});

const grantCreditSchema = z.object({
  type: z.literal("GRANT_CREDIT"),
  payload: z.object({
    username: z.string(),
    amount: z.coerce.number(),
    reason: z.string(),
  }),
});

const queryStateSchema = z.object({
  type: z.literal("QUERY_STATE"),
  payload: z.object({
    entity: z.enum(["user", "order", "stream"]),
    query: z.string(),
  }),
});

const intentArraySchema = z.array(
  z.discriminatedUnion("type", [
    refundOrderSchema,
    flagAccountSchema,
    grantCreditSchema,
    queryStateSchema,
  ])
);

// ─── System Prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an operations copilot for LiveLoot, a live commerce platform.
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
   IMPORTANT: The \`amount\` field is REQUIRED and must ALWAYS be present. Extract the dollar amount from the user's message. Never omit it.

4. QUERY_STATE — Look up information (read-only)
   Required payload fields: entity (one of: "user", "order", "stream"), query

RULES:
- Always return a JSON array of intents, even for a single command.
- A single message may produce multiple intents (batch support).
- If a username is prefixed with "@", strip the "@" before using it.
- If you cannot determine the intent, return an empty array [].
- For FLAG_ACCOUNT, always include the "action" field — never omit it.`;

// ─── Gemini Response Schema ─────────────────────────────────────

const GEMINI_RESPONSE_SCHEMA = {
  type: "ARRAY" as const,
  items: {
    type: "OBJECT" as const,
    properties: {
      type: {
        type: "STRING" as const,
        enum: ["REFUND_ORDER", "FLAG_ACCOUNT", "GRANT_CREDIT", "QUERY_STATE"],
      },
      payload: {
        type: "OBJECT" as const,
        properties: {
          orderId: { type: "STRING" as const },
          buyerUsername: { type: "STRING" as const },
          username: { type: "STRING" as const },
          reason: { type: "STRING" as const },
          amount: { type: "NUMBER" as const },
          action: {
            type: "STRING" as const,
            enum: ["warning", "suspend_payouts", "ban"],
          },
          entity: {
            type: "STRING" as const,
            enum: ["user", "order", "stream"],
          },
          query: { type: "STRING" as const },
        },
        required: ["reason"],
      },
    },
    required: ["type", "payload"],
  },
};

// ─── Route Intent Function ──────────────────────────────────────

async function routeIntent(message: string): Promise<{
  intents: z.infer<typeof intentArraySchema>;
  rawResponse: string;
}> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: message,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const rawText = response.text ?? "[]";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(`Failed to parse Gemini response: ${rawText}`);
  }

  // Normalize amount fields (Gemini may return strings despite NUMBER schema)
  if (Array.isArray(parsed)) {
    parsed = parsed.map((intent: unknown) => {
      if (typeof intent === "object" && intent !== null) {
        const i = intent as Record<string, unknown>;
        if (typeof i.payload === "object" && i.payload !== null) {
          const p = i.payload as Record<string, unknown>;
          if (typeof p.amount === "string" && p.amount !== "") {
            const coerced = parseFloat(p.amount);
            if (!isNaN(coerced)) p.amount = coerced;
          }
        }
      }
      return intent;
    });
  }

  const validation = intentArraySchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      `Intent validation failed: ${JSON.stringify(validation.error.issues)}\nRaw: ${rawText}`
    );
  }

  return { intents: validation.data, rawResponse: rawText };
}

// ─── MCP Server ─────────────────────────────────────────────────

const server = new McpServer({
  name: "liveloot-ops-router",
  version: "1.0.0",
});

server.tool(
  "route_intent",
  "Parse a natural language LiveLoot ops command into structured intents. " +
    "Returns an array of typed intents (REFUND_ORDER, FLAG_ACCOUNT, GRANT_CREDIT, QUERY_STATE). " +
    "Supports batch commands — a single message can produce multiple intents.",
  {
    message: z
      .string()
      .describe(
        "Natural language ops command, e.g. 'Refund @sneakerhead99 and warn @sellerX'"
      ),
  },
  async ({ message }) => {
    try {
      const result = await routeIntent(message);

      const formatted = result.intents
        .map((intent, i) => {
          const payload = Object.entries(intent.payload)
            .map(([k, v]) => `  ${k}: ${v}`)
            .join("\n");
          return `Intent ${i + 1}: ${intent.type}\n${payload}`;
        })
        .join("\n\n");

      const summary =
        result.intents.length === 0
          ? "No intents could be determined from the input."
          : `Parsed ${result.intents.length} intent(s):\n\n${formatted}`;

      return {
        content: [
          {
            type: "text" as const,
            text: summary,
          },
          {
            type: "text" as const,
            text: `\n---\nRaw JSON:\n${JSON.stringify(result.intents, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// ─── Start ──────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("LiveLoot Ops Router MCP server running\n");

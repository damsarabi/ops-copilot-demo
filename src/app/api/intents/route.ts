import { routeIntent, type RouterResult, type RouterError } from "@/lib/intents/router";
import { buildRouterContext } from "@/lib/intents/context";
import { seedUsers, seedOrders, seedStreams } from "@/store/seed-data";

// Force dynamic — this route calls an external API
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Validate API key is configured
  if (!process.env.GOOGLE_API_KEY) {
    return Response.json(
      { error: "GOOGLE_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // Parse request body
  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json(
      { error: "Missing or empty 'message' field" },
      { status: 400 }
    );
  }

  // Build context from seed data
  // In a real app, this would read from the Zustand store or a database
  const context = buildRouterContext(seedUsers, seedOrders, seedStreams);

  // Route the intent
  const result = await routeIntent(message.trim(), context);

  // Check if it's an error
  if ("error" in result) {
    const errorResult = result as RouterError;
    return Response.json(
      { error: errorResult.error, rawResponse: errorResult.rawResponse },
      { status: 422 }
    );
  }

  // Success
  const successResult = result as RouterResult;
  return Response.json({
    intents: successResult.intents,
    rawResponse: successResult.rawResponse,
  });
}

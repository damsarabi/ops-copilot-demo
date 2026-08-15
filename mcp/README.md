# LiveLoot Ops Router — MCP Server

Exposes the LiveLoot intent router as a reusable [Model Context Protocol](https://modelcontextprotocol.io) tool.

## What it does

Any MCP-compatible client (Claude Desktop, Cursor, etc.) can call `route_intent` with a natural language ops command and receive structured intents back — the same routing engine that powers the dashboard.

**Example input:**
> "Refund @sneakerhead99 for the damaged funko pop and issue a warning to @sellerX"

**Example output:**
```json
[
  {
    "type": "REFUND_ORDER",
    "payload": { "buyerUsername": "sneakerhead99", "reason": "damaged funko pop" }
  },
  {
    "type": "FLAG_ACCOUNT",
    "payload": { "username": "sellerX", "reason": "damaged item", "action": "warning" }
  }
]
```

## Setup

### 1. Install dependencies
```bash
cd mcp && npm install
```

### 2. Build
```bash
npm run build
```

### 3. Set your API key
```bash
export GOOGLE_API_KEY=your_key_here
```

## Testing with MCP Inspector

```bash
GOOGLE_API_KEY=your_key npx @modelcontextprotocol/inspector node /path/to/mcp/dist/server.js
```

Opens a browser UI at `http://localhost:5173` where you can call `route_intent` interactively.

## Claude Desktop Integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "liveloot-router": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Desktop/Whatnot-ops-copilot/mcp/dist/server.js"],
      "env": {
        "GOOGLE_API_KEY": "your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop — the `route_intent` tool will appear automatically.

## Tool Reference

### `route_intent`

| Field | Type | Description |
|---|---|---|
| `message` | `string` | Natural language ops command |

**Supported intents:** `REFUND_ORDER` · `FLAG_ACCOUNT` · `GRANT_CREDIT` · `QUERY_STATE`

**Batch support:** A single message can produce multiple intents.

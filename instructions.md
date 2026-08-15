# Pre-Deployment Code Audit

## Status
Phase 5 (Eval Suite) ✅ — Phase 6 (MCP Server) ✅ — Phase 7 (Deploy) pending audit below.

## Goal
Clean up the codebase before pushing to GitHub (public) and deploying to Vercel.
All items should be addressed in a single commit before deploy.

---

## 🔴 P1 — Fix Before Deploy

### 1. README — 3 inaccuracies
- Model name: "Gemini 2.0 Flash" → "Gemini 3.5 Flash Lite"
- Remove `executor.ts` from project structure (file doesn't exist)
- Replace `evals/` directory entry with `promptfooconfig.yaml` at root

### 2. Delete unused default Next.js assets
Files to delete from `public/`:
- `vercel.svg`
- `next.svg`
- `file.svg`
- `globe.svg`
- `window.svg`

None are referenced in code. Pure boilerplate noise.

### 3. Gitignore `instructions.md`
This is an agent task file, not for public consumption.

---

## 🟡 P2 — Best Practices

### 4. Add input length guard to `/api/intents`
File: `src/app/api/intents/route.ts`
After message validation, add:
```typescript
if (message.length > 500) {
  return Response.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
}
```

### 5. Add comment to `promptfooconfig.yaml`
Note that `pnpm dev` must be running before executing evals.

---

## 🟢 P3 — Polish

### 6. Add MCP section to README
Reference `mcp/README.md` with a brief description and link.

### 7. Fix `.env.example` comment
Update model name reference from "Gemini 2.0 Flash" → "Gemini 3.5 Flash Lite".

### 8. Add security headers to `next.config.ts`
Standard headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.

---

## Commit Message (draft)
```
chore: pre-deploy audit — docs, cleanup, security hardening
```

## After This Commit
→ Push all commits to GitHub
→ Connect repo to Vercel
→ Set GOOGLE_API_KEY in Vercel env vars
→ Deploy

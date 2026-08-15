"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { Sparkles, Loader2, Command, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Intent } from "@/store/types";

const QUICK_PRESETS = [
  {
    label: "Refund & Warn",
    prompt: "Refund buyer @sneakerhead99 for the damaged funko pop and issue a warning to @sellerX",
  },
  {
    label: "Grant Credit",
    prompt: "Grant @vintage_collector $50 credit for delayed shipping",
  },
  {
    label: "Ban Seller",
    prompt: "Ban @cardshark_mike for non-delivery of PSA 10 Charizard",
  },
  {
    label: "Query Orders",
    prompt: "Show me all disputed orders",
  },
];

export function CommandBar() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPendingIntent = useAppStore((s) => s.addPendingIntent);

  // Keyboard shortcut (⌘K or Ctrl+K) to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to process intent");
        setLoading(false);
        return;
      }

      const intents: Intent[] = data.intents || [];
      if (intents.length === 0) {
        setStatusMessage("No executable intent recognized for this query.");
      } else {
        intents.forEach((intent) => addPendingIntent(intent));
        setStatusMessage(
          `Successfully generated ${intents.length} intent${
            intents.length > 1 ? "s" : ""
          } → Added to HITL Queue`
        );
        setInput("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50 p-4">
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
        <div className="relative flex items-center">
          <Sparkles className="absolute left-3.5 h-4 w-4 text-amber-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type an ops command (e.g. 'Refund @sneakerhead99 for damaged item and warn @sellerX')..."
            disabled={loading}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 py-2.5 pl-10 pr-24 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <kbd className="hidden items-center gap-0.5 rounded border border-zinc-700 bg-zinc-900 px-1.5 font-mono text-[10px] text-zinc-400 sm:flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-zinc-950 transition-hover hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Parsing...
                </>
              ) : (
                "Run Copilot"
              )}
            </button>
          </div>
        </div>

        {/* Presets & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-500">
              Quick presets:
            </span>
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setInput(preset.prompt);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-0.5 text-[11px] text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-1.5 text-red-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
          {statusMessage && !error && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

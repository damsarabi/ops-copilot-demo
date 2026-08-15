"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import {
  Sparkles,
  Loader2,
  Command,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Gift,
  ShieldBan,
  Search,
  HelpCircle,
  X,
  ChevronRight,
} from "lucide-react";
import type { Intent } from "@/store/types";

// ─── Quick Presets ─────────────────────────────────────────────

const QUICK_PRESETS = [
  {
    label: "Refund & Warn",
    description: "Batch: refund buyer + flag seller",
    prompt: "Refund buyer @sneakerhead99 for the damaged funko pop and issue a warning to @sellerX",
    icon: RotateCcw,
    color: "amber",
  },
  {
    label: "Grant Credit",
    description: "Compensate a buyer with store credit",
    prompt: "Give @funko_king $50 credit for delayed shipping on the Batman Funko",
    icon: Gift,
    color: "emerald",
  },
  {
    label: "Ban & Credit",
    description: "Ban fraudster + compensate victim",
    prompt: "Permanently ban @cardshark_mike for confirmed fraud and give @sneakerhead99 $100 credit",
    icon: ShieldBan,
    color: "red",
  },
  {
    label: "Query Orders",
    description: "Look up disputed order state",
    prompt: "Show me all disputed orders",
    icon: Search,
    color: "blue",
  },
];

const COLOR_MAP = {
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
    icon: "text-amber-400",
    label: "text-amber-300",
    dot: "bg-amber-400",
    ring: "hover:ring-amber-500/30",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    icon: "text-emerald-400",
    label: "text-emerald-300",
    dot: "bg-emerald-400",
    ring: "hover:ring-emerald-500/30",
  },
  red: {
    border: "border-red-500/40",
    bg: "bg-red-500/10 hover:bg-red-500/20",
    icon: "text-red-400",
    label: "text-red-300",
    dot: "bg-red-400",
    ring: "hover:ring-red-500/30",
  },
  blue: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    icon: "text-blue-400",
    label: "text-blue-300",
    dot: "bg-blue-400",
    ring: "hover:ring-blue-500/30",
  },
};

// ─── Help Reference Panel ──────────────────────────────────────

const HELP_EXAMPLES = [
  {
    category: "Refund Order",
    color: "text-amber-400",
    dot: "bg-amber-400",
    examples: [
      "Refund @sneakerhead99 for the damaged funko pop",
      "Refund the Batman Funko order for @funko_king — full amount",
    ],
  },
  {
    category: "Flag Account",
    color: "text-red-400",
    dot: "bg-red-400",
    examples: [
      "Issue a warning to @sellerX for ending the stream early",
      "Suspend payouts for @cardshark_mike while we investigate",
      "Permanently ban @cardshark_mike — confirmed fraud",
    ],
  },
  {
    category: "Grant Credit",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    examples: [
      "Give @funko_king $50 credit for delayed shipping",
      "Grant $25 credit to @sneakerhead99 for the late delivery",
    ],
  },
  {
    category: "Query State",
    color: "text-blue-400",
    dot: "bg-blue-400",
    examples: [
      "Show me all disputed orders",
      "Look up @cardshark_mike's account status",
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────

export function CommandBar() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPendingIntent = useAppStore((s) => s.addPendingIntent);

  // Keyboard shortcut (⌘K or Ctrl+K) to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setHelpOpen(false);
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
          `Generated ${intents.length} intent${intents.length > 1 ? "s" : ""} → Added to HITL Queue`
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
    <div className="border-b border-zinc-800 bg-zinc-900/50">
      <div className="p-4">
        {/* Input row */}
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
          <div className="relative flex items-center">
            <Sparkles className="absolute left-3.5 h-4 w-4 text-amber-400" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an ops command… e.g. 'Refund @sneakerhead99 and warn @sellerX'"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 py-2.5 pl-10 pr-28 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
            />
            <div className="absolute right-3 flex items-center gap-2">
              <kbd className="hidden items-center gap-0.5 rounded border border-zinc-700 bg-zinc-900 px-1.5 font-mono text-[10px] text-zinc-400 sm:flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-zinc-950 transition-all hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Parsing…
                  </>
                ) : (
                  "Run Copilot"
                )}
              </button>
            </div>
          </div>

          {/* Preset cards row */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  ⚡ Try a live demo
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <HelpCircle className="h-3 w-3" />
                What can I type?
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_PRESETS.map((preset) => {
                const c = COLOR_MAP[preset.color as keyof typeof COLOR_MAP];
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setInput(preset.prompt);
                      inputRef.current?.focus();
                    }}
                    className={`group relative flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-all hover:ring-1 ${c.border} ${c.bg} ${c.ring}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`h-3.5 w-3.5 ${c.icon}`} />
                      <ChevronRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${c.label}`}>
                        {preset.label}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status / error row */}
          {(error || statusMessage) && (
            <div className="flex items-center">
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {statusMessage && !error && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Help Panel */}
      {helpOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950/80 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Command Reference
            </span>
            <button
              onClick={() => setHelpOpen(false)}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HELP_EXAMPLES.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${group.dot}`} />
                  <span className={`text-[11px] font-semibold ${group.color}`}>
                    {group.category}
                  </span>
                </div>
                <ul className="space-y-1">
                  {group.examples.map((ex) => (
                    <li key={ex}>
                      <button
                        className="w-full text-left text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors leading-relaxed"
                        onClick={() => {
                          setInput(ex);
                          setHelpOpen(false);
                          inputRef.current?.focus();
                        }}
                      >
                        <span className="text-zinc-600 mr-1">›</span>
                        {ex}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-zinc-600 border-t border-zinc-800 pt-2">
            Batch commands supported — combine multiple actions in one sentence. Supports @username references from the live state panel.
          </p>
        </div>
      )}
    </div>
  );
}

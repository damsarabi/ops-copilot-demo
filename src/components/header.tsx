"use client";

import { useAppStore } from "@/store";
import { Activity, ShieldAlert, Radio, ShoppingBag, Terminal } from "lucide-react";

export function Header() {
  const users = useAppStore((s) => s.users);
  const orders = useAppStore((s) => s.orders);
  const streams = useAppStore((s) => s.streams);
  const pendingIntents = useAppStore((s) => s.pendingIntents);

  const disputedCount = orders.filter((o) => o.status === "disputed").length;
  const liveStreamCount = streams.filter((s) => s.status === "live").length;
  const flaggedUsers = users.filter((u) => u.status !== "active").length;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3.5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-100">
                LiveLoot
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                OPS COPILOT
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Autonomous & Intent-Based Operations Agent
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-zinc-400">Live Streams:</span>
            <span className="font-mono font-medium text-emerald-400">
              {liveStreamCount}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-400">Disputed Orders:</span>
            <span className="font-mono font-medium text-amber-400">
              {disputedCount}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-zinc-400">Flagged Users:</span>
            <span className="font-mono font-medium text-purple-400">
              {flaggedUsers}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-zinc-400">HITL Queue:</span>
            <span className="font-mono font-medium text-blue-400">
              {pendingIntents.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

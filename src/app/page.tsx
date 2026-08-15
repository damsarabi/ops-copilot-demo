"use client";

import { useAppStore } from "@/store";
import { Header } from "@/components/header";
import { CommandBar } from "@/components/command-bar";
import { ActionCard } from "@/components/action-card";
import { StatePanel } from "@/components/state-panel";
import { AuditLog } from "@/components/audit-log";
import { Inbox, Cpu, ShieldCheck, CheckCheck } from "lucide-react";

export default function DashboardPage() {
  const pendingIntents = useAppStore((s) => s.pendingIntents);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Top Navigation & Status */}
      <Header />

      {/* Main Command Bar */}
      <CommandBar />

      {/* Main Grid Layout */}
      <main className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: HITL Pending Intents Queue */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-amber-400" />
                <h2 className="font-semibold text-sm tracking-tight text-zinc-100">
                  Human-In-The-Loop Queue
                </h2>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
                {pendingIntents.length} Pending
              </span>
            </div>

            {/* List of Pending Action Cards */}
            <div className="flex flex-col gap-3">
              {pendingIntents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 mb-3 border border-zinc-800">
                    <CheckCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="font-medium text-xs text-zinc-300">
                    HITL Queue Empty
                  </h3>
                  <p className="mt-1 text-[11px] text-zinc-500 max-w-xs">
                    Type a natural language command in the copilot bar above to generate structured, actionable intents.
                  </p>
                </div>
              ) : (
                pendingIntents.map((item) => (
                  <ActionCard key={item.id} item={item} />
                ))
              )}
            </div>

            {/* Audit Log (Bottom of Left Column) */}
            <div className="mt-2">
              <AuditLog />
            </div>
          </section>

          {/* Right Column: Live Marketplace State View */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                <h2 className="font-semibold text-sm tracking-tight text-zinc-100">
                  Marketplace Live State Engine
                </h2>
              </div>
              <span className="flex items-center gap-1 font-mono text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                State Synced
              </span>
            </div>

            {/* Interactive Data Explorer */}
            <div className="flex-1 min-h-[500px]">
              <StatePanel />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-2.5 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          LiveLoot Ops Copilot v1.0 • Powered by Gemini 3.5 Flash-Lite & Zustand
        </div>
        <div className="text-[11px] text-zinc-600">
          Human-in-the-Loop Intent Architecture • Zero Auto-Execution Safety Directive
        </div>
      </footer>
    </div>
  );
}

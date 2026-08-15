"use client";

import { useAppStore } from "@/store";
import { History, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export function AuditLog() {
  const actionLog = useAppStore((s) => s.actionLog);

  return (
    <div className="flex flex-col border border-zinc-800 bg-zinc-900/60 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-3 px-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-xs text-zinc-100 uppercase tracking-wider">
            Audit Trail & Execution Log
          </span>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {actionLog.length} {actionLog.length === 1 ? "entry" : "entries"} recorded
        </span>
      </div>

      {/* Log entries */}
      <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60">
        {actionLog.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No executed actions yet. Approve an intent in the queue above to record an audit entry.
          </div>
        ) : (
          [...actionLog].reverse().map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-zinc-800/30"
            >
              <div className="flex items-center gap-3">
                {entry.status === "executed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-zinc-200">
                      {entry.intentType}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[10px] uppercase font-semibold ${
                        entry.status === "executed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {JSON.stringify(entry.payload)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end text-right text-[11px] text-zinc-500">
                <span className="font-mono">
                  {new Date(entry.executedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <ShieldCheck className="h-3 w-3 text-zinc-500" />
                  {entry.executedBy}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

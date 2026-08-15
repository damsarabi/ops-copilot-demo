"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import type { PendingIntent } from "@/store/types";
import { formatCurrency } from "@/lib/utils";
import {
  Check,
  X,
  Code2,
  DollarSign,
  ShieldAlert,
  Gift,
  Search,
  User,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

interface ActionCardProps {
  item: PendingIntent;
}

export function ActionCard({ item }: ActionCardProps) {
  const [showJson, setShowJson] = useState(false);
  const [executing, setExecuting] = useState(false);

  const executeIntent = useAppStore((s) => s.executeIntent);
  const cancelIntent = useAppStore((s) => s.cancelIntent);

  const { intent, id, createdAt } = item;

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      executeIntent(id);
    }, 150);
  };

  const handleCancel = () => {
    cancelIntent(id);
  };

  // Intent type styling & iconography
  const getIntentConfig = () => {
    switch (intent.type) {
      case "REFUND_ORDER":
        return {
          label: "REFUND ORDER",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          accentColor: "border-l-amber-500",
          icon: <DollarSign className="h-4 w-4 text-amber-400" />,
        };
      case "FLAG_ACCOUNT":
        return {
          label: "FLAG ACCOUNT",
          badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
          accentColor: "border-l-red-500",
          icon: <ShieldAlert className="h-4 w-4 text-red-400" />,
        };
      case "GRANT_CREDIT":
        return {
          label: "GRANT CREDIT",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          accentColor: "border-l-emerald-500",
          icon: <Gift className="h-4 w-4 text-emerald-400" />,
        };
      case "QUERY_STATE":
        return {
          label: "QUERY STATE",
          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          accentColor: "border-l-blue-500",
          icon: <Search className="h-4 w-4 text-blue-400" />,
        };
    }
  };

  const config = getIntentConfig();

  return (
    <div
      className={`group relative flex flex-col rounded-lg border border-zinc-800 border-l-4 ${config.accentColor} bg-zinc-900/90 p-4 transition-all hover:border-zinc-700`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          {config.icon}
          <span
            className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${config.badgeColor}`}
          >
            {config.label}
          </span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500">
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>

      {/* Body Details depending on Intent Type */}
      <div className="my-3 space-y-2 text-xs">
        {intent.type === "REFUND_ORDER" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <User className="h-3.5 w-3.5" /> Buyer:
              </span>
              <span className="font-semibold text-zinc-100">
                @{intent.payload.buyerUsername}
              </span>
            </div>
            {intent.payload.orderId && (
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <PackageCheck className="h-3.5 w-3.5" /> Order ID:
                </span>
                <span className="font-mono text-amber-300">
                  {intent.payload.orderId}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Refund Amount:</span>
              <span className="font-mono font-bold text-amber-400">
                {intent.payload.amount ? formatCurrency(intent.payload.amount) : "Full Amount"}
              </span>
            </div>
            <div className="rounded bg-zinc-950/70 p-2 text-zinc-300 border border-zinc-800/60">
              <span className="font-medium text-zinc-400">Reason: </span>
              {intent.payload.reason}
            </div>
          </div>
        )}

        {intent.type === "FLAG_ACCOUNT" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <User className="h-3.5 w-3.5" /> Target User:
              </span>
              <span className="font-semibold text-zinc-100">
                @{intent.payload.username}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Action:</span>
              <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-red-300 uppercase">
                {intent.payload.action}
              </span>
            </div>
            <div className="rounded bg-zinc-950/70 p-2 text-zinc-300 border border-zinc-800/60">
              <span className="font-medium text-zinc-400">Reason: </span>
              {intent.payload.reason}
            </div>
          </div>
        )}

        {intent.type === "GRANT_CREDIT" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <User className="h-3.5 w-3.5" /> User:
              </span>
              <span className="font-semibold text-zinc-100">
                @{intent.payload.username}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Credit Amount:</span>
              <span className="font-mono font-bold text-emerald-400">
                +{formatCurrency(intent.payload.amount)}
              </span>
            </div>
            <div className="rounded bg-zinc-950/70 p-2 text-zinc-300 border border-zinc-800/60">
              <span className="font-medium text-zinc-400">Reason: </span>
              {intent.payload.reason}
            </div>
          </div>
        )}

        {intent.type === "QUERY_STATE" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Entity:</span>
              <span className="font-mono uppercase text-blue-300">
                {intent.payload.entity}
              </span>
            </div>
            <div className="rounded bg-zinc-950/70 p-2 text-zinc-300 border border-zinc-800/60">
              <span className="font-medium text-zinc-400">Search: </span>
              "{intent.payload.query}"
            </div>
          </div>
        )}
      </div>

      {/* Raw JSON viewer */}
      {showJson && (
        <pre className="mb-3 max-h-36 overflow-x-auto rounded bg-zinc-950 p-2.5 font-mono text-[10px] text-zinc-400 border border-zinc-800">
          {JSON.stringify(intent, null, 2)}
        </pre>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <Code2 className="h-3.5 w-3.5" />
          {showJson ? "Hide JSON" : "Inspect JSON"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={executing}
            className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={executing}
            className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {executing ? "Executing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

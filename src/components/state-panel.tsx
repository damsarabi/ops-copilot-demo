"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingBag,
  Radio,
  LifeBuoy,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  RefreshCw,
} from "lucide-react";

export function StatePanel() {
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "streams" | "tickets">("users");
  const [search, setSearch] = useState("");

  const users = useAppStore((s) => s.users);
  const orders = useAppStore((s) => s.orders);
  const streams = useAppStore((s) => s.streams);
  const tickets = useAppStore((s) => s.tickets);

  const queryLower = search.toLowerCase();

  // Filtered lists
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(queryLower) ||
      u.displayName.toLowerCase().includes(queryLower) ||
      u.email.toLowerCase().includes(queryLower) ||
      u.status.toLowerCase().includes(queryLower)
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(queryLower) ||
      o.itemName.toLowerCase().includes(queryLower) ||
      o.buyerUsername.toLowerCase().includes(queryLower) ||
      o.sellerUsername.toLowerCase().includes(queryLower) ||
      o.status.toLowerCase().includes(queryLower)
  );

  const filteredStreams = streams.filter(
    (s) =>
      s.id.toLowerCase().includes(queryLower) ||
      s.title.toLowerCase().includes(queryLower) ||
      s.sellerUsername.toLowerCase().includes(queryLower) ||
      s.category.toLowerCase().includes(queryLower)
  );

  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(queryLower) ||
      t.description.toLowerCase().includes(queryLower) ||
      t.reporterUsername.toLowerCase().includes(queryLower) ||
      t.status.toLowerCase().includes(queryLower)
  );

  return (
    <div className="flex h-full flex-col border border-zinc-800 bg-zinc-900/60 rounded-lg overflow-hidden">
      {/* Header & Search */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "users"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Users
            <span className="ml-1 rounded-full bg-zinc-700/60 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Orders
            <span className="ml-1 rounded-full bg-zinc-700/60 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("streams")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "streams"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            Streams
            <span className="ml-1 rounded-full bg-zinc-700/60 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {streams.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "tickets"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Tickets
            <span className="ml-1 rounded-full bg-zinc-700/60 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {tickets.length}
            </span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none sm:w-48"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="divide-y divide-zinc-800/80">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No users found.</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3.5 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                      {user.displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-100">
                          {user.displayName}
                        </span>
                        <span className="font-mono text-xs text-amber-400">
                          @{user.username}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400 uppercase">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="font-mono font-medium text-zinc-200">
                        {formatCurrency(user.balance)}
                      </div>
                      {user.creditBalance > 0 && (
                        <div className="font-mono text-[10px] text-emerald-400">
                          +{formatCurrency(user.creditBalance)} credit
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="w-24 text-right">
                      {user.status === "active" && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                      {user.status === "warned" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="h-3 w-3" /> Warned
                        </span>
                      )}
                      {user.status === "suspended" && (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/20">
                          <Clock className="h-3 w-3" /> Suspended
                        </span>
                      )}
                      {user.status === "banned" && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                          <Ban className="h-3 w-3" /> Banned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="divide-y divide-zinc-800/80">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No orders found.</div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amber-400">
                        {order.id}
                      </span>
                      <span className="font-medium text-xs text-zinc-100">
                        {order.itemName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>Buyer: <span className="text-zinc-200">@{order.buyerUsername}</span></span>
                      <span>•</span>
                      <span>Seller: <span className="text-zinc-200">@{order.sellerUsername}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-mono font-bold text-zinc-100">
                      {formatCurrency(order.amount)}
                    </span>

                    <div className="w-24 text-right">
                      {order.status === "completed" && (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          Completed
                        </span>
                      )}
                      {order.status === "disputed" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="h-3 w-3" /> Disputed
                        </span>
                      )}
                      {order.status === "refunded" && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/30">
                          <RefreshCw className="h-3 w-3" /> Refunded
                        </span>
                      )}
                      {order.status === "pending" && (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STREAMS TAB */}
        {activeTab === "streams" && (
          <div className="divide-y divide-zinc-800/80">
            {filteredStreams.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No streams found.</div>
            ) : (
              filteredStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-3.5 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-100">
                        {stream.title}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                        {stream.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Host: <span className="text-amber-400">@{stream.sellerUsername}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right text-[11px] text-zinc-400">
                      <div>{stream.viewerCount} Viewers</div>
                      <div>{stream.items.filter((i) => i.sold).length} Sold</div>
                    </div>

                    <div className="w-20 text-right">
                      {stream.status === "live" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                          LIVE
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          ENDED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="divide-y divide-zinc-800/80">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No tickets found.</div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3.5 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-zinc-400">
                        {ticket.id}
                      </span>
                      <span className="font-medium text-xs text-zinc-100">
                        {ticket.description}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Reporter: <span className="text-amber-400">@{ticket.reporterUsername}</span>
                      {ticket.orderId && <span className="ml-2 font-mono text-zinc-500">Order: {ticket.orderId}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                        ticket.priority === "critical"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : ticket.priority === "high"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {ticket.priority}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                        ticket.status === "open"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : ticket.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

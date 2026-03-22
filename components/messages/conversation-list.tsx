// components/messages/conversation-list.tsx
"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChannelModel } from "@/types/message-models";
import type { UserModel } from "@/types/models";

interface ConversationItemData {
  channel: ChannelModel;
  otherUser: UserModel;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  items: ConversationItemData[];
  selectedChannelId: string | null;
  onSelect: (channelId: string) => void;
  onNewMessage: () => void;
  isLoading?: boolean;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConversationList({
  items,
  selectedChannelId,
  onSelect,
  onNewMessage,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = items
    .filter((item) =>
      item.otherUser.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((item) => {
      if (filter === "unread") {
        return (item.unreadCount ?? 0) > 0;
      }
      return true;
    });

  return (
    <div
      className="flex h-full flex-col bg-white shrink-0"
      style={{ width: 400, borderRadius: 24, overflow: "hidden" }}
    >
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-0">
        <h2
          className="font-semibold text-[#111625]"
          style={{
            fontSize: 24,
            lineHeight: "32px",
            fontFamily: "'Inter Display', Inter, sans-serif",
          }}
        >
          All Message
        </h2>
        {/* New Message button — blue, pencil-plus icon */}
        <button
          onClick={onNewMessage}
          className="flex items-center gap-1.5 rounded-lg text-white text-[14px] font-medium transition-colors hover:bg-[#1a5dd4] shrink-0"
          style={{
            backgroundColor: "#266df0",
            height: 32,
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            <line x1="19" y1="11" x2="19" y2="17" />
            <line x1="16" y1="14" x2="22" y2="14" />
          </svg>
          New Message
        </button>
      </div>

      {/* ── Search + Filter ─────────────────────── */}
      <div className="flex flex-col gap-3 px-6 py-5">
        <div className="flex items-center gap-3">
        {/* Search field */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8796af]"
            style={{ width: 16, height: 16 }}
            strokeWidth={1.5}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in message"
            className="w-full rounded-[10px] border bg-white pl-9 text-[14px] text-[#111625] placeholder:text-[#8796af] focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10 transition-colors"
            style={{ height: 40, borderColor: "#dde3ee", paddingRight: 56 }}
          />
          {/* ⌘+K badge */}
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 select-none text-[13px] text-[#596881]"
            style={{
              backgroundColor: "#f7f9fb",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            ⌘+K
          </span>
        </div>
        {/* Filter button */}
        <button
          className="flex items-center justify-center rounded-[10px] border border-[#dde3ee] bg-white text-[#111625] hover:bg-[#f7f9fb] transition-colors shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <SlidersHorizontal
            style={{ width: 15, height: 15 }}
            strokeWidth={1.5}
          />
        </button>
        </div>

        {/* Quick filter chips */}
        <div className="flex items-center gap-2 text-[12px]">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 font-medium transition-colors",
              filter === "all"
                ? "bg-[#266df0]/10 text-[#266df0]"
                : "bg-transparent text-[#596881] hover:bg-[#f7f9fb]",
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors",
              filter === "unread"
                ? "bg-[#266df0]/10 text-[#266df0]"
                : "bg-transparent text-[#596881] hover:bg-[#f7f9fb]",
            )}
          >
            Unread
            <span className="rounded-full bg-[#df1c41] px-1.5 text-[11px] text-white">
              {items.reduce(
                (sum, it) => sum + (it.unreadCount ?? 0 > 0 ? 1 : 0),
                0,
              )}
            </span>
          </button>
        </div>
      </div>

      {/* ── List ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-3">
        {isLoading ? (
          <div className="flex flex-col gap-1 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-3"
              >
                <div className="h-10 w-10 rounded-full bg-neutral-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-neutral-100" />
                  <div className="h-3 w-2/3 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[14px] text-[#596881]">No conversations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col px-4">
            {filtered.map((item) => {
              const isSelected = item.channel.id === selectedChannelId;
              return (
                <button
                  key={item.channel.id}
                  onClick={() => onSelect(item.channel.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    isSelected ? "bg-[#f7f9fb]" : "hover:bg-[#f7f9fb]",
                  )}
                  style={{ minHeight: 64 }}
                >
                  {/* Avatar — 40×40, circular */}
                  <Avatar
                    className="shrink-0"
                    style={{ width: 40, height: 40 }}
                  >
                    <AvatarImage src={item.otherUser.avatarUrl ?? undefined} />
                    <AvatarFallback
                      className="text-[13px] font-medium text-white"
                      style={{
                        backgroundColor:
                          item.otherUser.avatarColor ?? "#266df0",
                      }}
                    >
                      {getInitials(item.otherUser.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Text column */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: name + time */}
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: 4 }}
                    >
                      <span
                        className="truncate font-medium"
                        style={{ fontSize: 14, color: "#111625" }}
                      >
                        {item.otherUser.name}
                      </span>
                      {item.lastMessageAt && (
                        <span className="ml-2 shrink-0 text-[12px] text-[#596881]">
                          {formatRelativeTime(item.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {/* Row 2: last message preview + badge / double-check */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] text-[#596881]">
                        {item.lastMessage ?? "No messages yet"}
                      </p>
                      {item.unreadCount ? (
                        /* Unread count badge — red */
                        <span
                          className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white"
                          style={{
                            backgroundColor: "#df1c41",
                            minWidth: 16,
                            height: 16,
                            padding: "0 4px",
                          }}
                        >
                          {item.unreadCount}
                        </span>
                      ) : item.lastMessage ? (
                        /* Double-check sent indicator */
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M2 11l5 5L18 4"
                            stroke="#8796af"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 11l5 5"
                            stroke="#8796af"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

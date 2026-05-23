// components/messages/conversation-list.tsx
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChannelModel } from "@/types/message-models";
import type { UserModel } from "@/types/models";
import { useChatStore } from "@/lib/stores/chat-store";
import { ReadIcon, SentIcon } from "./message-bubble";

interface ConversationItemData {
  channel: ChannelModel;
  otherUser: UserModel;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageAuthorId?: string;
  lastMessageIsOwn?: boolean;
  lastMessageReadAt?: string | null;
  unreadCount?: number;
}

interface ConversationListProps {
  items: ConversationItemData[];
  selectedChannelId: string | null;
  onSelect: (channelId: string) => void;
  onNewMessage: () => void;
  isLoading?: boolean;
  currentUserId?: string;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
  const sessionUnread = useChatStore((s) => s.unreadCounts);

  function effectiveUnread(item: ConversationItemData): number {
    const serverCount = item.unreadCount ?? 0;
    const sessionCount = sessionUnread[item.channel.id] ?? 0;
    return Math.max(serverCount, sessionCount);
  }

  const filtered = items
    .filter((item) =>
      item.otherUser.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((item) => {
      if (filter === "unread") return effectiveUnread(item) > 0;
      return true;
    });

  const totalUnread = items.reduce(
    (acc, item) => acc + effectiveUnread(item),
    0,
  );

  return (
    <div
      className="flex h-full flex-col bg-white shrink-0"
      style={{ width: 400, borderRadius: 24, overflow: "hidden" }}
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-0">
        <h2
          className="font-semibold text-[#111625]"
          style={{
            fontSize: 24,
            lineHeight: "32px",
            fontFamily: "'Inter Display', Inter, sans-serif",
          }}
        >
          All Messages
        </h2>
        <button
          onClick={onNewMessage}
          className="flex items-center gap-1.5 rounded-lg text-white text-[13px] font-medium transition-colors hover:bg-[#1a5dd4] shrink-0"
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
          </svg>
          New Message
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8796af]"
              style={{ width: 16, height: 16 }}
              strokeWidth={1.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in messages"
              className="w-full rounded-[10px] border bg-white pl-9 text-[13px] text-[#111625] placeholder:text-[#8796af] focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10 transition-colors"
              style={{ height: 40, borderColor: "#dde3ee", paddingRight: 16 }}
            />
          </div>
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
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
              filter === "unread"
                ? "bg-[#266df0]/10 text-[#266df0]"
                : "bg-transparent text-[#596881] hover:bg-[#f7f9fb]",
            )}
          >
            Unread
            {totalUnread > 0 && (
              <span className="rounded-full bg-[#df1c41] px-1.5 text-[10px] font-semibold text-white leading-[18px] min-w-[18px] text-center">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 gap-1 pb-4">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl p-3"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-24 rounded bg-neutral-200" />
                  <div className="h-3 w-40 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-[14px] font-medium text-[#596881]">
              {filter === "unread"
                ? "No unread conversations"
                : search
                  ? `No conversations matching "${search}"`
                  : "No conversations yet."}
            </p>
            {filter !== "unread" && (
              <button
                onClick={onNewMessage}
                className="mt-2 text-[13px] font-medium text-[#266df0] hover:underline transition-colors"
              >
                Start a new message →
              </button>
            )}
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.channel.id === selectedChannelId;
            const unread = effectiveUnread(item);
            const hasUnread = unread > 0;
            const showReadReceipt =
              !hasUnread &&
              item.lastMessageIsOwn &&
              !!item.lastMessage;

            return (
              <button
                key={item.channel.id}
                onClick={() => onSelect(item.channel.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "bg-[#ebefff]"
                    : hasUnread
                      ? "bg-[#f7f9fb] hover:bg-[#f0f3fa]"
                      : "hover:bg-[#f7f9fb]",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar style={{ width: 42, height: 42 }}>
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
                  <span className="absolute bottom-0.5 right-0.5 block h-2.5 w-2.5 rounded-full bg-[#38c793] ring-2 ring-white" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        hasUnread
                          ? "font-semibold text-[#111625]"
                          : "font-medium text-[#111625]",
                      )}
                    >
                      {item.otherUser.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-[#8796af]">
                      {formatRelativeTime(item.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        "truncate text-[12px]",
                        hasUnread
                          ? "font-medium text-[#596881]"
                          : "text-[#8796af]",
                      )}
                    >
                      {hasUnread && !item.lastMessageIsOwn
                        ? item.lastMessage ?? "New message"
                        : item.lastMessageIsOwn
                          ? `You: ${item.lastMessage ?? ""}`
                          : (item.lastMessage ?? "No messages yet")}
                    </p>

                    {hasUnread ? (
                      <span
                        className="shrink-0 rounded-full bg-[#266df0] text-[10px] font-semibold text-white leading-none flex items-center justify-center"
                        style={{
                          minWidth: 18,
                          height: 18,
                          padding: "0 5px",
                        }}
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    ) : showReadReceipt ? (
                      item.lastMessageReadAt ? (
                        <ReadIcon />
                      ) : (
                        <SentIcon />
                      )
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

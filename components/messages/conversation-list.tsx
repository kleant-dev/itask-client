// components/messages/conversation-list.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChannelModel } from "@/types/message-models";
import type { UserModel } from "@/types/models";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

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

  const filtered = items.filter((item) =>
    item.otherUser.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="flex h-full flex-col bg-white"
      style={{ width: 400, minWidth: 400, borderRadius: 24 }}
    >
      {/* Header: "All Message" + New Message button */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5">
        <h2
          className="text-neutral-900 font-semibold"
          style={{
            fontSize: 24,
            lineHeight: "32px",
            fontFamily: "Inter Display, Inter, sans-serif",
          }}
        >
          All Message
        </h2>
        <button
          onClick={onNewMessage}
          className="flex items-center gap-1.5 rounded-lg text-white text-[14px] font-medium transition-colors"
          style={{
            backgroundColor: "#266df0",
            height: 32,
            paddingLeft: 10,
            paddingRight: 10,
            gap: 6,
          }}
        >
          {/* pencil-plus icon */}
          <svg
            width="17"
            height="17"
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

      {/* Search + Filter */}
      <div className="flex items-center gap-3 px-6 pb-5" style={{ gap: 16 }}>
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
            className="w-full rounded-[10px] border bg-white pl-9 text-[14px] text-neutral-900 placeholder:text-[#8796af] focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10 transition-colors"
            style={{
              height: 40,
              borderColor: "#dde3ee",
              paddingRight: 52,
            }}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-[12px] text-[#596881] font-normal select-none"
            style={{
              backgroundColor: "#f7f9fb",
              padding: "3px 7px",
              fontSize: 13,
              borderRadius: 6,
            }}
          >
            ⌘+K
          </span>
        </div>
        <button
          className="flex items-center justify-center rounded-[10px] border border-[#dde3ee] bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <SlidersHorizontal
            style={{ width: 15, height: 15 }}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 12 }}>
        {isLoading ? (
          <div className="flex flex-col gap-2 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl p-3"
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-[#596881]">No conversations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0 px-4">
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
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar style={{ width: 40, height: 40 }}>
                      <AvatarImage
                        src={item.otherUser.avatarUrl ?? undefined}
                      />
                      <AvatarFallback
                        className="text-[14px] font-medium text-white"
                        style={{
                          backgroundColor:
                            item.otherUser.avatarColor ?? "#266df0",
                        }}
                      >
                        {getInitials(item.otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    {/* Name + time row */}
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
                        <span
                          className="ml-2 shrink-0"
                          style={{ fontSize: 12, color: "#596881" }}
                        >
                          {formatRelativeTime(item.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {/* Last message + unread badge */}
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="truncate"
                        style={{ fontSize: 12, color: "#596881" }}
                      >
                        {item.lastMessage ?? "No messages yet"}
                      </p>
                      {item.unreadCount ? (
                        <span
                          className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white"
                          style={{
                            backgroundColor: "#df1c41",
                            minWidth: 16,
                            height: 16,
                            padding: "0 5px",
                          }}
                        >
                          {item.unreadCount}
                        </span>
                      ) : (
                        /* double-check icon for sent */
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
                      )}
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

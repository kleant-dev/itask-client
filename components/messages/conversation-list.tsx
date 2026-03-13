// components/messages/conversation-list.tsx
"use client";

import { useState } from "react";
import { Search, PenSquare, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  if (diff < 60) return `${Math.floor(diff)} mins ago`;
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
    <div className="flex h-full w-[400px] flex-col border-r border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="text-[24px] font-semibold leading-8 text-neutral-900">
          All Message
        </h2>
        <Button
          onClick={onNewMessage}
          size="sm"
          className="h-8 gap-1.5 bg-[#266df0] px-3 text-[14px] font-medium text-white hover:bg-[#1a5dd4]"
        >
          <PenSquare className="h-4 w-4" strokeWidth={1.5} />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={1.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in message"
              className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] text-neutral-400">
              ⌘+K
            </span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 transition-colors">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3 px-5 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/3 rounded bg-neutral-100" />
                  <div className="h-3 w-2/3 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-neutral-500">
              No conversations yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((item) => {
              const isSelected = item.channel.id === selectedChannelId;
              return (
                <button
                  key={item.channel.id}
                  onClick={() => onSelect(item.channel.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50",
                    isSelected && "bg-[#e9f0fe] hover:bg-[#e9f0fe]",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
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
                    {/* Online dot placeholder */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "truncate text-[14px] font-semibold",
                          isSelected ? "text-[#266df0]" : "text-neutral-900",
                        )}
                      >
                        {item.otherUser.name}
                      </span>
                      <span className="ml-2 flex-shrink-0 text-[12px] text-neutral-400">
                        {formatRelativeTime(item.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="truncate text-[13px] text-neutral-500">
                        {item.lastMessage ?? "No messages yet"}
                      </p>
                      {item.unreadCount ? (
                        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#266df0] px-1.5 text-[11px] font-semibold text-white">
                          {item.unreadCount}
                        </span>
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

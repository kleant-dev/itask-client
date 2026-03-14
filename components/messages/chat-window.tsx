// components/messages/chat-window.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Search, Phone, Video, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { useMessages, useTypingIndicator } from "@/lib/hooks/use-messages";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserModel } from "@/types/models";
import { ConversationContextMenu } from "./conversation-context-menu";

interface ChatWindowProps {
  channelId: string;
  otherUser: UserModel;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function groupMessages<
  T extends { authorId: string; id: string; createdAtUtc: string },
>(msgs: T[]) {
  return msgs.map((msg, i) => ({
    ...msg,
    showAvatar: i === 0 || msgs[i - 1].authorId !== msg.authorId,
    // show "Today" separator for first message of the day
    showDayDivider:
      i === 0 ||
      new Date(msgs[i - 1].createdAtUtc).toDateString() !==
        new Date(msg.createdAtUtc).toDateString(),
  }));
}

function getDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChatWindow({ channelId, otherUser }: ChatWindowProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { messages, isLoading } = useMessages(channelId);
  const { typingUserIds, sendTyping } = useTypingIndicator(channelId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const grouped = groupMessages(messages);
  const isOtherUserTyping =
    otherUser.id !== undefined && typingUserIds.has(otherUser.id);

  function handleMoreClick(e: React.MouseEvent) {
    e.stopPropagation();
    setContextMenuOpen((v) => !v);
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden bg-white relative"
      style={{ borderRadius: 24 }}
      onClick={() => setContextMenuOpen(false)}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6"
        style={{ height: 60, borderBottom: "1px solid #f0f2f5", flexShrink: 0 }}
      >
        {/* Left: avatar + name */}
        <div className="flex items-center gap-3">
          <Avatar style={{ width: 40, height: 40 }}>
            <AvatarImage src={otherUser.avatarUrl ?? undefined} />
            <AvatarFallback
              className="text-[14px] font-medium text-white"
              style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
            >
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p
              className="font-medium"
              style={{ fontSize: 14, color: "#111625", lineHeight: "20px" }}
            >
              {otherUser.name}
            </p>
            <p
              className="font-medium"
              style={{
                fontSize: 12,
                lineHeight: "16px",
                color: isOtherUserTyping ? "#266df0" : "#38c793",
              }}
            >
              {isOtherUserTyping ? "typing…" : "Online"}
            </p>
          </div>
        </div>

        {/* Right: icon actions */}
        <div className="flex items-center gap-2">
          {[
            { icon: Search, label: "Search" },
            { icon: Phone, label: "Call" },
            { icon: Video, label: "Video" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center rounded-lg border border-[#dde3ee] bg-white text-[#596881] hover:bg-[#f7f9fb] transition-colors"
              style={{ width: 32, height: 32 }}
            >
              <Icon style={{ width: 16, height: 16 }} strokeWidth={1.5} />
            </button>
          ))}
          <div className="relative">
            <button
              title="More"
              onClick={handleMoreClick}
              className="flex items-center justify-center rounded-lg border border-[#dde3ee] bg-white text-[#596881] hover:bg-[#f7f9fb] transition-colors"
              style={{ width: 32, height: 32 }}
            >
              <MoreHorizontal
                style={{ width: 16, height: 16 }}
                strokeWidth={1.5}
              />
            </button>
            {contextMenuOpen && (
              <ConversationContextMenu
                onClose={() => setContextMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: "#f7f9fb",
          borderRadius: 16,
          margin: "12px 12px 0 12px",
          padding: "16px 12px",
        }}
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex animate-pulse items-end gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-white/60" />
                <div
                  className={`h-10 rounded-2xl bg-white/70 ${i % 2 === 0 ? "w-48" : "w-36"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Avatar style={{ width: 56, height: 56 }}>
              <AvatarImage src={otherUser.avatarUrl ?? undefined} />
              <AvatarFallback
                className="text-[18px] font-medium text-white"
                style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
              >
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-[#111625]">{otherUser.name}</p>
              <p className="mt-1 text-[13px] text-[#596881]">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {grouped.map((msg) => (
              <div key={msg.id}>
                {/* Day divider */}
                {msg.showDayDivider && (
                  <div className="flex justify-center my-3">
                    <span
                      className="rounded-full bg-white px-4 py-1 text-[14px] font-medium text-[#596881]"
                      style={{ lineHeight: "20px" }}
                    >
                      {getDayLabel(msg.createdAtUtc)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  author={msg.authorId === otherUser.id ? otherUser : undefined}
                  isOwn={msg.authorId === currentUserId}
                  showAvatar={msg.showAvatar}
                />
              </div>
            ))}
            {/* Typing indicator */}
            {isOtherUserTyping && (
              <div className="flex items-end gap-2 mt-1">
                <Avatar style={{ width: 32, height: 32 }}>
                  <AvatarFallback
                    className="text-[11px] text-white"
                    style={{
                      backgroundColor: otherUser.avatarColor ?? "#266df0",
                    }}
                  >
                    {getInitials(otherUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="flex h-9 items-center rounded-xl bg-white px-3"
                  style={{ borderRadius: 12 }}
                >
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <MessageInput channelId={channelId} onTyping={sendTyping} />
    </div>
  );
}

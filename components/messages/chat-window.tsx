// components/messages/chat-window.tsx
"use client";

import { useEffect, useRef } from "react";
import { MoreHorizontal, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { useMessages, useTypingIndicator } from "@/lib/hooks/use-messages";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserModel } from "@/types/models";

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

/**
 * Groups consecutive messages from the same author so we only
 * show the avatar on the first bubble in each run.
 */
function groupMessages<T extends { authorId: string; id: string }>(msgs: T[]) {
  return msgs.map((msg, i) => ({
    ...msg,
    showAvatar: i === 0 || msgs[i - 1].authorId !== msg.authorId,
  }));
}

export function ChatWindow({ channelId, otherUser }: ChatWindowProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { messages, isLoading } = useMessages(channelId);
  const { typingUserIds, sendTyping } = useTypingIndicator(channelId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const grouped = groupMessages(messages);
  const isOtherUserTyping =
    otherUser.id !== undefined && typingUserIds.has(otherUser.id);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className="text-[13px] font-medium text-white"
                style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
              >
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-neutral-900">
              {otherUser.name}
            </p>
            <p className="text-[12px] text-neutral-500">
              {isOtherUserTyping ? (
                <span className="text-[#266df0]">typing…</span>
              ) : (
                "Active now"
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500"
          >
            <Video className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex animate-pulse items-end gap-2.5 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <div className="h-8 w-8 rounded-full bg-neutral-100" />
                <div
                  className={`h-10 rounded-2xl bg-neutral-100 ${i % 2 === 0 ? "w-48" : "w-36"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback
                className="text-[18px] font-medium text-white"
                style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
              >
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-neutral-900">{otherUser.name}</p>
              <p className="mt-1 text-[13px] text-neutral-500">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                author={msg.authorId === otherUser.id ? otherUser : undefined}
                isOwn={msg.authorId === currentUserId}
                showAvatar={msg.showAvatar}
              />
            ))}

            {/* Typing indicator */}
            {isOtherUserTyping && (
              <div className="flex items-end gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className="text-[12px] text-white"
                    style={{
                      backgroundColor: otherUser.avatarColor ?? "#266df0",
                    }}
                  >
                    {getInitials(otherUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex h-9 items-center rounded-2xl rounded-bl-md bg-neutral-100 px-4">
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

      {/* Input */}
      <MessageInput channelId={channelId} onTyping={sendTyping} />
    </div>
  );
}

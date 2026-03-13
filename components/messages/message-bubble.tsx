// components/messages/message-bubble.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageModel } from "@/types/message-models";
import type { UserModel } from "@/types/models";
import * as hub from "@/lib/services/chat-hub";

interface MessageBubbleProps {
  message: MessageModel;
  author?: UserModel;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MessageBubble({
  message,
  author,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.body);
  const [showActions, setShowActions] = useState(false);

  async function submitEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.body) {
      setEditing(false);
      return;
    }
    await hub.editMessage(message.id, trimmed);
    setEditing(false);
  }

  async function handleDelete() {
    await hub.deleteMessage(message.id);
  }

  const name = author?.name ?? "Unknown";
  const avatarColor = author?.avatarColor ?? "#266df0";

  return (
    <div
      className={cn(
        "group flex items-end gap-2.5",
        isOwn && "flex-row-reverse",
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar ? (
        <Avatar className="mb-0.5 h-8 w-8 flex-shrink-0">
          <AvatarImage src={author?.avatarUrl ?? undefined} />
          <AvatarFallback
            className="text-[12px] font-medium text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Bubble */}
      <div
        className={cn("flex max-w-[70%] flex-col gap-1", isOwn && "items-end")}
      >
        {/* Name + time */}
        {showAvatar && (
          <div
            className={cn(
              "flex items-center gap-2",
              isOwn && "flex-row-reverse",
            )}
          >
            <span className="text-[13px] font-semibold text-neutral-700">
              {isOwn ? "You" : name}
            </span>
            {showTimestamp && (
              <span className="text-[11px] text-neutral-400">
                {formatTime(message.createdAtUtc)}
              </span>
            )}
          </div>
        )}

        {/* Body */}
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitEdit();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditValue(message.body);
                }
              }}
              autoFocus
              rows={2}
              className="min-w-[200px] resize-none rounded-xl border border-[#266df0] bg-white px-3 py-2 text-[14px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#266df0]/20"
            />
            <div className="flex gap-1.5">
              <button
                onClick={submitEdit}
                className="rounded-md bg-[#266df0] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#1a5dd4] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditValue(message.body);
                }}
                className="rounded-md border border-neutral-200 px-3 py-1 text-[12px] text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
              isOwn
                ? "rounded-br-md bg-[#266df0] text-white"
                : "rounded-bl-md bg-neutral-100 text-neutral-900",
            )}
          >
            {message.body}
            {message.updatedAtUtc !== message.createdAtUtc && (
              <span
                className={cn(
                  "ml-1.5 text-[11px] opacity-60",
                  isOwn ? "text-white" : "text-neutral-500",
                )}
              >
                (edited)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions (own messages only) */}
      {isOwn && !editing && (
        <div
          className={cn(
            "mb-1 flex items-center gap-1 transition-opacity",
            showActions ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            onClick={() => setEditing(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

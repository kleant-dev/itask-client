// components/messages/message-bubble.tsx
"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageModel } from "@/types/message-models";
import type { UserModel } from "@/types/models";
import * as hub from "@/lib/services/chat-hub";

interface MessageBubbleProps {
  message: MessageModel;
  author?: UserModel; // defined when the message is from the other user
  isOwn: boolean;
  showAvatar?: boolean; // first bubble in a consecutive run
  deliveryStatus?: "sent" | "read";
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
  deliveryStatus,
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

  const name = author?.name ?? "You";

  return (
    <div
      className={cn("group flex items-end gap-2", isOwn && "flex-row-reverse")}
      style={{ marginBottom: 2 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* ── Avatar (received only, first in run) ─── */}
      {!isOwn ? (
        showAvatar ? (
          <Avatar
            style={{ width: 32, height: 32, flexShrink: 0, marginBottom: 2 }}
          >
            <AvatarImage src={author?.avatarUrl ?? undefined} />
            <AvatarFallback
              className="text-[11px] font-medium text-white"
              style={{ backgroundColor: author?.avatarColor ?? "#266df0" }}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div style={{ width: 32, flexShrink: 0 }} />
        )
      ) : null}

      {/* ── Bubble column ─────────────────────────── */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
        style={{ maxWidth: "65%" }}
      >
        {editing ? (
          /* Edit mode */
          <div className="flex flex-col gap-1.5 w-full">
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
              className="min-w-[200px] resize-none rounded-xl border border-[#266df0] bg-white px-3 py-2 text-[12px] text-[#111625] focus:outline-none focus:ring-2 focus:ring-[#266df0]/20"
            />
            <div className="flex gap-1.5">
              <button
                onClick={submitEdit}
                className="rounded-md bg-[#266df0] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#1a5dd4] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditValue(message.body);
                }}
                className="rounded-md border border-[#dde3ee] px-3 py-1 text-[11px] text-[#596881] hover:bg-[#f7f9fb] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Bubble */
          // Figma:
          //   received → white bg (#ffffff), rounded-xl, bottom-left corner = 4px
          //   sent     → blue-tint bg (#e9f0fe), rounded-xl, bottom-right corner = 4px
          <div
            className="px-4 py-2.5 text-[12px] leading-relaxed"
            style={{
              backgroundColor: isOwn ? "#e9f0fe" : "#ffffff",
              color: "#111625",
              borderRadius: 12,
              ...(isOwn
                ? { borderBottomRightRadius: 4 }
                : { borderBottomLeftRadius: 4 }),
            }}
          >
            {message.body}
            {message.updatedAtUtc !== message.createdAtUtc && (
              <span className="ml-1.5 text-[10px] text-[#8796af]">
                (edited)
              </span>
            )}
          </div>
        )}

        {/* Timestamp + double-check (shown on first bubble in a run) */}
        {showAvatar && !editing && (
          <div
            className={cn(
              "flex items-center gap-1",
              isOwn && "flex-row-reverse",
            )}
          >
            {isOwn && (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2 11l5 5L18 4"
                  stroke={deliveryStatus === "read" ? "#266df0" : "#8796af"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 11l5 5"
                  stroke={deliveryStatus === "read" ? "#266df0" : "#8796af"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="text-[12px] text-[#596881]">
              {formatTime(message.createdAtUtc)}
            </span>
          </div>
        )}
      </div>

      {/* ── Edit / delete hover actions (own messages only) ── */}
      {isOwn && !editing && (
        <div
          className={cn(
            "flex items-center gap-1 mb-1 transition-opacity",
            showActions ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            onClick={() => setEditing(true)}
            title="Edit"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8796af] hover:bg-white hover:text-[#596881] transition-colors"
          >
            <Pencil style={{ width: 13, height: 13 }} />
          </button>
          <button
            onClick={() => hub.deleteMessage(message.id)}
            title="Delete"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8796af] hover:bg-white hover:text-[#df1c41] transition-colors"
          >
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
      )}
    </div>
  );
}

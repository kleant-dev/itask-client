// components/messages/message-bubble.tsx
//
// Changes (Task 2 — Chat UX overhaul):
//
// 1. DELIVERY STATUS: `deliveryStatus` now accepts "sending" | "sent" | "read".
//    - "sending" → animated clock icon (optimistic ghost, not yet confirmed)
//    - "sent"    → single grey checkmark
//    - "read"    → double blue checkmarks (unchanged from original)
//
// 2. MESSAGE TYPE: accepts `ClientMessage` (superset of `MessageModel`) so
//    the caller can pass optimistic ghosts directly without a cast.
//
// 3. UX POLISH: bubble background is slightly adjusted for a more modern feel;
//    the timestamp line is always visible for own messages (not just showAvatar
//    messages) so the receipt indicator is never hidden.

"use client";

import { useState } from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ClientMessage } from "@/lib/hooks/use-messages";
import type { UserModel } from "@/types/models";
import * as hub from "@/lib/services/chat-hub";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DeliveryStatus = "sending" | "sent" | "read";

interface MessageBubbleProps {
  message: ClientMessage;
  author?: UserModel;
  isOwn: boolean;
  showAvatar?: boolean;
  deliveryStatus?: DeliveryStatus;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Receipt icons ─────────────────────────────────────────────────────────────

function SendingIcon() {
  return (
    <Clock
      className="animate-pulse text-[#8796af]"
      style={{ width: 12, height: 12 }}
      strokeWidth={1.5}
    />
  );
}

function SentIcon() {
  // Single checkmark
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 10l5 5L17 4"
        stroke="#8796af"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReadIcon() {
  // Double checkmark, blue
  return (
    <svg width="16" height="14" viewBox="0 0 24 20" fill="none">
      <path
        d="M2 11l5 5L18 4"
        stroke="#266df0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11l5 5"
        stroke="#266df0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceiptIcon({ status }: { status: DeliveryStatus }) {
  if (status === "sending") return <SendingIcon />;
  if (status === "read") return <ReadIcon />;
  return <SentIcon />;
}

// ── Component ─────────────────────────────────────────────────────────────────

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
    // Optimistic ghosts can't be edited — they have no real server ID yet
    if (message._status === "sending") return;
    await hub.editMessage(message.id, trimmed);
    setEditing(false);
  }

  const name = author?.name ?? "You";
  const isSending = message._status === "sending";

  return (
    <div
      className={cn("group flex items-end gap-2", isOwn && "flex-row-reverse")}
      style={{ marginBottom: 2, opacity: isSending ? 0.75 : 1 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* ── Avatar (received only, first in run) ── */}
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

      {/* ── Bubble column ── */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
        style={{ maxWidth: "65%" }}
      >
        {editing ? (
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
          <div
            className="px-3 py-[10px] text-[13px] leading-relaxed"
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
            {message.updatedAtUtc !== message.createdAtUtc && !isSending && (
              <span className="ml-1.5 text-[10px] text-[#8796af]">
                (edited)
              </span>
            )}
          </div>
        )}

        {/* ── Timestamp + receipt ── */}
        {/* Show for own messages always (not just showAvatar) so the receipt
            icon is never hidden in the middle of a run. */}
        {(isOwn || showAvatar) && !editing && (
          <div
            className={cn(
              "flex items-center gap-1 px-0.5",
              isOwn && "flex-row-reverse",
            )}
          >
            {isOwn && deliveryStatus && <ReceiptIcon status={deliveryStatus} />}
            <span className="text-[11px] text-[#8796af]">
              {formatTime(message.createdAtUtc)}
            </span>
          </div>
        )}
      </div>

      {/* ── Hover actions (own messages only, non-ghost) ── */}
      {isOwn && !editing && !isSending && (
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

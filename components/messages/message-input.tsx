// components/messages/message-input.tsx
//
// Change (Task 2):
// Added `onSend` prop — an async callback provided by ChatWindow that
// calls `useMessages.sendMessage()`, which handles the optimistic update.
// If `onSend` is provided it takes precedence; if not, the component falls
// back to calling `hub.sendMessage` directly (backwards-compatible).
//
// The toast on send failure is intentionally kept here so the user gets
// visual feedback even if the parent doesn't handle the error.

"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Mic, Smile, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import * as hub from "@/lib/services/chat-hub";
import { filesApi } from "@/lib/api/files";

interface MessageInputProps {
  channelId: string;
  onTyping?: () => void;
  disabled?: boolean;
  /**
   * If provided, called instead of `hub.sendMessage` directly.
   * Receives the trimmed message body; should throw on failure.
   * This allows the parent (ChatWindow) to inject optimistic updates.
   */
  onSend?: (body: string) => Promise<void>;
}

export function MessageInput({
  channelId,
  onTyping,
  disabled,
  onSend,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function handleSend() {
    const body = value.trim();
    if (!body || sending || disabled) return;
    setSending(true);
    try {
      if (onSend) {
        await onSend(body);
      } else {
        await hub.sendMessage(channelId, body);
      }
      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch {
      toast.error("Message failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
    onTyping?.();
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || sending || uploading || disabled) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be 10 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await filesApi.upload(file);
      const label = uploaded.fileName || "attachment";
      const body = `${label}: ${uploaded.fileUrl}`;
      if (onSend) {
        await onSend(body);
      } else {
        await hub.sendMessage(channelId, body);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const canSend = value.trim().length > 0 && !sending && !uploading && !disabled;

  return (
    <div className="px-3 pb-3 pt-2 shrink-0">
      <div
        className="flex items-center gap-2 bg-white border border-[#dde3ee] px-4"
        style={{ minHeight: 48, borderRadius: 100 }}
      >
        {/* Auto-resizing textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type any message…"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[12px] text-[#111625] placeholder:text-[#8796af] focus:outline-none leading-5"
          style={{ paddingTop: 14, paddingBottom: 14, maxHeight: 120 }}
        />

        {/* Icon actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            title="Voice message"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors"
          >
            <Mic style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title="Emoji"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors"
          >
            <Smile style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button
            type="button"
            title="Attach file"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors disabled:opacity-40"
          >
            <Paperclip style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title={sending ? "Sending…" : "Send"}
            className="flex items-center justify-center rounded-full text-white transition-opacity"
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#266df0",
              opacity: canSend ? 1 : 0.4,
            }}
          >
            <Send style={{ width: 15, height: 15 }} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

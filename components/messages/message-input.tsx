// components/messages/message-input.tsx
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import * as hub from "@/lib/services/chat-hub";

interface MessageInputProps {
  channelId: string;
  onTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  channelId,
  onTyping,
  disabled,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      await hub.sendMessage(channelId, body);
      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  const canSend = value.trim().length > 0 && !sending && !disabled;

  return (
    <div className="border-t border-neutral-200 bg-white px-5 py-4">
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 transition-[border-color,box-shadow]",
          "focus-within:border-[#266df0] focus-within:ring-2 focus-within:ring-[#266df0]/10",
        )}
      >
        {/* Attachment */}
        <button
          type="button"
          className="mb-0.5 flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Paperclip className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50"
          style={{ maxHeight: 120, overflowY: "auto" }}
        />

        {/* Emoji */}
        <button
          type="button"
          className="mb-0.5 flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Smile className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all",
            canSend
              ? "bg-[#266df0] text-white hover:bg-[#1a5dd4]"
              : "cursor-not-allowed bg-neutral-200 text-neutral-400",
          )}
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-400">
        Press{" "}
        <kbd className="rounded border border-neutral-200 bg-white px-1 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to send,{" "}
        <kbd className="rounded border border-neutral-200 bg-white px-1 py-0.5 font-mono text-[10px]">
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}

// components/messages/message-input.tsx
"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { Mic, Smile, Paperclip, Send } from "lucide-react";
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
    // Figma: pill-shaped input row, 48px height, sits inside chat-window above bottom edge
    <div className="px-3 pb-3 pt-2 shrink-0">
      <div
        className="flex items-center gap-2 bg-white border border-[#dde3ee] px-4"
        style={{ minHeight: 48, borderRadius: 100 }}
      >
        {/* Text area — grows up to 3 lines */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type any message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[12px] text-[#111625] placeholder:text-[#8796af] focus:outline-none leading-5"
          style={{ paddingTop: 14, paddingBottom: 14, maxHeight: 120 }}
        />

        {/* Icon actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mic */}
          <button
            title="Voice message"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors"
          >
            <Mic style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>
          {/* Emoji */}
          <button
            title="Emoji"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors"
          >
            <Smile style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>
          {/* Attachment */}
          <button
            title="Attach file"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#596881] hover:bg-[#f7f9fb] transition-colors"
          >
            <Paperclip style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>
          {/* Send — blue circle, always visible, dims when empty */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Send"
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

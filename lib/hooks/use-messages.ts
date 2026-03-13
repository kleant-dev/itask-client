// lib/hooks/use-messages.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import * as hub from "@/lib/services/chat-hub";
import type { MessageModel } from "@/types/message-models";
import type { PagedResponse } from "@/types/api";

/**
 * Manages message history (REST) + real-time updates (SignalR) for a channel.
 * Joining/leaving the SignalR group is handled automatically on mount/unmount.
 */
export function useMessages(channelId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", channelId];

  // ── Initial history via REST ───────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<PagedResponse<MessageModel>>({
    queryKey,
    queryFn: () => messagesApi.getByChannel(channelId!, { pageSize: 50 }),
    enabled: !!channelId,
    staleTime: 0, // always fresh when we re-focus
  });

  const messages = data?.items ?? [];

  // ── Real-time via SignalR ──────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;

    let joined = false;

    const setup = async () => {
      await hub.joinChannel(channelId);
      joined = true;
    };

    setup();

    // Append new message
    const unsubReceive = hub.onReceiveMessage((msg) => {
      if (msg.channelId !== channelId) return;
      queryClient.setQueryData<PagedResponse<MessageModel>>(
        queryKey,
        (prev) => {
          if (!prev) return prev;
          // Avoid duplicates
          if (prev.items.some((m) => m.id === msg.id)) return prev;
          return {
            ...prev,
            items: [...prev.items, msg],
            totalCount: prev.totalCount + 1,
          };
        },
      );
    });

    // Replace edited message
    const unsubEdited = hub.onMessageEdited((edited) => {
      if (edited.channelId !== channelId) return;
      queryClient.setQueryData<PagedResponse<MessageModel>>(
        queryKey,
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((m) => (m.id === edited.id ? edited : m)),
          };
        },
      );
    });

    // Remove deleted message
    const unsubDeleted = hub.onMessageDeleted(({ messageId }) => {
      queryClient.setQueryData<PagedResponse<MessageModel>>(
        queryKey,
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter((m) => m.id !== messageId),
            totalCount: Math.max(0, prev.totalCount - 1),
          };
        },
      );
    });

    return () => {
      unsubReceive();
      unsubEdited();
      unsubDeleted();
      if (joined) hub.leaveChannel(channelId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return { messages, isLoading, isError };
}

/** Typing indicator hook */
export function useTypingIndicator(channelId: string | null) {
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!channelId) return;

    const unsub = hub.onUserTyping(({ userId, channelId: ch }) => {
      if (ch !== channelId) return;

      setTypingUserIds((prev) => new Set([...prev, userId]));

      // Auto-clear after 3 s of no further typing events
      const existing = timers.current.get(userId);
      if (existing) clearTimeout(existing);
      timers.current.set(
        userId,
        setTimeout(() => {
          setTypingUserIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
          timers.current.delete(userId);
        }, 3000),
      );
    });

    return unsub;
  }, [channelId]);

  const sendTyping = useCallback(() => {
    if (channelId) hub.sendTyping(channelId);
  }, [channelId]);

  return { typingUserIds, sendTyping };
}

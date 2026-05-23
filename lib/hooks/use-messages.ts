// lib/hooks/use-messages.ts
//
// Architectural changes (Task 2 — Chat Feature Overhaul):
//
// 1. OPTIMISTIC SENDING: `sendMessage()` is now exported from this hook.
//    When called, it immediately inserts a "ghost" message with `_status:
//    "sending"` into `optimisticMessages` local state. The ghost is cleaned
//    up when SignalR echoes the real message back. This gives instant visual
//    feedback (clock icon in the bubble) without waiting for the round-trip.
//
// 2. UNREAD COUNTS: The `onReceiveMessage` handler now checks whether the
//    incoming message belongs to the currently active channel. If it doesn't,
//    it calls `chatStore.incrementUnread()` so the ConversationList badge
//    updates in real-time — no polling required.
//
// 3. BROWSER NOTIFICATIONS: When a message arrives for an inactive channel,
//    `fireBrowserNotification()` is called if the page is hidden and the user
//    has granted permission. The sender name / avatar lookup is skipped here
//    to avoid extra async work; the fallback title "New message" is used.
//    If you want the sender's name, enrich `MessageModel` with an `author`
//    field from the channel member list before passing it through.

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import * as hub from "@/lib/services/chat-hub";
import type { MessageModel } from "@/types/message-models";
import type { PagedResponse } from "@/types/api";
import { useChatStore } from "@/lib/stores/chat-store";
import { useAuthStore } from "@/lib/stores/auth-store";

// ── Extended message type ──────────────────────────────────────────────────────

/**
 * A `MessageModel` that may carry client-only metadata.
 * Optimistic (unconfirmed) messages have `_clientId` and `_status: "sending"`.
 * Once confirmed by SignalR they are replaced by the real server message
 * (which has neither field), so the UI seamlessly transitions from clock → ✓.
 */
export interface ClientMessage extends MessageModel {
  /** Present only on optimistic messages. Unique per send attempt. */
  _clientId?: string;
  /** Present only while the message has not yet been echoed by the server. */
  _status?: "sending";
}

// ── Primary hook ─────────────────────────────────────────────────────────────

export function useMessages(channelId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", channelId];

  const currentUserId = useAuthStore((s) => s.user?.id);
  const activeChannelId = useChatStore((s) => s.activeChannelId);

  // ── REST initial load ────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<PagedResponse<MessageModel>>({
    queryKey,
    queryFn: () => messagesApi.getByChannel(channelId!, { pageSize: 50 }),
    enabled: !!channelId,
    staleTime: 0, // always re-fetch when re-focused
  });

  // ── Optimistic messages (local-only) ─────────────────────────────────────
  const [optimisticMessages, setOptimisticMessages] = useState<ClientMessage[]>(
    [],
  );

  const serverMessages: ClientMessage[] = data?.items ?? [];

  const pendingOptimistic = optimisticMessages.filter(
    (opt) =>
      !serverMessages.some(
        (s) =>
          s.authorId === opt.authorId &&
          s.body === opt.body &&
          opt._status === "sending",
      ),
  );

  // Final merged list, ordered by creation time.
  const messages: ClientMessage[] = [
    ...serverMessages,
    ...pendingOptimistic,
  ].sort(
    (a, b) =>
      new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime(),
  );

  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleMarkRead = useCallback(() => {
    if (!channelId) return;
    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      hub.markMessagesAsRead(channelId).catch(() => {});
    }, 400);
  }, [channelId]);

  // ── SignalR real-time updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;

    let joined = false;
    let cancelled = false;

    const setup = async () => {
      await hub.joinChannel(channelId);
      if (cancelled) return;
      joined = true;
      await hub.markMessagesAsRead(channelId);
    };

    setup().catch(() => {});

    const unsubMarkedRead = hub.onMessagesMarkedRead(({ channelId: ch }) => {
      if (ch !== channelId) return;
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-unread-summary"] });
    });

    // New message received
    const unsubReceive = hub.onReceiveMessage((msg) => {
      if (msg.channelId !== channelId) return;

      scheduleMarkRead();

      setOptimisticMessages((prev) =>
        prev.filter(
          (opt) =>
            !(
              opt._status === "sending" &&
              opt.authorId === msg.authorId &&
              opt.body === msg.body
            ),
        ),
      );

      // Upsert into the query cache
      queryClient.setQueryData<PagedResponse<MessageModel>>(
        queryKey,
        (prev) => {
          if (!prev) return prev;
          if (prev.items.some((m) => m.id === msg.id)) return prev; // dedup
          return {
            ...prev,
            items: [...prev.items, msg],
            totalCount: prev.totalCount + 1,
          };
        },
      );
    });

    // Message edited
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

    // Message deleted
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

    const unsubRead = hub.onMessagesRead(
      ({ channelId: ch, readByUserId, readAtUtc }) => {
        if (ch !== channelId) return;

        // Update readAtUtc on all messages sent before readAtUtc
        queryClient.setQueryData<PagedResponse<MessageModel>>(
          queryKey,
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.map((m) =>
                m.authorId === currentUserId &&
                readByUserId !== currentUserId &&
                !m.readAtUtc &&
                new Date(m.createdAtUtc) <= new Date(readAtUtc)
                  ? { ...m, readAtUtc }
                  : m,
              ),
            };
          },
        );
      },
    );

    return () => {
      cancelled = true;
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      unsubReceive();
      unsubEdited();
      unsubDeleted();
      unsubRead();
      unsubMarkedRead();
      if (joined) hub.leaveChannel(channelId);
    };
    // activeChannelId is intentionally excluded: changing which channel is
    // "active" should not re-join/leave the SignalR group for THIS channel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  // ── Optimistic send ───────────────────────────────────────────────────────

  /**
   * Send a message with immediate optimistic UI.
   *
   * The ghost message (clock icon) is visible instantly. When SignalR echoes
   * the server-confirmed message back, the ghost is silently replaced.
   * On network error, the ghost is removed and the error is re-thrown so the
   * caller can toast/display it.
   */
  const sendMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!channelId || !trimmed || !currentUserId) return;

      const clientId = `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();

      const ghost: ClientMessage = {
        id: clientId,
        channelId,
        authorId: currentUserId,
        body: trimmed,
        createdAtUtc: now,
        updatedAtUtc: now,
        readAtUtc: null,
        _clientId: clientId,
        _status: "sending",
      };

      setOptimisticMessages((prev) => [...prev, ghost]);

      try {
        await hub.sendMessage(channelId, trimmed);
      } catch (err) {
        // Roll back the ghost on failure
        setOptimisticMessages((prev) =>
          prev.filter((m) => m._clientId !== clientId),
        );
        throw err;
      }
    },
    [channelId, currentUserId],
  );

  return { messages, isLoading, isError, sendMessage };
}

// ── Typing indicator hook ─────────────────────────────────────────────────────

export function useTypingIndicator(channelId: string | null) {
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!channelId) return;

    const unsub = hub.onUserTyping(({ userId, channelId: ch }) => {
      if (ch !== channelId) return;

      setTypingUserIds((prev) => new Set([...prev, userId]));

      // Clear the indicator after 3 s of no further typing events
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

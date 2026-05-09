// lib/stores/chat-store.ts
//
// Architectural note:
// This store is intentionally NOT persisted. Unread counts are derived
// from real-time SignalR events that occur in the current session.
// Persisting them would risk stale counts after refreshing, since the
// server is the true source of truth via `lastReadAtUtc`.
//
// Flow:
//  1. When the messages page mounts, call `requestNotificationPermission()`.
//  2. For every incoming SignalR message on an inactive channel,
//     `incrementUnread(channelId)` is called from `use-messages.ts`.
//  3. When the user opens a channel, call `resetUnread(channelId)` and
//     `setActiveChannel(channelId)` — the count badge disappears instantly.

import { create } from "zustand";

interface ChatState {
  /** Per-channel unread message count (session only). */
  unreadCounts: Record<string, number>;

  /**
   * The channelId the user is currently reading.
   * Used to suppress notifications and unread increments for the
   * active channel even when the tab is in the foreground.
   */
  activeChannelId: string | null;

  /** Mirrors the browser Notification API permission state. */
  notificationPermission: NotificationPermission | "unknown";

  incrementUnread: (channelId: string) => void;
  resetUnread: (channelId: string) => void;
  setActiveChannel: (channelId: string | null) => void;
  /** Call once on messages page mount to prompt the user for permission. */
  requestNotificationPermission: () => Promise<void>;
}

export const useChatStore = create<ChatState>()((set) => ({
  unreadCounts: {},
  activeChannelId: null,
  notificationPermission: "unknown",

  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] ?? 0) + 1,
      },
    })),

  resetUnread: (channelId) =>
    set((state) => {
      const next = { ...state.unreadCounts };
      delete next[channelId];
      return { unreadCounts: next };
    }),

  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

  requestNotificationPermission: async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") {
      set({ notificationPermission: Notification.permission });
      return;
    }
    const permission = await Notification.requestPermission();
    set({ notificationPermission: permission });
  },
}));

/**
 * Fire a native browser notification.
 * Silently no-ops if:
 *  - The Notification API isn't available (SSR / unsupported browser)
 *  - Permission hasn't been granted
 *  - The document is currently visible (user is actively looking at the app)
 */
export function fireBrowserNotification(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "slender-chat", // prevents duplicate stacking
    });
  } catch {
    // Swallow — some environments block `new Notification()` synchronously.
  }
}

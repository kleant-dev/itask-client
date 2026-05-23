// lib/stores/chat-store.ts
import { create } from "zustand";
import type { MessageModel } from "@/types/message-models";

interface ChatState {
  unreadCounts: Record<string, number>;
  /** Latest message per channel — updated in real time via SignalR. */
  lastMessagesByChannel: Record<string, MessageModel>;
  activeChannelId: string | null;
  notificationPermission: NotificationPermission | "unknown";

  upsertLastMessage: (message: MessageModel) => void;
  setLastMessages: (messages: Record<string, MessageModel>) => void;
  incrementUnread: (channelId: string) => void;
  resetUnread: (channelId: string) => void;
  setUnreadCounts: (counts: Record<string, number>) => void;
  setActiveChannel: (channelId: string | null) => void;
  requestNotificationPermission: () => Promise<void>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  unreadCounts: {},
  lastMessagesByChannel: {},
  activeChannelId: null,
  notificationPermission: "unknown",

  upsertLastMessage: (message) =>
    set((state) => {
      const existing = state.lastMessagesByChannel[message.channelId];
      if (existing?.id === message.id) {
        return {
          lastMessagesByChannel: {
            ...state.lastMessagesByChannel,
            [message.channelId]: message,
          },
        };
      }
      if (
        existing &&
        new Date(existing.createdAtUtc).getTime() >
          new Date(message.createdAtUtc).getTime()
      ) {
        return state;
      }
      return {
        lastMessagesByChannel: {
          ...state.lastMessagesByChannel,
          [message.channelId]: message,
        },
      };
    }),

  setLastMessages: (messages) =>
    set({ lastMessagesByChannel: { ...messages } }),

  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] ?? 0) + 1,
      },
    })),

  resetUnread: (channelId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: 0 },
    })),

  setUnreadCounts: (counts) => {
    const session = get().unreadCounts;
    const merged = { ...counts };
    for (const [id, n] of Object.entries(session)) {
      merged[id] = Math.max(merged[id] ?? 0, n);
    }
    set({ unreadCounts: merged });
  },

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

export function fireBrowserNotification(
  title: string,
  body: string,
  channelId?: string,
): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const { activeChannelId } = useChatStore.getState();
  if (channelId && channelId === activeChannelId) return;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: channelId ? `slender-chat-${channelId}` : "slender-chat",
    });
  } catch {
    // ignore
  }
}

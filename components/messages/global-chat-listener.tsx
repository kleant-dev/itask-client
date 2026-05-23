"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  useChatStore,
  fireBrowserNotification,
} from "@/lib/stores/chat-store";
import {
  onReceiveMessage,
  onNotificationReceived,
} from "@/lib/services/chat-hub";
import { ensureChatRealtimeHandlers } from "@/lib/services/chat-realtime";
import { notificationsQueryKey } from "@/lib/hooks/use-notifications";
import { useUiStore } from "@/lib/stores/ui-store";
import { toastAppNotification } from "@/lib/utils/toast-notifications";
import type { NotificationModel } from "@/types/models";

/**
 * App-wide SignalR listener: conversation previews, unread counts,
 * in-app toasts, desktop notifications, and notification feed sync.
 */
export function GlobalChatListener() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const requestNotificationPermission = useChatStore(
    (s) => s.requestNotificationPermission,
  );
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  useEffect(() => {
    if (!accessToken) return;
    ensureChatRealtimeHandlers().catch(() => {});
    requestNotificationPermission();
  }, [accessToken, requestNotificationPermission]);

  useEffect(() => {
    if (!accessToken) return;

    const unsubNotification = onNotificationReceived((payload) => {
      const notification = payload as NotificationModel;
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });

      if (notification.type === "DirectMessage") {
        if (notification.entityName === activeChannelId) return;
      }

      toastAppNotification(notification);
      fireBrowserNotification(
        notification.title,
        notification.body ?? notification.title,
        notification.type === "DirectMessage"
          ? notification.entityName ?? undefined
          : undefined,
      );
    });

    const unsub = onReceiveMessage((msg) => {
      if (msg.authorId === currentUserId) return;
      queryClient.invalidateQueries({
        queryKey: ["channel-unread-summary"],
      });
    });

    return () => {
      unsub();
      unsubNotification();
    };
  }, [
    accessToken,
    currentUserId,
    activeChannelId,
    queryClient,
    workspaceId,
  ]);

  return null;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import { isNotificationUnread } from "@/lib/utils/notifications";

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications(params?: {
  pageNumber?: number;
  pageSize?: number;
}) {
  const { pageNumber = 1, pageSize = 50 } = params ?? {};

  return useQuery<PagedResponse<NotificationModel>>({
    queryKey: [...notificationsQueryKey, pageNumber, pageSize],
    queryFn: () =>
      notificationsApi.getAll({ pageNumber, pageSize, sort: "createdAt desc" }),
  });
}

export function useNotificationUnreadCount() {
  const { data } = useNotifications({ pageSize: 100 });
  const items = data?.items ?? [];
  return items.filter(isNotificationUnread).length;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markRead(notificationId),
    onSuccess: (updated) => {
      queryClient.setQueriesData<PagedResponse<NotificationModel>>(
        { queryKey: notificationsQueryKey },
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((n) =>
              n.id === updated.id ? updated : n,
            ),
          };
        },
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const page = await notificationsApi.getAll({ pageSize: 100 });
      const unread = page.items.filter(isNotificationUnread);
      await Promise.all(unread.map((n) => notificationsApi.markRead(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}

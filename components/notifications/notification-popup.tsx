// components/notifications/notification-popup.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bell, Settings, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/use-notifications";
import type { NotificationModel } from "@/types/models";
import {
  formatNotificationTime,
  isNotificationUnread,
  notificationAvatarColor,
  notificationAvatarFallback,
  notificationDisplayMessage,
  notificationTypeToUi,
} from "@/lib/utils/notifications";

export type NotificationFilter = "All" | "Mention" | "Unread";

const filterTabs: NotificationFilter[] = ["All", "Mention", "Unread"];

interface NotificationPopupProps {
  onClose: () => void;
  onViewAll?: () => void;
}

export function NotificationPopup({
  onClose,
  onViewAll,
}: NotificationPopupProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const { data, isLoading, isError } = useNotifications({
    pageNumber: 1,
    pageSize: 20,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (activeFilter === "Unread") return isNotificationUnread(n);
      if (activeFilter === "Mention")
        return notificationTypeToUi(n.type) === "mention";
      return true;
    });
  }, [items, activeFilter]);

  const filterBadges = useMemo(() => {
    const mentionCount = items.filter(
      (n) => notificationTypeToUi(n.type) === "mention",
    ).length;
    const unreadCount = items.filter(isNotificationUnread).length;
    return {
      Mention: mentionCount > 0 ? mentionCount : undefined,
      Unread: unreadCount > 0 ? unreadCount : undefined,
    } satisfies Partial<Record<NotificationFilter, number>>;
  }, [items]);

  function handleMarkRead(n: NotificationModel) {
    if (!isNotificationUnread(n)) return;
    markRead.mutate(n.id);
  }

  function handleMarkAllRead() {
    markAllRead.mutate();
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute right-14 top-[60px] w-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell
                className="h-[18px] w-[18px] text-neutral-700"
                strokeWidth={1.5}
              />
              <span className="text-[15px] font-semibold text-[#111625]">
                Notifications
              </span>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 rounded-lg bg-[#f7f9fb] p-1">
              {filterTabs.map((tab) => {
                const badge = filterBadges[tab];
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-white text-[#111625] shadow-sm"
                        : "text-[#596881] hover:text-neutral-800",
                    )}
                  >
                    <span>{tab}</span>
                    {badge !== undefined && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-200 px-1 text-[10px] font-semibold text-neutral-500">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#375dfb] hover:text-[#2749c2] transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Mark all read
            </button>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          <div className="px-5 pt-3 pb-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
              Recent
            </span>
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <div className="py-10 text-center text-[13px] text-neutral-400">
                Loading…
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-[13px] text-red-500">
                Could not load notifications
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-neutral-300" strokeWidth={1} />
                <p className="text-[13px] text-neutral-400">
                  No notifications here
                </p>
              </div>
            ) : (
              filtered.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleMarkRead(notification)}
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-neutral-50",
                    isNotificationUnread(notification) && "bg-[#f7f9fb]",
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback
                      className={`text-[12px] font-semibold text-white ${notificationAvatarColor(notification)}`}
                    >
                      {notificationAvatarFallback(notification)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <p className="text-[13px] leading-snug text-[#111625]">
                      {notificationDisplayMessage(notification)}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      {formatNotificationTime(notification.createdAtUtc)}
                    </span>
                  </div>

                  <div className="mt-1.5 shrink-0">
                    {isNotificationUnread(notification) ? (
                      <span className="block h-2 w-2 rounded-full bg-[#375dfb]" />
                    ) : (
                      <span className="block h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-neutral-100 px-5 py-3">
          <button
            onClick={onViewAll}
            className="w-full text-center text-[13px] font-medium text-[#375dfb] hover:text-[#2749c2] transition-colors"
          >
            View all notifications →
          </button>
        </div>
      </div>
    </div>
  );
}

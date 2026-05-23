// app/(app)/notifications/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  CheckCheck,
  AtSign,
  UserPlus,
  ListTodo,
  MessageSquare,
  MessageCircle,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  notificationDateGroup,
  notificationDisplayMessage,
  notificationTypeToUi,
  type NotificationUiType,
} from "@/lib/utils/notifications";

type FilterTab = "All" | "Unread" | "Mentions";

function getTypeIcon(type: NotificationUiType) {
  switch (type) {
    case "mention":
      return <AtSign className="h-3 w-3" strokeWidth={2} />;
    case "assignment":
      return <ListTodo className="h-3 w-3" strokeWidth={2} />;
    case "project":
      return <UserPlus className="h-3 w-3" strokeWidth={2} />;
    case "comment":
      return <MessageSquare className="h-3 w-3" strokeWidth={2} />;
    case "due":
      return <Clock className="h-3 w-3" strokeWidth={2} />;
    case "message":
      return <MessageCircle className="h-3 w-3" strokeWidth={2} />;
  }
}

function getTypeColor(type: NotificationUiType): string {
  switch (type) {
    case "mention":
      return "bg-[#ebefff] text-[#375dfb]";
    case "assignment":
      return "bg-[#ebf9f4] text-[#38c793]";
    case "project":
      return "bg-[#fef7ec] text-[#f2ae40]";
    case "comment":
      return "bg-[#fce8ec] text-[#df1c41]";
    case "due":
      return "bg-[#fce8ec] text-[#df1c41]";
    case "message":
      return "bg-[#ebefff] text-[#375dfb]";
  }
}

function notificationHref(item: NotificationModel): string | null {
  if (item.type === "DirectMessage" && item.entityName) {
    return `/messages?channel=${encodeURIComponent(item.entityName)}`;
  }
  if (item.taskId && item.projectId) {
    return `/projects/${encodeURIComponent(item.projectId)}?task=${encodeURIComponent(item.taskId)}`;
  }
  return null;
}

interface NotificationRowProps {
  item: NotificationModel;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ item, onMarkRead }: NotificationRowProps) {
  const router = useRouter();
  const uiType = notificationTypeToUi(item.type);
  const unread = isNotificationUnread(item);
  const href = notificationHref(item);

  return (
    <div
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={() => {
        if (unread) onMarkRead(item.id);
        if (href) router.push(href);
      }}
      onKeyDown={(e) => {
        if (href && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (unread) onMarkRead(item.id);
          router.push(href);
        }
      }}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl px-4 py-4 transition-colors",
        unread ? "bg-[#f0f5ff] hover:bg-[#e8f0ff]" : "hover:bg-neutral-50",
        href && "cursor-pointer",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={`text-[13px] font-semibold text-white ${notificationAvatarColor(item)}`}
          >
            {notificationAvatarFallback(item)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full",
            getTypeColor(uiType),
          )}
        >
          {getTypeIcon(uiType)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "text-[13px] leading-snug",
            unread ? "font-medium text-[#111625]" : "text-neutral-700",
          )}
        >
          {notificationDisplayMessage(item)}
        </p>
        <div className="flex items-center gap-2">
          {item.entityName && item.type !== "DirectMessage" && (
            <>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                {item.entityName}
              </span>
              <span className="text-neutral-300">·</span>
            </>
          )}
          <span className="text-[11px] text-neutral-400">
            {formatNotificationTime(item.createdAtUtc)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {unread && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(item.id);
            }}
            title="Mark as read"
            className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm hover:text-[#375dfb] transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
        <span
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            unread ? "bg-[#375dfb]" : "bg-transparent",
          )}
        />
      </div>
    </div>
  );
}

const FILTER_TABS: FilterTab[] = ["All", "Unread", "Mentions"];

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const { data, isLoading, isError } = useNotifications({ pageSize: 100 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];

  const unreadCount = items.filter(isNotificationUnread).length;

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (activeFilter === "Unread") return isNotificationUnread(n);
      if (activeFilter === "Mentions")
        return notificationTypeToUi(n.type) === "mention";
      return true;
    });
  }, [items, activeFilter]);

  const groups = useMemo(() => {
    const grouped: Array<{
      label: "Today" | "Yesterday" | "This Week";
      items: NotificationModel[];
    }> = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "This Week", items: [] },
    ];
    for (const n of filtered) {
      const g = notificationDateGroup(n.createdAtUtc);
      const bucket = grouped.find((x) => x.label === g);
      bucket?.items.push(n);
    }
    return grouped.filter((g) => g.items.length > 0);
  }, [filtered]);

  const filterBadges: Partial<Record<FilterTab, number>> = {
    Unread: unreadCount > 0 ? unreadCount : undefined,
    Mentions:
      items.filter((n) => notificationTypeToUi(n.type) === "mention").length ||
      undefined,
  };

  return (
    <div className="flex h-full flex-col gap-0">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-[#111625]">
            Notifications
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <CheckCheck
                className="h-4 w-4 text-neutral-400"
                strokeWidth={1.5}
              />
              Mark all read
            </button>
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 transition-colors">
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-1 border-b border-neutral-200 pb-0">
        {FILTER_TABS.map((tab) => {
          const badge = filterBadges[tab];
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 pb-3 pt-1 text-[13px] font-medium transition-colors",
                isActive
                  ? "text-[#375dfb]"
                  : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {tab}
              {badge !== undefined && (
                <span
                  className={cn(
                    "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                    isActive
                      ? "bg-[#375dfb] text-white"
                      : "bg-neutral-200 text-neutral-500",
                  )}
                >
                  {badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#375dfb]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="py-20 text-center text-[13px] text-neutral-400">
            Loading notifications…
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-[13px] text-red-500">
            Could not load notifications. Try again later.
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Bell className="h-8 w-8 text-neutral-300" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-neutral-700">
                No notifications
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">
                {activeFilter === "Unread"
                  ? "All caught up! No unread notifications."
                  : activeFilter === "Mentions"
                    ? "You haven't been mentioned recently."
                    : "You're all caught up!"}
              </p>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {group.label}
                </span>
                <div className="flex-1 border-t border-neutral-100" />
              </div>

              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onMarkRead={(id) => markRead.mutate(id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

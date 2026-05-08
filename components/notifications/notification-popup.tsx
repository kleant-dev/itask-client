// components/notifications/notification-popup.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bell, Settings, CheckCheck } from "lucide-react";
import { useState } from "react";

export type NotificationFilter = "All" | "Mention" | "Unread";

export interface Notification {
  id: string;
  avatar?: string;
  avatarFallback: string;
  avatarColor: string;
  message: string;
  time: string;
  isUnread: boolean;
  type?: "mention" | "assignment" | "project" | "comment";
}

export const notifications: Notification[] = [
  {
    id: "1",
    avatarFallback: "YT",
    avatarColor: "bg-purple-400",
    message: "Yuki Tanaka added you to the Artistry project.",
    time: "6 min ago",
    isUnread: true,
    type: "project",
  },
  {
    id: "2",
    avatarFallback: "DS",
    avatarColor: "bg-pink-400",
    message: "Diana Sayu mentioned you in a comment on Wireframe Feedback.",
    time: "24 min ago",
    isUnread: true,
    type: "mention",
  },
  {
    id: "3",
    avatarFallback: "PD",
    avatarColor: "bg-orange-400",
    message: "Palmer Dian assigned you to the Luminos Design System task.",
    time: "1 hour ago",
    isUnread: true,
    type: "assignment",
  },
  {
    id: "4",
    avatarFallback: "AK",
    avatarColor: "bg-green-400",
    message: "Adrian Kurt added you to the Luminos project.",
    time: "2 hours ago",
    isUnread: false,
    type: "project",
  },
];

const filterTabs: NotificationFilter[] = ["All", "Mention", "Unread"];
const filterBadges: Partial<Record<NotificationFilter, number>> = {
  Mention: 2,
  Unread: 3,
};

interface NotificationPopupProps {
  onClose: () => void;
  onViewAll?: () => void;
}

export function NotificationPopup({
  onClose,
  onViewAll,
}: NotificationPopupProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const [items, setItems] = useState<Notification[]>(notifications);

  const filtered = items.filter((n) => {
    if (activeFilter === "Unread") return n.isUnread;
    if (activeFilter === "Mention") return n.type === "mention";
    return true;
  });

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute right-14 top-[60px] w-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
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

          {/* Filter + Mark all read */}
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
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#375dfb] hover:text-[#2749c2] transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Mark all read
            </button>
          </div>
        </div>

        {/* ── NOTIFICATION LIST ── */}
        <div className="max-h-[360px] overflow-y-auto">
          {/* Section label */}
          <div className="px-5 pt-3 pb-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
              Today
            </span>
          </div>

          <div className="flex flex-col">
            {filtered.length === 0 ? (
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
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-neutral-50",
                    notification.isUnread && "bg-[#f7f9fb]",
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shrink-0">
                    {notification.avatar && (
                      <AvatarImage src={notification.avatar} />
                    )}
                    <AvatarFallback
                      className={`text-[12px] font-semibold text-white ${notification.avatarColor}`}
                    >
                      {notification.avatarFallback}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <p className="text-[13px] leading-snug text-[#111625]">
                      {notification.message}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      {notification.time}
                    </span>
                  </div>

                  {/* Unread indicator */}
                  <div className="mt-1.5 shrink-0">
                    {notification.isUnread ? (
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

        {/* ── FOOTER ── */}
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

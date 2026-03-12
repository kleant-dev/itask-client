// components/notifications/notification-popup.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Settings } from "lucide-react";
import { useState } from "react";

type NotificationFilter = "All" | "Mention" | "Unread";

interface Notification {
  id: string;
  avatar?: string;
  avatarFallback: string;
  avatarColor: string;
  message: string;
  time: string;
  isUnread: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    avatarFallback: "YT",
    avatarColor: "bg-purple-400",
    message: "Yuki Tanaka added you to Artistry project.",
    time: "6 min ago",
    isUnread: true,
  },
  {
    id: "2",
    avatarFallback: "DS",
    avatarColor: "bg-pink-400",
    message: "Diana Sayu mentioned you in a comment on Wireframe Feedback",
    time: "24 min ago",
    isUnread: true,
  },
  {
    id: "3",
    avatarFallback: "PD",
    avatarColor: "bg-orange-400",
    message: "Palmer Dian assigned you to Luminos Design System task.",
    time: "1 hour ago",
    isUnread: true,
  },
  {
    id: "4",
    avatarFallback: "AK",
    avatarColor: "bg-green-400",
    message: "Adrian Kurt added you to Luminos project.",
    time: "2 hours ago",
    isUnread: false,
  },
];

const filterTabs: NotificationFilter[] = ["All", "Mention", "Unread"];

const filterBadges: Partial<Record<NotificationFilter, number>> = {
  Mention: 2,
  Unread: 12,
};

interface NotificationPopupProps {
  onClose: () => void;
}

export function NotificationPopup({ onClose }: NotificationPopupProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "Unread") return n.isUnread;
    if (activeFilter === "Mention") return n.message.includes("mentioned");
    return true;
  });

  return (
    // Backdrop
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Popup */}
      <div
        className="absolute right-16 top-16 w-[500px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-6 pt-5 pb-4 border-b border-neutral-100">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
              <span className="text-label-large font-semibold text-[#111625]">
                Notifications
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <Settings
                className="h-4 w-4 text-neutral-500"
                strokeWidth={1.5}
              />
            </Button>
          </div>

          {/* Filter Row */}
          <div className="flex items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-[#f7f9fb] p-1">
              {filterTabs.map((tab) => {
                const badge = filterBadges[tab];
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1 text-p-small transition-colors",
                      isActive
                        ? "bg-white text-[#111625] shadow-sm font-medium"
                        : "text-[#596881] hover:text-neutral-700",
                    )}
                  >
                    <span>{tab}</span>
                    {badge && (
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded text-[10px]",
                          isActive
                            ? "bg-[#dee4ee] text-[#8796af]"
                            : "bg-[#dee4ee] text-[#8796af]",
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mark all as read */}
            <button className="text-p-small text-[#266df0] hover:underline">
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex flex-col px-6 py-3">
          {/* Section Label */}
          <div className="mb-2">
            <span className="text-label-xsmall text-[#8796af]">Today</span>
          </div>

          {/* Items */}
          <div className="flex flex-col">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 py-3 border-b border-neutral-50 last:border-0"
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  {notification.avatar && (
                    <AvatarImage src={notification.avatar} />
                  )}
                  <AvatarFallback
                    className={`text-xs text-white ${notification.avatarColor}`}
                  >
                    {notification.avatarFallback}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-p-small text-[#111625] leading-snug">
                    {notification.message}
                  </p>
                  <span className="text-label-xsmall text-[#8796af]">
                    {notification.time}
                  </span>
                </div>

                {/* Unread Dot */}
                {notification.isUnread && (
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#df1c41]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-6 py-4">
          <button className="w-full text-center text-p-small text-[#266df0] hover:underline">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
}

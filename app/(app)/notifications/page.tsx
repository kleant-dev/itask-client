// app/(app)/notifications/page.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  Settings,
  CheckCheck,
  AtSign,
  UserPlus,
  ListTodo,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ── TYPES ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "mention"
  | "assignment"
  | "project"
  | "comment"
  | "due";
type FilterTab = "All" | "Unread" | "Mentions";

interface NotificationItem {
  id: string;
  type: NotificationType;
  avatar?: string;
  avatarFallback: string;
  avatarColor: string;
  title: string;
  body: string;
  project?: string;
  time: string;
  isUnread: boolean;
  group: "Today" | "Yesterday" | "This Week";
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // Today
  {
    id: "1",
    type: "project",
    avatarFallback: "YT",
    avatarColor: "bg-purple-400",
    title: "Added to project",
    body: "Yuki Tanaka added you to the Artistry project.",
    project: "Artistry",
    time: "6 min ago",
    isUnread: true,
    group: "Today",
  },
  {
    id: "2",
    type: "mention",
    avatarFallback: "DS",
    avatarColor: "bg-pink-400",
    title: "Mentioned you",
    body: 'Diana Sayu mentioned you in a comment on "Wireframe Feedback".',
    project: "Luminos Design System",
    time: "24 min ago",
    isUnread: true,
    group: "Today",
  },
  {
    id: "3",
    type: "assignment",
    avatarFallback: "PD",
    avatarColor: "bg-orange-400",
    title: "Task assigned",
    body: "Palmer Dian assigned you to the Luminos Design System task.",
    project: "Luminos Design System",
    time: "1 hour ago",
    isUnread: true,
    group: "Today",
  },
  {
    id: "4",
    type: "comment",
    avatarFallback: "AK",
    avatarColor: "bg-green-400",
    title: "New comment",
    body: 'Adrian Kurt commented on your task: "Looking great! Just a few minor tweaks needed."',
    project: "Artistry",
    time: "2 hours ago",
    isUnread: false,
    group: "Today",
  },
  {
    id: "5",
    type: "due",
    avatarFallback: "SK",
    avatarColor: "bg-blue-400",
    title: "Task due soon",
    body: 'Your task "UI Component Library" is due in 3 hours.',
    project: "Luminos Design System",
    time: "3 hours ago",
    isUnread: false,
    group: "Today",
  },
  // Yesterday
  {
    id: "6",
    type: "mention",
    avatarFallback: "BL",
    avatarColor: "bg-teal-400",
    title: "Mentioned you",
    body: 'Bram Lutz mentioned you in "Sprint Retrospective" meeting notes.',
    project: "Eventora",
    time: "Yesterday at 4:30 PM",
    isUnread: false,
    group: "Yesterday",
  },
  {
    id: "7",
    type: "project",
    avatarFallback: "YT",
    avatarColor: "bg-purple-400",
    title: "Project updated",
    body: "Yuki Tanaka moved project Eventora to Active status.",
    project: "Eventora",
    time: "Yesterday at 2:15 PM",
    isUnread: false,
    group: "Yesterday",
  },
  {
    id: "8",
    type: "assignment",
    avatarFallback: "DS",
    avatarColor: "bg-pink-400",
    title: "Task assigned",
    body: 'Diana Sayu assigned you the task "Brand Identity Review".',
    project: "Qwicky",
    time: "Yesterday at 10:00 AM",
    isUnread: false,
    group: "Yesterday",
  },
  // This Week
  {
    id: "9",
    type: "comment",
    avatarFallback: "PD",
    avatarColor: "bg-orange-400",
    title: "New comment",
    body: "Palmer Dian replied to your comment with 3 new suggestions.",
    project: "Artistry",
    time: "Mon at 3:45 PM",
    isUnread: false,
    group: "This Week",
  },
  {
    id: "10",
    type: "project",
    avatarFallback: "AK",
    avatarColor: "bg-green-400",
    title: "Added to workspace",
    body: "Adrian Kurt added you to the Qwicky workspace as a Member.",
    project: "Qwicky",
    time: "Mon at 9:00 AM",
    isUnread: false,
    group: "This Week",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getTypeIcon(type: NotificationType) {
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
  }
}

function getTypeColor(type: NotificationType): string {
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
  }
}

// ── NOTIFICATION ROW ──────────────────────────────────────────────────────────

interface NotificationRowProps {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ item, onMarkRead }: NotificationRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl px-4 py-4 transition-colors",
        item.isUnread
          ? "bg-[#f0f5ff] hover:bg-[#e8f0ff]"
          : "hover:bg-neutral-50",
      )}
    >
      {/* Avatar + type badge */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {item.avatar && <AvatarImage src={item.avatar} />}
          <AvatarFallback
            className={`text-[13px] font-semibold text-white ${item.avatarColor}`}
          >
            {item.avatarFallback}
          </AvatarFallback>
        </Avatar>
        {/* Type badge */}
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full",
            getTypeColor(item.type),
          )}
        >
          {getTypeIcon(item.type)}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "text-[13px] leading-snug",
            item.isUnread ? "font-medium text-[#111625]" : "text-neutral-700",
          )}
        >
          {item.body}
        </p>
        <div className="flex items-center gap-2">
          {item.project && (
            <>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                {item.project}
              </span>
              <span className="text-neutral-300">·</span>
            </>
          )}
          <span className="text-[11px] text-neutral-400">{item.time}</span>
        </div>
      </div>

      {/* Unread dot + action */}
      <div className="flex shrink-0 items-center gap-2">
        {item.isUnread && (
          <button
            onClick={() => onMarkRead(item.id)}
            title="Mark as read"
            className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm hover:text-[#375dfb] transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
        <span
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            item.isUnread ? "bg-[#375dfb]" : "bg-transparent",
          )}
        />
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = ["All", "Unread", "Mentions"];

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unreadCount = items.filter((n) => n.isUnread).length;

  const filtered = items.filter((n) => {
    if (activeFilter === "Unread") return n.isUnread;
    if (activeFilter === "Mentions") return n.type === "mention";
    return true;
  });

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)),
    );
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  }

  // Group the filtered items
  const groups: Array<{ label: string; items: NotificationItem[] }> = [
    { label: "Today", items: filtered.filter((n) => n.group === "Today") },
    {
      label: "Yesterday",
      items: filtered.filter((n) => n.group === "Yesterday"),
    },
    {
      label: "This Week",
      items: filtered.filter((n) => n.group === "This Week"),
    },
  ].filter((g) => g.items.length > 0);

  const filterBadges: Partial<Record<FilterTab, number>> = {
    Unread: unreadCount || undefined,
    Mentions: items.filter((n) => n.type === "mention").length || undefined,
  };

  return (
    <div className="flex h-full flex-col gap-0">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
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
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
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

      {/* ── FILTER TABS ──────────────────────────────────────────────────── */}
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
              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#375dfb]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── NOTIFICATION LIST ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-4">
        {groups.length === 0 ? (
          /* Empty state */
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
              {/* Group label */}
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {group.label}
                </span>
                <div className="flex-1 border-t border-neutral-100" />
              </div>

              {/* Items */}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onMarkRead={markRead}
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

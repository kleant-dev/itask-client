import type { NotificationModel, NotificationType } from "@/types/models";

export type NotificationUiType =
  | "mention"
  | "assignment"
  | "project"
  | "comment"
  | "due"
  | "message";

const AVATAR_COLORS = [
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-blue-400",
  "bg-teal-400",
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 31) | 0;
  return Math.abs(h);
}

export function notificationTypeToUi(
  type: NotificationType,
): NotificationUiType {
  switch (type) {
    case "Mentioned":
      return "mention";
    case "TaskAssigned":
      return "assignment";
    case "Commented":
      return "comment";
    case "Deadline":
      return "due";
    case "DirectMessage":
      return "message";
    case "InviteAccepted":
    case "ProjectUpdate":
    default:
      return "project";
  }
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function notificationDateGroup(
  iso: string,
): "Today" | "Yesterday" | "This Week" {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  return "This Week";
}

export function notificationDisplayMessage(n: NotificationModel): string {
  if (n.body?.trim()) return n.body.trim();
  if (n.entityName?.trim()) {
    return `${n.title} — ${n.entityName}`;
  }
  return n.title;
}

export function notificationAvatarFallback(n: NotificationModel): string {
  const source = n.entityName ?? n.title;
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "N";
}

export function notificationAvatarColor(n: NotificationModel): string {
  const idx = hashString(n.id) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function isNotificationUnread(n: NotificationModel): boolean {
  return n.readAtUtc == null;
}

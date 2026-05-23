import { toast } from "sonner";
import type { NotificationModel } from "@/types/models";
import { notificationDisplayMessage } from "@/lib/utils/notifications";

export function toastMessageNotification(
  senderName: string,
  preview: string,
  channelId?: string,
): void {
  const title = `${senderName} messaged you`;
  toast.message(title, {
    description: preview,
    action: channelId
      ? {
          label: "Open chat",
          onClick: () => {
            window.location.href = `/messages?channel=${encodeURIComponent(channelId)}`;
          },
        }
      : {
          label: "Messages",
          onClick: () => {
            window.location.href = "/messages";
          },
        },
  });
}

export function toastAppNotification(notification: NotificationModel): void {
  const message = notificationDisplayMessage(notification);
  const isMessage = notification.type === "DirectMessage";
  const channelId =
    isMessage && notification.entityName
      ? notification.entityName
      : undefined;
  const taskId = notification.taskId;
  const projectId = notification.projectId;

  toast.message(notification.title, {
    description: message !== notification.title ? message : undefined,
    action: isMessage
      ? {
          label: "Open chat",
          onClick: () => {
            const href = channelId
              ? `/messages?channel=${encodeURIComponent(channelId)}`
              : "/messages";
            window.location.href = href;
          },
        }
      : taskId && projectId
        ? {
            label: "View task",
            onClick: () => {
              window.location.href = `/projects/${encodeURIComponent(projectId)}?task=${encodeURIComponent(taskId)}`;
            },
          }
        : undefined,
  });
}

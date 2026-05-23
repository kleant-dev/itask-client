import type { MessageModel } from "@/types/message-models";

/** True only when the message was edited after send (not create-time timestamp noise). */
export function isMessageEdited(message: Pick<MessageModel, "createdAtUtc" | "updatedAtUtc">): boolean {
  const created = new Date(message.createdAtUtc).getTime();
  const updated = new Date(message.updatedAtUtc).getTime();
  return updated - created > 3000;
}

/** Distance from bottom (px) to treat the chat as "pinned" to latest messages. */
export const CHAT_SCROLL_PIN_THRESHOLD = 48;

export function isChatPinnedToBottom(container: HTMLElement): boolean {
  const distance =
    container.scrollHeight - container.scrollTop - container.clientHeight;
  return distance <= CHAT_SCROLL_PIN_THRESHOLD;
}

export function scrollChatToBottom(
  container: HTMLElement,
  behavior: ScrollBehavior = "auto",
): void {
  if (behavior === "smooth") {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  } else {
    container.scrollTop = container.scrollHeight;
  }
}

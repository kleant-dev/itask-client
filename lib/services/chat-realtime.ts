/**
 * Central SignalR event wiring for chat. Handlers are registered once per
 * connection instance and fan out to the Zustand chat store.
 */
import type { MessageModel } from "@/types/message-models";
import {
  getConnection,
  startConnection,
  onReceiveMessage,
  onMessageEdited,
  onMessageDeleted,
  onMessagesRead,
} from "@/lib/services/chat-hub";
import { useChatStore } from "@/lib/stores/chat-store";
import { useAuthStore } from "@/lib/stores/auth-store";

const recentMessageIds = new Set<string>();
const MAX_RECENT_IDS = 500;

let handlersAttached = false;

/** Dedupes hub events when the same payload would be delivered twice. */
export function rememberChatMessageId(id: string): boolean {
  if (recentMessageIds.has(id)) return false;
  recentMessageIds.add(id);
  if (recentMessageIds.size > MAX_RECENT_IDS) {
    const first = recentMessageIds.values().next().value;
    if (first) recentMessageIds.delete(first);
  }
  return true;
}

function handleIncomingMessage(msg: MessageModel) {
  if (!rememberChatMessageId(msg.id)) return;

  const store = useChatStore.getState();
  store.upsertLastMessage(msg);

  const currentUserId = useAuthStore.getState().user?.id;
  const isOwn = msg.authorId === currentUserId;
  const isActive = msg.channelId === store.activeChannelId;

  if (!isOwn && !isActive) {
    store.incrementUnread(msg.channelId);
  } else if (!isOwn && isActive) {
    store.resetUnread(msg.channelId);
  }
}

export async function ensureChatRealtimeHandlers(): Promise<void> {
  await startConnection();

  if (handlersAttached) return;
  handlersAttached = true;

  onReceiveMessage(handleIncomingMessage);

  onMessageEdited((edited) => {
    const store = useChatStore.getState();
    const last = store.lastMessagesByChannel[edited.channelId];
    if (last?.id === edited.id) {
      store.upsertLastMessage(edited);
    }
  });

  onMessageDeleted(({ messageId, channelId }) => {
    const store = useChatStore.getState();
    const last = store.lastMessagesByChannel[channelId];
    if (last?.id === messageId) {
      const { [channelId]: _, ...rest } = store.lastMessagesByChannel;
      useChatStore.setState({ lastMessagesByChannel: rest });
    }
  });

  onMessagesRead(({ channelId, readByUserId, readAtUtc }) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (readByUserId === currentUserId) return;

    const store = useChatStore.getState();
    const last = store.lastMessagesByChannel[channelId];
    if (
      last &&
      last.authorId === currentUserId &&
      !last.readAtUtc &&
      new Date(last.createdAtUtc) <= new Date(readAtUtc)
    ) {
      store.upsertLastMessage({ ...last, readAtUtc });
    }
  });

  const conn = getConnection();
  conn.onreconnected(() => {
    handlersAttached = false;
    ensureChatRealtimeHandlers().catch(() => {});
  });
}

export function resetChatRealtimeHandlers(): void {
  handlersAttached = false;
  recentMessageIds.clear();
}

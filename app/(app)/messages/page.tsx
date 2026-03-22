"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { EmptyMessageState } from "@/components/messages/empty-message-state";
import { NewMessageModal } from "@/components/messages/new-message-modal";
import {
  useWorkspaceChannels,
  useWorkspaceMembers,
} from "@/lib/hooks/use-channels";
import { useAuthStore } from "@/lib/stores/auth-store";
import { startConnection, onReceiveMessage } from "@/lib/services/chat-hub";
import { messagesApi } from "@/lib/api/messages";
import type { UserModel } from "@/types/models";
import type { MessageModel } from "@/types/message-models";

/** Mirrors server's ComputeParticipantHash: SHA256(sorted ids joined by "|") */
async function computeParticipantHash(
  id1: string,
  id2: string,
): Promise<string> {
  const sorted = [id1, id2].sort().join("|");
  const bytes = new TextEncoder().encode(sorted);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fetches the single most-recent message for a channel.
 * The server always returns messages oldest-first (ORDER BY createdAtUtc ASC),
 * so we fetch the last page and take the last item.
 */
async function fetchLastMessage(
  channelId: string,
): Promise<MessageModel | null> {
  // First fetch page 1 with pageSize 1 just to get totalCount
  const probe = await messagesApi.getByChannel(channelId, {
    pageNumber: 1,
    pageSize: 1,
  });
  if (probe.totalCount === 0) return null;

  // Jump straight to the last page
  const lastPage = probe.totalPages;
  const result = await messagesApi.getByChannel(channelId, {
    pageNumber: lastPage,
    pageSize: 1,
  });
  return result.items[result.items.length - 1] ?? null;
}

export default function MessagesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserModel | null>(
    null,
  );
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  // hash → otherUser, computed once we know currentUser + workspace members
  const [hashToUser, setHashToUser] = useState<Map<string, UserModel>>(
    new Map(),
  );

  // channelId → last MessageModel, updated on load + real-time
  const [lastMessages, setLastMessages] = useState<Map<string, MessageModel>>(
    new Map(),
  );

  // channelId → unread message count for the current user (client-side)
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map(),
  );

  const { data: channelsData, isLoading } = useWorkspaceChannels();
  const { data: membersData } = useWorkspaceMembers();

  // Build userId → UserModel map
  const userMap = new Map<string, UserModel>();
  for (const m of membersData?.items ?? []) {
    if (m.user) userMap.set(m.userId, m.user as UserModel);
  }

  // Compute participantHash for every other workspace member
  useEffect(() => {
    if (!hasHydrated || !currentUser || userMap.size === 0) return;
    const others = Array.from(userMap.values()).filter(
      (u) => u.id !== currentUser.id,
    );
    if (others.length === 0) return;

    Promise.all(
      others.map(async (u) => {
        const hash = await computeParticipantHash(currentUser.id, u.id);
        return [hash, u] as const;
      }),
    ).then((entries) => setHashToUser(new Map(entries)));
  }, [hasHydrated, currentUser?.id, userMap.size]);

  // type === 2 is DirectMessage
  const channels = (channelsData?.items ?? []).filter(
    (ch) => Number(ch.type) === 2,
  );

  const conversationItems = channels
    .flatMap((ch) => {
      if (!ch.participantHash) return [];
      const otherUser = hashToUser.get(ch.participantHash);
      if (!otherUser) return [];
      const last = lastMessages.get(ch.id);
      return [
        {
          channel: ch,
          otherUser,
          lastMessage: last?.body,
          lastMessageAt: last?.createdAtUtc,
          unreadCount: unreadCounts.get(ch.id) ?? 0,
        },
      ];
    })
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    });

  // Fetch the actual last message for each channel (server is oldest-first, so we
  // jump to the last page rather than blindly taking items[0])
  useEffect(() => {
    if (channels.length === 0 || hashToUser.size === 0) return;

    channels.forEach(async (ch) => {
      try {
        const last = await fetchLastMessage(ch.id);
        if (last) {
          setLastMessages((prev) => new Map(prev).set(ch.id, last));
        }
      } catch {
        // Non-fatal — channel might have no messages yet
      }
    });
  }, [channels.length, hashToUser.size]);

  // Update last message + unread counts in real-time when a new message arrives
  useEffect(() => {
    const unsub = onReceiveMessage((msg) => {
      // Keep last message per channel in sync
      setLastMessages((prev) => {
        const existing = prev.get(msg.channelId);
        if (
          !existing ||
          new Date(msg.createdAtUtc) > new Date(existing.createdAtUtc)
        ) {
          return new Map(prev).set(msg.channelId, msg);
        }
        return prev;
      });

      // Maintain a WhatsApp-style unread counter per conversation.
      setUnreadCounts((prev) => {
        const next = new Map(prev);
        const isOwn = msg.authorId === currentUser?.id;

        // Never increment unread for messages we authored.
        if (isOwn) return next;

        // If we're currently viewing this channel, treat incoming messages
        // as read immediately.
        if (msg.channelId === selectedChannelId) {
          next.set(msg.channelId, 0);
        } else {
          const current = next.get(msg.channelId) ?? 0;
          next.set(msg.channelId, current + 1);
        }

        return next;
      });
    });
    return unsub;
  }, [currentUser?.id, selectedChannelId]);

  useEffect(() => {
    if (accessToken) startConnection();
  }, [accessToken]);

  useEffect(() => {
    if (!selectedChannelId || !currentUser) return;
    const item = conversationItems.find(
      (i) => i.channel.id === selectedChannelId,
    );
    if (item) setSelectedOtherUser(item.otherUser);
  }, [selectedChannelId, conversationItems.length]);

  const workspaceMembers = Array.from(userMap.values()).filter(
    (u) => u.id !== currentUser?.id,
  );

  function handleSelectChannel(channelId: string) {
    setSelectedChannelId(channelId);
    // Opening a conversation clears its unread counter.
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.set(channelId, 0);
      return next;
    });
  }

  function handleChannelCreated(channelId: string, otherUser: UserModel) {
    handleSelectChannel(channelId);
    setSelectedOtherUser(otherUser);
  }

  const isReady = hasHydrated && hashToUser.size > 0;

  const selectedChannel = channels.find((ch) => ch.id === selectedChannelId);
  const selectedMembers = selectedChannel?.members ?? [];
  const selectedCurrentMember = currentUser
    ? selectedMembers.find((m) => m.userId === currentUser.id)
    : undefined;
  const selectedOtherMember = selectedOtherUser
    ? selectedMembers.find((m) => m.userId === selectedOtherUser.id)
    : undefined;

  return (
    <div className="-m-6 flex h-full overflow-hidden">
      <ConversationList
        items={conversationItems}
        selectedChannelId={selectedChannelId}
        onSelect={handleSelectChannel}
        onNewMessage={() => setNewMessageOpen(true)}
        isLoading={isLoading || !isReady}
      />
      {selectedChannelId && selectedOtherUser ? (
        <ChatWindow
          key={selectedChannelId}
          channelId={selectedChannelId}
          otherUser={selectedOtherUser}
          currentUserLastReadAt={selectedCurrentMember?.lastReadAtUtc ?? null}
          otherUserLastReadAt={selectedOtherMember?.lastReadAtUtc ?? null}
        />
      ) : (
        <EmptyMessageState />
      )}
      <NewMessageModal
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        workspaceMembers={workspaceMembers}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
}

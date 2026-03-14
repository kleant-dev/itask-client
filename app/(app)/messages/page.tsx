"use client";

import { useState, useEffect, useCallback } from "react";
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

  const { data: channelsData, isLoading } = useWorkspaceChannels();
  const { data: membersData } = useWorkspaceMembers();

  // Build userId → UserModel map
  const userMap = new Map<string, UserModel>();
  for (const m of membersData?.items ?? []) {
    if (m.user) userMap.set(m.userId, m.user as UserModel);
  }

  // Compute participantHash for every other workspace member once we have both
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
        },
      ];
    })
    .sort((a, b) => {
      // Most recent conversation first
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    });

  // Fetch last message for each DM channel once channels + hashToUser are ready
  useEffect(() => {
    if (channels.length === 0 || hashToUser.size === 0) return;

    channels.forEach(async (ch) => {
      try {
        // pageSize=1 with descending order gives us just the last message
        const result = await messagesApi.getByChannel(ch.id, { pageSize: 1 });
        const last = result.items[result.items.length - 1];
        if (last) {
          setLastMessages((prev) => new Map(prev).set(ch.id, last));
        }
      } catch {
        // Non-fatal — channel might have no messages yet
      }
    });
  }, [channels.length, hashToUser.size]);

  // Update last message in real-time when a new message arrives on any channel
  useEffect(() => {
    const unsub = onReceiveMessage((msg) => {
      setLastMessages((prev) => {
        const existing = prev.get(msg.channelId);
        // Only update if this message is newer
        if (
          !existing ||
          new Date(msg.createdAtUtc) > new Date(existing.createdAtUtc)
        ) {
          return new Map(prev).set(msg.channelId, msg);
        }
        return prev;
      });
    });
    return unsub;
  }, []);

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

  function handleChannelCreated(channelId: string, otherUser: UserModel) {
    setSelectedChannelId(channelId);
    setSelectedOtherUser(otherUser);
  }

  const isReady = hasHydrated && hashToUser.size > 0;

  return (
    <div className="-m-6 flex h-full overflow-hidden">
      <ConversationList
        items={conversationItems}
        selectedChannelId={selectedChannelId}
        onSelect={setSelectedChannelId}
        onNewMessage={() => setNewMessageOpen(true)}
        isLoading={isLoading || !isReady}
      />
      {selectedChannelId && selectedOtherUser ? (
        <ChatWindow
          key={selectedChannelId}
          channelId={selectedChannelId}
          otherUser={selectedOtherUser}
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

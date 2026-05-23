"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { EmptyMessageState } from "@/components/messages/empty-message-state";
import { NewMessageModal } from "@/components/messages/new-message-modal";
import {
  useWorkspaceChannels,
  useWorkspaceMembers,
} from "@/lib/hooks/use-channels";
import { useChannelUnreadSummary } from "@/lib/hooks/use-channel-unread";
import { useJoinChannelGroups } from "@/lib/hooks/use-join-channel-groups";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { ensureChatRealtimeHandlers } from "@/lib/services/chat-realtime";
import { messagesApi } from "@/lib/api/messages";
import type { UserModel } from "@/types/models";
import type { MessageModel } from "@/types/message-models";

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

async function fetchLastMessage(
  channelId: string,
): Promise<MessageModel | null> {
  const probe = await messagesApi.getByChannel(channelId, {
    pageNumber: 1,
    pageSize: 1,
  });
  if (probe.totalCount === 0) return null;

  const lastPage = probe.totalPages;
  const result = await messagesApi.getByChannel(channelId, {
    pageNumber: lastPage,
    pageSize: 1,
  });
  return result.items[result.items.length - 1] ?? null;
}

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const channelFromUrl = searchParams.get("channel");

  const currentUser = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const lastMessagesByChannel = useChatStore((s) => s.lastMessagesByChannel);
  const upsertLastMessage = useChatStore((s) => s.upsertLastMessage);
  const resetUnread = useChatStore((s) => s.resetUnread);
  const setActiveChannel = useChatStore((s) => s.setActiveChannel);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserModel | null>(
    null,
  );
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [hashToUser, setHashToUser] = useState<Map<string, UserModel>>(
    new Map(),
  );

  const { data: channelsData, isLoading } = useWorkspaceChannels();
  const { data: membersData } = useWorkspaceMembers();
  useChannelUnreadSummary();

  const userMap = useMemo(() => {
    const map = new Map<string, UserModel>();
    for (const m of membersData?.items ?? []) {
      if (m.user) map.set(m.userId, m.user as UserModel);
    }
    return map;
  }, [membersData?.items]);

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
  }, [hasHydrated, currentUser?.id, userMap]);

  const channels = (channelsData?.items ?? []).filter(
    (ch) => ch.type === "DirectMessage",
  );

  const channelIds = useMemo(() => channels.map((c) => c.id), [channels]);

  useEffect(() => {
    ensureChatRealtimeHandlers().catch(() => {});
  }, []);

  useJoinChannelGroups(channelIds);

  const conversationItems = useMemo(() => {
    return channels
      .flatMap((ch) => {
        if (!ch.participantHash) return [];
        const otherUser = hashToUser.get(ch.participantHash);
        if (!otherUser) return [];
        const last = lastMessagesByChannel[ch.id];
        const isOwnLast = last?.authorId === currentUser?.id;
        return [
          {
            channel: ch,
            otherUser,
            lastMessage: last?.body,
            lastMessageAt: last?.createdAtUtc,
            lastMessageAuthorId: last?.authorId,
            lastMessageIsOwn: isOwnLast,
            lastMessageReadAt: isOwnLast ? last?.readAtUtc : null,
            unreadCount: unreadCounts[ch.id] ?? 0,
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
  }, [
    channels,
    hashToUser,
    lastMessagesByChannel,
    unreadCounts,
    currentUser?.id,
  ]);

  useEffect(() => {
    if (channels.length === 0 || hashToUser.size === 0) return;

    channels.forEach(async (ch) => {
      try {
        const last = await fetchLastMessage(ch.id);
        if (last) upsertLastMessage(last);
      } catch {
        // channel may have no messages
      }
    });
  }, [channels.length, hashToUser.size, upsertLastMessage]);

  const isReady = hasHydrated && hashToUser.size > 0;

  useEffect(() => {
    if (!channelFromUrl || !isReady) return;
    if (channels.some((c) => c.id === channelFromUrl)) {
      setSelectedChannelId(channelFromUrl);
      setActiveChannel(channelFromUrl);
      resetUnread(channelFromUrl);
    }
  }, [channelFromUrl, isReady, channels, setActiveChannel, resetUnread]);

  useEffect(() => {
    if (!selectedChannelId || !currentUser) return;
    const item = conversationItems.find(
      (i) => i.channel.id === selectedChannelId,
    );
    if (item) setSelectedOtherUser(item.otherUser);
  }, [selectedChannelId, conversationItems, currentUser]);

  const workspaceMembers = Array.from(userMap.values()).filter(
    (u) => u.id !== currentUser?.id,
  );

  function handleSelectChannel(channelId: string) {
    setSelectedChannelId(channelId);
    setActiveChannel(channelId);
    resetUnread(channelId);
  }

  function handleChannelCreated(channelId: string, otherUser: UserModel) {
    handleSelectChannel(channelId);
    setSelectedOtherUser(otherUser);
  }

  return (
    <div className="-m-6 flex h-full overflow-hidden">
      <ConversationList
        items={conversationItems}
        selectedChannelId={selectedChannelId}
        onSelect={handleSelectChannel}
        onNewMessage={() => setNewMessageOpen(true)}
        isLoading={isLoading || !isReady}
        currentUserId={currentUser?.id}
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

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="-m-6 flex h-full items-center justify-center text-[13px] text-neutral-500">
          Loading messages…
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}

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
import { startConnection } from "@/lib/services/chat-hub";
import type { UserModel } from "@/types/models";
import type { ChannelModel } from "@/types/message-models";

export default function MessagesPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserModel | null>(
    null,
  );
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const { data: channelsData, isLoading } = useWorkspaceChannels();
  const { data: membersData } = useWorkspaceMembers(); // ← fetch members with user info

  // Build a userId → UserModel map from workspace members (has name/avatar/email)
  const userMap = new Map<string, UserModel>();
  for (const m of membersData?.items ?? []) {
    if (m.user) userMap.set(m.userId, m.user as UserModel);
  }

  const channels = (channelsData?.items ?? []).filter(
    (ch) => ch.type === "DirectMessage",
  );

  // Build conversation items — look up the other user from the workspace member map
  const conversationItems = channels.flatMap((ch) => {
    if (!currentUser) return [];
    // Find the other participant: the member whose userId isn't ours
    const otherMember = (ch.members ?? []).find(
      (m) => m.userId !== currentUser.id,
    );
    // Fall back to workspace member map (covers channels that don't return members inline)
    const otherUser =
      (otherMember?.user as UserModel | undefined) ??
      (otherMember ? userMap.get(otherMember.userId) : undefined);
    if (!otherUser) return [];
    return [{ channel: ch, otherUser }];
  });

  // If we have no inline channel members (Bug 4), fall back: derive otherUser from participantHash
  // by matching against workspace members. participantHash = sorted userId concat.
  const conversationItemsFallback =
    conversationItems.length === 0
      ? channels.flatMap((ch) => {
          if (!currentUser || !ch.participantHash) return [];
          // participantHash contains both userIds — find the one that isn't ours
          const otherUser = Array.from(userMap.values()).find(
            (u) =>
              u.id !== currentUser.id && ch.participantHash!.includes(u.id),
          );
          if (!otherUser) return [];
          return [{ channel: ch, otherUser }];
        })
      : conversationItems;

  useEffect(() => {
    if (!selectedChannelId || !currentUser) return;
    const item = conversationItemsFallback.find(
      (i) => i.channel.id === selectedChannelId,
    );
    if (item) setSelectedOtherUser(item.otherUser);
  }, [selectedChannelId, conversationItemsFallback.length]);

  useEffect(() => {
    startConnection();
  }, []);

  // All workspace members except self — for the New Message modal
  const workspaceMembers = Array.from(userMap.values()).filter(
    (u) => u.id !== currentUser?.id,
  );

  function handleChannelCreated(channelId: string, otherUser: UserModel) {
    setSelectedChannelId(channelId);
    setSelectedOtherUser(otherUser);
  }

  return (
    <div className="-m-6 flex h-full overflow-hidden">
      <ConversationList
        items={conversationItemsFallback}
        selectedChannelId={selectedChannelId}
        onSelect={setSelectedChannelId}
        onNewMessage={() => setNewMessageOpen(true)}
        isLoading={isLoading}
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

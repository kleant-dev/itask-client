// app/(app)/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { EmptyMessageState } from "@/components/messages/empty-message-state";
import { NewMessageModal } from "@/components/messages/new-message-modal";
import { useWorkspaceChannels } from "@/lib/hooks/use-channels";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { startConnection } from "@/lib/services/chat-hub";
import type { UserModel } from "@/types/models";
import type { ChannelModel } from "@/types/message-models";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Build a stable lookup from userId → UserModel from the members arrays. */
function buildUserMap(channels: ChannelModel[]): Map<string, UserModel> {
  const map = new Map<string, UserModel>();
  for (const ch of channels) {
    for (const m of ch.members ?? []) {
      if (m.user) map.set(m.user.id, m.user);
    }
  }
  return map;
}

/** Extract the other participant from a DM channel. */
function getOtherUser(
  channel: ChannelModel,
  currentUserId: string,
  userMap: Map<string, UserModel>,
): UserModel | undefined {
  const member = (channel.members ?? []).find(
    (m) => m.userId !== currentUserId,
  );
  if (!member) return undefined;
  return userMap.get(member.userId) ?? member.user;
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

const MessagesPage = () => {
  const currentUser = useAuthStore((s) => s.user);
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserModel | null>(
    null,
  );
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const { data, isLoading } = useWorkspaceChannels();
  const channels = (data?.items ?? []).filter(
    (ch) => ch.type === "DirectMessage",
  );

  const userMap = buildUserMap(channels);

  // Build conversation items for the sidebar list
  const conversationItems = channels.flatMap((ch) => {
    if (!currentUser) return [];
    const otherUser = getOtherUser(ch, currentUser.id, userMap);
    if (!otherUser) return [];
    return [{ channel: ch, otherUser }];
  });

  // Keep selectedOtherUser in sync when channel changes
  useEffect(() => {
    if (!selectedChannelId || !currentUser) return;
    const ch = channels.find((c) => c.id === selectedChannelId);
    if (!ch) return;
    const other = getOtherUser(ch, currentUser.id, userMap);
    if (other) setSelectedOtherUser(other);
  }, [selectedChannelId, channels.length]);

  // Ensure SignalR connection is live while on this page
  useEffect(() => {
    startConnection();
  }, []);

  function handleSelectChannel(channelId: string) {
    setSelectedChannelId(channelId);
  }

  function handleChannelCreated(channelId: string, otherUser: UserModel) {
    setSelectedChannelId(channelId);
    setSelectedOtherUser(otherUser);
  }

  // Workspace members for the new-message modal (derived from userMap)
  const workspaceMembers = Array.from(userMap.values()).filter(
    (u) => u.id !== currentUser?.id,
  );

  return (
    // Override the parent layout's overflow/padding for the full-bleed split layout
    <div className="-m-6 flex h-full overflow-hidden">
      {/* Left panel – conversation list */}
      <ConversationList
        items={conversationItems}
        selectedChannelId={selectedChannelId}
        onSelect={handleSelectChannel}
        onNewMessage={() => setNewMessageOpen(true)}
        isLoading={isLoading}
      />

      {/* Right panel – chat or empty state */}
      {selectedChannelId && selectedOtherUser ? (
        <ChatWindow
          key={selectedChannelId}
          channelId={selectedChannelId}
          otherUser={selectedOtherUser}
        />
      ) : (
        <EmptyMessageState />
      )}

      {/* New message modal */}
      <NewMessageModal
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        workspaceMembers={workspaceMembers}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
};

export default MessagesPage;

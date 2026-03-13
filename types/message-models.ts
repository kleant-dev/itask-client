// ============================================================
// ADD these interfaces to types/models.ts
// ============================================================

import { UserModel } from "./models";

export interface MessageModel {
  id: string;
  channelId: string;
  authorId: string;
  replyToId?: string | null;
  body: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  // Enriched client-side from user lookup:
  author?: UserModel;
}

export type ChannelType = "DirectMessage" | "Group" | "Project";

export interface ChannelModel {
  id: string;
  workspaceId: string;
  createdById?: string | null;
  type: ChannelType;
  name?: string | null;
  projectId?: string | null;
  participantHash?: string | null;
  createdAtUtc: string;
  members?: ChannelMemberModel[];
}

export interface ChannelMemberModel {
  channelId: string;
  userId: string;
  lastReadAtUtc?: string | null;
  joinedAtUtc: string;
  user?: UserModel;
}

// Client-side enriched conversation item (merged channel + last message + other user)
export interface ConversationItem {
  channelId: string;
  otherUser: UserModel;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

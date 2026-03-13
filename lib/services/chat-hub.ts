// lib/services/chat-hub.ts
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { MessageModel } from "@/types/message-models";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MessageHandler = (message: MessageModel) => void;
export type MessageEditedHandler = (message: MessageModel) => void;
export type MessageDeletedHandler = (data: {
  messageId: string;
  channelId: string;
}) => void;
export type TypingHandler = (data: {
  userId: string;
  channelId: string;
}) => void;

// ── Singleton hub connection ──────────────────────────────────────────────────

let connection: HubConnection | null = null;

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl("/hubs/chat", {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
    })
    .withAutomaticReconnect([0, 1000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build();
}

export function getConnection(): HubConnection {
  if (!connection) {
    connection = buildConnection();
  }
  return connection;
}

// ── Start / stop ──────────────────────────────────────────────────────────────

export async function startConnection(): Promise<void> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Disconnected) {
    await conn.start();
  }
}

export async function stopConnection(): Promise<void> {
  if (connection?.state === HubConnectionState.Connected) {
    await connection.stop();
  }
}

// ── Channel management ────────────────────────────────────────────────────────

export async function joinChannel(channelId: string): Promise<void> {
  await startConnection();
  await getConnection().invoke("JoinChannel", channelId);
}

export async function leaveChannel(channelId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Connected) {
    await conn.invoke("LeaveChannel", channelId);
  }
}

// ── Send / edit / delete ──────────────────────────────────────────────────────

export async function sendMessage(
  channelId: string,
  body: string,
  replyToId?: string,
): Promise<void> {
  await startConnection();
  await getConnection().invoke("SendMessage", { channelId, body, replyToId });
}

export async function editMessage(
  messageId: string,
  body: string,
): Promise<void> {
  await startConnection();
  await getConnection().invoke("EditMessage", { messageId, body });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await startConnection();
  await getConnection().invoke("DeleteMessage", messageId);
}

export async function sendTyping(channelId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Connected) {
    await conn.invoke("Typing", channelId);
  }
}

// ── Event subscriptions ───────────────────────────────────────────────────────

export function onReceiveMessage(handler: MessageHandler): () => void {
  const conn = getConnection();
  conn.on("ReceiveMessage", handler);
  return () => conn.off("ReceiveMessage", handler);
}

export function onMessageEdited(handler: MessageEditedHandler): () => void {
  const conn = getConnection();
  conn.on("MessageEdited", handler);
  return () => conn.off("MessageEdited", handler);
}

export function onMessageDeleted(handler: MessageDeletedHandler): () => void {
  const conn = getConnection();
  conn.on("MessageDeleted", handler);
  return () => conn.off("MessageDeleted", handler);
}

export function onUserTyping(handler: TypingHandler): () => void {
  const conn = getConnection();
  conn.on("UserTyping", handler);
  return () => conn.off("UserTyping", handler);
}

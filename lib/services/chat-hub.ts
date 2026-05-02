// lib/services/chat-hub.ts
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { MessageModel } from "@/types/message-models";

// Call-related types used by the WebRTC layer
export type CallKind = "audio" | "video";

export interface StartCallPayload {
  callId: string;
  channelId: string;
  fromUserId: string;
  toUserId: string;
  kind: CallKind;
  sdp: RTCSessionDescriptionInit;
}

export interface AcceptCallPayload {
  callId: string;
  channelId: string;
}

export interface RejectCallPayload {
  callId: string;
  channelId: string;
}

export interface EndCallPayload {
  callId: string;
  channelId: string;
}

export interface IncomingCallPayload {
  callId: string;
  channelId: string;
  fromUserId: string;
  toUserId: string;
  kind: CallKind;
}

export type CallSignalType = "offer" | "answer" | "ice-candidate";

export interface CallSignal {
  callId: string;
  fromUserId: string;
  toUserId: string;
  type: CallSignalType;
  data: any;
}

export interface OutgoingCallSignal {
  callId: string;
  toUserId: string;
  type: CallSignalType;
  data: any;
}

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

export type IncomingCallHandler = (data: IncomingCallPayload) => void;
export type CallEndedHandler = (data: EndCallPayload) => void;
export type CallSignalHandler = (data: CallSignal) => void;

// ── Singleton hub connection ──────────────────────────────────────────────────

let connection: HubConnection | null = null;

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(
      `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5003"}/hubs/chat`,
      {
        accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
      },
    )
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
  if (!connection) return;

  try {
    if (
      connection.state === HubConnectionState.Connected ||
      connection.state === HubConnectionState.Reconnecting
    ) {
      await connection.stop();
    }
  } catch (err) {
    console.error("[SignalR] Failed to stop connection:", err);
  } finally {
    connection = null;
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

// ── Call control (signalling only, media is WebRTC in the client) ──────────────

export async function startCall(payload: StartCallPayload): Promise<void> {
  await startConnection();
  await getConnection().invoke("StartCall", payload);
}

export async function acceptCall(payload: AcceptCallPayload): Promise<void> {
  await startConnection();
  await getConnection().invoke("AcceptCall", payload);
}

export async function rejectCall(payload: RejectCallPayload): Promise<void> {
  await startConnection();
  await getConnection().invoke("RejectCall", payload);
}

export async function endCall(payload: EndCallPayload): Promise<void> {
  await startConnection();
  await getConnection().invoke("EndCall", payload);
}

export async function sendCallSignal(
  payload: OutgoingCallSignal,
): Promise<void> {
  await startConnection();
  await getConnection().invoke("CallSignal", payload);
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

export function onIncomingCall(handler: IncomingCallHandler): () => void {
  const conn = getConnection();
  conn.on("IncomingCall", handler);
  return () => conn.off("IncomingCall", handler);
}

export function onCallEnded(handler: CallEndedHandler): () => void {
  const conn = getConnection();
  conn.on("CallEnded", handler);
  return () => conn.off("CallEnded", handler);
}

export function onCallSignal(handler: CallSignalHandler): () => void {
  const conn = getConnection();
  conn.on("CallSignal", handler);
  return () => conn.off("CallSignal", handler);
}

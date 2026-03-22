// lib/hooks/use-call.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as hub from "@/lib/services/chat-hub";

export type CallKind = "audio" | "video";

export type CallPhase =
  | "idle"
  | "calling" // outgoing, waiting for other party
  | "ringing" // incoming, waiting for our accept/reject
  | "connecting" // we accepted / they accepted, WebRTC handshaking
  | "in-call"
  | "ended"
  | "error";

export interface UseCallOptions {
  channelId: string;
  currentUserId: string;
  otherUserId: string;
}

export interface UseCallResult {
  phase: CallPhase;
  kind: CallKind | null;
  callId: string | null;
  isCaller: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (kind: CallKind) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  hangUp: () => Promise<void>;
}

// Very small helper so we don't scatter WebRTC config.
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // You can add your own TURN here when available.
  ],
};

export function useCall({
  channelId,
  currentUserId,
  otherUserId,
}: UseCallOptions): UseCallResult {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [kind, setKind] = useState<CallKind | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Tear down media + RTCPeerConnection
  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setPhase("idle");
    setKind(null);
    setCallId(null);
    setIsCaller(false);
  }, [localStream]);

  // Handle incoming signalling from SignalR
  useEffect(() => {
    const offIncoming = hub.onIncomingCall((payload) => {
      if (payload.channelId !== channelId) return;
      if (payload.toUserId !== currentUserId) return;

      setCallId(payload.callId);
      setKind(payload.kind);
      setIsCaller(false);
      setPhase("ringing");
    });

    const offCallEnded = hub.onCallEnded((payload) => {
      if (payload.callId !== callId) return;
      setPhase("ended");
      cleanup();
    });

    const offCallSignal = hub.onCallSignal(async (signal) => {
      if (signal.callId !== callId) return;
      // Only handle signals that are actually addressed to us,
      // and ignore anything we ourselves originated that the hub
      // broadcast back to the whole group.
      if (signal.toUserId !== currentUserId) return;
      if (signal.fromUserId === currentUserId) return;
      const pc = pcRef.current;
      try {
        if (signal.type === "offer") {
          // For incoming calls we often receive the offer BEFORE the callee
          // has accepted and created an RTCPeerConnection. In that case we
          // stash it and apply it once the peer connection exists.
          if (!pcRef.current) {
            pendingOfferRef.current = signal.data as RTCSessionDescriptionInit;
            return;
          }
          setPhase("connecting");
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(signal.data),
          );
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          await hub.sendCallSignal({
            callId: signal.callId,
            toUserId: signal.fromUserId,
            type: "answer",
            data: answer,
          });
        } else if (signal.type === "answer") {
          if (!pc) return;
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.data),
          );
          setPhase("in-call");
        } else if (signal.type === "ice-candidate" && signal.data) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data));
        }
      } catch (err) {
        console.error("Error handling call signal", err);
        setError("Connection error");
        setPhase("error");
      }
    });

    return () => {
      offIncoming();
      offCallEnded();
      offCallSignal();
    };
  }, [callId, channelId, cleanup, currentUserId]);

  // Helper: create RTCPeerConnection and hook up tracks/callbacks
  const ensurePeerConnection = useCallback(
    (stream: MediaStream) => {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      // Send our tracks
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // When we receive remote tracks
      pc.ontrack = (evt) => {
        const [remote] = evt.streams;
        if (remote) setRemoteStream(remote);
      };

      // ICE candidates → SignalR
      pc.onicecandidate = (evt) => {
        if (!evt.candidate || !callId) return;
        hub.sendCallSignal({
          callId,
          toUserId: isCaller ? otherUserId : otherUserId,
          type: "ice-candidate",
          data: evt.candidate,
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setPhase("in-call");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          cleanup();
        }
      };

      return pc;
    },
    [callId, cleanup, isCaller, otherUserId],
  );

  // Outgoing call
  const startCall = useCallback(
    async (k: CallKind) => {
      try {
        setError(null);
        setKind(k);
        setIsCaller(true);
        setPhase("calling");

        const constraints: MediaStreamConstraints =
          k === "video"
            ? { audio: true, video: { width: 1280, height: 720 } }
            : { audio: true, video: false };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        const localCallId = crypto.randomUUID();
        setCallId(localCallId);

        const pc = ensurePeerConnection(stream);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await hub.startCall({
          callId: localCallId,
          channelId,
          fromUserId: currentUserId,
          toUserId: otherUserId,
          kind: k,
          sdp: offer,
        });
      } catch (err) {
        console.error("startCall error", err);
        setError("Could not start call");
        setPhase("error");
      }
    },
    [channelId, currentUserId, ensurePeerConnection, otherUserId],
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!callId || !kind) return;
    try {
      setPhase("connecting");
      const constraints: MediaStreamConstraints =
        kind === "video"
          ? { audio: true, video: { width: 1280, height: 720 } }
          : { audio: true, video: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      const pc = ensurePeerConnection(stream);

      // If we previously received an SDP offer before the user clicked
      // "accept", apply it now and generate/send the answer.
      if (pendingOfferRef.current) {
        const offer = pendingOfferRef.current;
        pendingOfferRef.current = null;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await hub.sendCallSignal({
          callId,
          toUserId: otherUserId,
          type: "answer",
          data: answer,
        });
      }

      await hub.acceptCall({ callId, channelId });
    } catch (err) {
      console.error("acceptCall error", err);
      setError("Could not accept call");
      setPhase("error");
    }
  }, [callId, channelId, ensurePeerConnection, kind]);

  const rejectCall = useCallback(async () => {
    if (!callId) return;
    try {
      await hub.rejectCall({ callId, channelId });
      cleanup();
    } catch (err) {
      console.error("rejectCall error", err);
      setError("Could not reject call");
      setPhase("error");
    }
  }, [callId, channelId, cleanup]);

  const hangUp = useCallback(async () => {
    if (!callId) {
      cleanup();
      return;
    }
    try {
      await hub.endCall({ callId, channelId });
    } catch (err) {
      console.error("hangUp error", err);
    } finally {
      cleanup();
    }
  }, [callId, channelId, cleanup]);

  return {
    phase,
    kind,
    callId,
    isCaller,
    error,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
  };
}


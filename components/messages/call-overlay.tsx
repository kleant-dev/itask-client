"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import type { UserModel } from "@/types/models";
import type { CallKind, CallPhase } from "@/lib/hooks/use-call";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CallOverlayProps {
  otherUser: UserModel;
  kind: CallKind;
  phase: CallPhase;
  isCaller: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onAccept: () => void;
  onReject: () => void;
  onHangUp: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CallOverlay({
  otherUser,
  kind,
  phase,
  isCaller,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onHangUp,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  const isVideo = kind === "video";
  const isRinging = phase === "ringing";
  const isCalling = phase === "calling";
  const isInCall = phase === "in-call" || phase === "connecting";

  let subtitle = "";
  if (isCalling) subtitle = isVideo ? "Calling (video)..." : "Calling...";
  else if (isRinging) subtitle = isVideo ? "Incoming video call" : "Incoming call";
  else if (isInCall) subtitle = isVideo ? "Video call in progress" : "Call in progress";

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
      <div
        className="relative flex flex-col items-center justify-between bg-white text-[#111625]"
        style={{
          width: isVideo ? 560 : 360,
          height: isVideo ? 360 : 220,
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.25)",
        }}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar style={{ width: 40, height: 40 }}>
              <AvatarImage src={otherUser.avatarUrl ?? undefined} />
              <AvatarFallback
                className="text-[13px] font-medium text-white"
                style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
              >
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium" style={{ fontSize: 16 }}>
                {otherUser.name}
              </p>
              <p className="text-[13px] text-[#596881]">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Video stage / avatar */}
        <div className="flex-1 flex items-center justify-center w-full mb-4">
          {isVideo ? (
            <div className="relative flex w-full h-full items-center justify-center overflow-hidden rounded-2xl bg-black/80">
              {/* Remote */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Local picture-in-picture */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-4 right-4 w-32 h-20 rounded-xl object-cover border border-white/40 shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Avatar style={{ width: 72, height: 72 }}>
                <AvatarImage src={otherUser.avatarUrl ?? undefined} />
                <AvatarFallback
                  className="text-[18px] font-medium text-white"
                  style={{ backgroundColor: otherUser.avatarColor ?? "#266df0" }}
                >
                  {getInitials(otherUser.name)}
                </AvatarFallback>
              </Avatar>
              {/* Hidden audio element to play the remote audio stream */}
              <audio ref={remoteAudioRef} autoPlay />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex w-full items-center justify-center gap-4">
          {isRinging && (
            <button
              onClick={onAccept}
              className="flex items-center gap-2 rounded-full bg-[#22c55e] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#16a34a] transition-colors"
            >
              {isVideo ? (
                <Video style={{ width: 16, height: 16 }} />
              ) : (
                <Phone style={{ width: 16, height: 16 }} />
              )}
              Accept
            </button>
          )}

          {(isRinging || isCalling || isInCall) && (
            <button
              onClick={isRinging ? onReject : onHangUp}
              className="flex items-center gap-2 rounded-full bg-[#ef4444] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#dc2626] transition-colors"
            >
              {isRinging ? (
                <PhoneOff style={{ width: 16, height: 16 }} />
              ) : (
                <PhoneOff style={{ width: 16, height: 16 }} />
              )}
              {isRinging ? "Decline" : "End call"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


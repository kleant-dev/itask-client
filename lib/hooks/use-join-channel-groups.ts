import { useEffect, useRef } from "react";
import { joinChannel } from "@/lib/services/chat-hub";
import { ensureChatRealtimeHandlers } from "@/lib/services/chat-realtime";

/**
 * Joins SignalR groups for all DM channels so typing, read receipts, and
 * channel-group broadcasts work while the messages UI is open.
 * (ReceiveMessage also reaches clients via per-user groups on the server.)
 */
export function useJoinChannelGroups(channelIds: string[]) {
  const joinedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (channelIds.length === 0) return;

    let cancelled = false;

    const run = async () => {
      await ensureChatRealtimeHandlers();
      for (const id of channelIds) {
        if (cancelled) return;
        if (joinedRef.current.has(id)) continue;
        try {
          await joinChannel(id);
          joinedRef.current.add(id);
        } catch {
          // retry on next channel list change
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [channelIds.join(",")]);
}

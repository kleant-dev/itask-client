import { useQuery } from "@tanstack/react-query";
import { channelsApi } from "@/lib/api/messages";
import { useUiStore } from "@/lib/stores/ui-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useEffect } from "react";

export function useChannelUnreadSummary() {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);

  const query = useQuery({
    queryKey: ["channel-unread-summary", workspaceId],
    queryFn: () => channelsApi.getUnreadSummary(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const serverCounts: Record<string, number> = {};
    for (const ch of query.data.channels) {
      serverCounts[ch.channelId] = ch.unreadCount;
    }
    const session = useChatStore.getState().unreadCounts;
    const merged = { ...serverCounts };
    for (const [id, n] of Object.entries(session)) {
      merged[id] = Math.max(merged[id] ?? 0, n);
    }
    setUnreadCounts(merged);
  }, [query.data, setUnreadCounts]);

  return query;
}

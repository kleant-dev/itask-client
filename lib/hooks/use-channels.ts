// lib/hooks/use-channels.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelsApi } from "@/lib/api/messages";
import { useUiStore } from "@/lib/stores/ui-store";
import type { ChannelModel } from "@/types/message-models";
import type { PagedResponse } from "@/types/api";
import { WorkspaceMemberModel } from "@/types/models";
import { workspacesApi } from "../api/workspaces";

export function useWorkspaceChannels() {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);

  return useQuery<PagedResponse<ChannelModel>>({
    queryKey: ["workspace-channels", workspaceId],
    queryFn: () => channelsApi.getByWorkspace(workspaceId!, { pageSize: 100 }),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers() {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  return useQuery<PagedResponse<WorkspaceMemberModel>>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspacesApi.getMembers(workspaceId!, { pageSize: 100 }),
    enabled: !!workspaceId,
  });
}

export function useGetOrCreateDm() {
  const queryClient = useQueryClient();
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);

  return useMutation({
    mutationFn: (otherUserId: string) =>
      channelsApi.getOrCreateDm(workspaceId!, otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-channels", workspaceId],
      });
    },
  });
}

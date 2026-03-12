import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import type { WorkspaceModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import { useUiStore } from "@/lib/stores/ui-store";

export function useWorkspaces() {
  const currentWorkspaceId = useUiStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspaceId = useUiStore((s) => s.setCurrentWorkspaceId);

  const query = useQuery<PagedResponse<WorkspaceModel>>({
    queryKey: ["workspaces"],
    queryFn: () =>
      workspacesApi.getMyWorkspaces({
        pageNumber: 1,
        pageSize: 20,
        sort: "createdAtUtc:desc",
      }),
  });

  const workspaces = query.data?.items ?? [];
  const activeWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  useEffect(() => {
    if (!currentWorkspaceId && activeWorkspace) {
      setCurrentWorkspaceId(activeWorkspace.id);
    }
  }, [currentWorkspaceId, activeWorkspace, setCurrentWorkspaceId]);

  return {
    ...query,
    workspaces,
    activeWorkspace,
    currentWorkspaceId,
    setCurrentWorkspaceId,
  };
}


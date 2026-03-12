import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import type { TaskModel, TaskStatus } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import { useUiStore } from "@/lib/stores/ui-store";

export function useWorkspaceTasks(params?: {
  status?: TaskStatus;
  pageNumber?: number;
  pageSize?: number;
}) {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  const { status, pageNumber = 1, pageSize = 50 } = params ?? {};

  return useQuery<PagedResponse<TaskModel>>({
    queryKey: ["workspace-tasks", workspaceId, status, pageNumber, pageSize],
    queryFn: () =>
      tasksApi.getWorkspaceTasks(workspaceId!, {
        status,
        pageNumber,
        pageSize,
      }),
    enabled: !!workspaceId,
  });
}


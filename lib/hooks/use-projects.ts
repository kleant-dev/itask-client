import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import type { ProjectModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";

interface UseWorkspaceProjectsParams {
  workspaceId: string | null | undefined;
  pageNumber?: number;
  pageSize?: number;
  sort?: string;
}

export function useWorkspaceProjects({
  workspaceId,
  pageNumber = 1,
  pageSize = 20,
  sort = "createdAtUtc:desc",
}: UseWorkspaceProjectsParams) {
  return useQuery<PagedResponse<ProjectModel>>({
    queryKey: ["workspace-projects", workspaceId, pageNumber, pageSize, sort],
    queryFn: () =>
      projectsApi.getWorkspaceProjects(workspaceId!, {
        pageNumber,
        pageSize,
        sort,
      }),
    enabled: !!workspaceId,
  });
}


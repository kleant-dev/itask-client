import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { tasksApi } from "@/lib/api/tasks";
import type { ProjectModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import { useUiStore } from "@/lib/stores/ui-store";

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

export function useProject(projectId: string | undefined) {
  return useQuery<ProjectModel>({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });
}

/** Tasks in a project (filtered from workspace task list; API has no project filter yet). */
export function useProjectTasks(projectId: string | undefined) {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);

  return useQuery({
    queryKey: ["project-tasks", workspaceId, projectId],
    queryFn: async () => {
      const data = await tasksApi.getWorkspaceTasks(workspaceId!, {
        projectId: projectId!,
        pageNumber: 1,
        pageSize: 50,
      });

      return {
        ...data,
        items: data.items.filter((t) => t.projectId === projectId),
      };
    },
    enabled: !!workspaceId && !!projectId,
  });
}

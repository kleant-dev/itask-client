"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ProjectToolbar } from "@/components/projects/project-toolbar";
import type { ProjectViewMode } from "@/components/projects/project-toolbar";
import { ProjectKanban } from "@/components/projects/project-kanban";
import { ProjectTaskList } from "@/components/projects/project-task-list";
import { ProjectTimelinePlaceholder } from "@/components/projects/project-timeline-placeholder";
import { CreateTaskDialog } from "@/components/projects/create-task-dialog";
import {
  useProject,
  useProjectTasks,
} from "@/lib/hooks/use-projects";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { useUiStore } from "@/lib/stores/ui-store";
import type { TaskPriority } from "@/types/models";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const setCurrentWorkspaceId = useUiStore((s) => s.setCurrentWorkspaceId);
  const { activeWorkspace } = useWorkspaces();

  const { data: project, isLoading: projectLoading, error: projectError } =
    useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } =
    useProjectTasks(projectId);

  const [view, setView] = useState<ProjectViewMode>("board");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all",
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  useEffect(() => {
    if (project?.workspaceId) {
      setCurrentWorkspaceId(project.workspaceId);
    }
  }, [project?.workspaceId, setCurrentWorkspaceId]);

  const tasks = tasksData?.items ?? [];
  const workspaceId = project?.workspaceId ?? activeWorkspace?.id ?? "";

  if (projectLoading) {
    return (
      <p className="text-p-small text-neutral-500">Loading project…</p>
    );
  }

  if (projectError || !project) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-[14px] text-red-800">
        Project could not be loaded. It may not exist or you may not have
        access.
      </div>
    );
  }

  return (
    <div>
      <ProjectToolbar
        projectName={project.name}
        view={view}
        onViewChange={setView}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onNewTask={() => setTaskDialogOpen(true)}
        onShare={() => toast.message("Sharing will be available soon.")}
      />

      {tasksLoading && (
        <p className="text-p-small text-neutral-500">Loading tasks…</p>
      )}

      {!tasksLoading && view === "board" && (
        <ProjectKanban tasks={tasks} priorityFilter={priorityFilter} />
      )}

      {!tasksLoading && view === "list" && (
        <ProjectTaskList tasks={tasks} priorityFilter={priorityFilter} />
      )}

      {!tasksLoading && view === "timeline" && <ProjectTimelinePlaceholder />}

      {workspaceId && (
        <CreateTaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          projectId={project.id}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}

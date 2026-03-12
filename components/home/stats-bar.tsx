import { Layers, CheckSquare, Users, FolderCheck } from "lucide-react";
import { useWorkspaceProjects } from "@/lib/hooks/use-projects";
import { useWorkspaceTasks } from "@/lib/hooks/use-tasks";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";

export function StatsBar() {
  const { activeWorkspace } = useWorkspaces();
  const { data: projectsData } = useWorkspaceProjects({
    workspaceId: activeWorkspace?.id,
    pageSize: 100,
  });
  const { data: tasksData } = useWorkspaceTasks({
    pageSize: 200,
  });

  const projects = projectsData?.items ?? [];
  const tasks = tasksData?.items ?? [];

  const projectsRunning = projects.filter(
    (p) => p.status !== "Completed" && p.status !== "Archived",
  ).length;
  const projectsDone = projects.filter((p) => p.status === "Completed").length;

  const membersApprox = activeWorkspace ? 0 : 0; // could be filled via workspace members API if needed

  const stats = [
    { icon: Layers, label: "Projects Running", value: projectsRunning },
    { icon: CheckSquare, label: "Tasks", value: tasks.length },
    { icon: Users, label: "Members", value: membersApprox },
    { icon: FolderCheck, label: "Projects Done", value: projectsDone },
  ];

  return (
    <div className="grid  grid-cols-4 divide-x divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex flex-col gap-3 p-6">
            <Icon className="h-5 w-5 text-primary-500" strokeWidth={1.5} />
            <div>
              <div className="text-h3 font-semibold leading-none text-neutral-900">
                {stat.value}
              </div>
              <div className="mt-1 text-p-small text-neutral-500">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
